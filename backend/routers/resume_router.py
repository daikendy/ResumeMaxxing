from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession

# Local Imports
from auth_utils import get_current_user, sync_user_to_db
from database import get_db
from models.job_model import TrackedJob
from models.resume_model import ResumeVersion
from models.user_model import User
from schemas.resume_schema import ResumeCreate, ResumeResponse
from services.ai_service import tailor_resume
from utils.exceptions import QuotaExceededException
from utils.limiter import limiter
from crud import vault_crud

router = APIRouter(prefix="/resumes", tags=["Resumes"])

@router.post("/generate", response_model=ResumeResponse)
@limiter.limit("10/minute") # 🛡️ Shield active
async def generate_tailored_resume(request: Request, payload: ResumeCreate, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """
    Takes the user's master profile and a tracked job, 
    calls OpenAI to tailor the resume, and saves the result.
    """
    # 1. Ensure User is synced
    user = await sync_user_to_db(current_user, db)
    
    total_allowed = user.generations_limit + user.bonus_quota
    if user.generations_used >= total_allowed:
        raise QuotaExceededException()

    # 2. Fetch the Job Description
    result = await db.execute(select(TrackedJob).filter(TrackedJob.id == payload.tracked_job_id))
    job = result.scalars().first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # 3. Call the AI Engine
    tailored_content = await tailor_resume(
        raw_resume=payload.raw_resume_data,
        job_description=job.job_description,
        job_title=job.job_title
    )

    # 4. Calculate Version Number
    count_result = await db.execute(select(func.count(ResumeVersion.id)).filter(ResumeVersion.tracked_job_id == job.id))
    existing_versions = count_result.scalar() or 0
    new_version_number = existing_versions + 1

    # 5. Deactivate old versions for this job
    await db.execute(
        update(ResumeVersion)
        .where(ResumeVersion.tracked_job_id == job.id)
        .values(is_active=False)
    )

    # 6. Save the new version
    new_resume = ResumeVersion(
        tracked_job_id=job.id,
        user_id=user.id,
        resume_content=tailored_content,
        version_number=new_version_number,
        is_active=True,
        created_at=datetime.utcnow()
    )
    
    # 7. Update User stats, log activity and commit
    user.generations_used += 1
    db.add(new_resume)
    
    await vault_crud.log_activity(
        db, user.id, "ZAP_GENERATED", 
        f"Tailored Resume generated for {job.job_title} @ {job.company_name}"
    )
    
    await db.commit()
    await db.refresh(new_resume)

    return new_resume