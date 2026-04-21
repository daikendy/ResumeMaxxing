from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update
from database import get_db
from schemas.resume_schema import ResumeCreate, ResumeResponse
from models.user_model import User
from models.resume_model import ResumeVersion
from models.job_model import TrackedJob
from services.ai_service import tailor_resume

from auth_utils import get_current_user, sync_user_to_db

router = APIRouter(prefix="/resumes", tags=["Resumes"])

from utils.exceptions import QuotaExceededException

@router.post("/generate", response_model=ResumeResponse)
async def generate_tailored_resume(payload: ResumeCreate, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    
    # 1. Ensure User is synced (⚡ Awaited Async Sync)
    user = await sync_user_to_db(current_user, db)
    
    total_allowed = user.generations_limit + user.bonus_quota
    if user.generations_used >= total_allowed:
        raise QuotaExceededException()

    # 2. Fetch the Job Description (⚡ Async 2.0 Query)
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

    # 4. Calculate Version (⚡ Async Count)
    count_result = await db.execute(select(func.count(ResumeVersion.id)).filter(ResumeVersion.tracked_job_id == job.id))
    existing_versions = count_result.scalar() or 0
    new_version_number = existing_versions + 1

    # 5. Deactivate old versions (⚡ Async Update)
    await db.execute(
        update(ResumeVersion)
        .where(ResumeVersion.tracked_job_id == job.id)
        .values(is_active=False)
    )

    # 6. Push new version
    new_resume = ResumeVersion(
        tracked_job_id=job.id,
        user_id=user.id,
        resume_content=tailored_content,
        version_number=new_version_number,
        is_active=True
    )
    
    # 7. Update User and Commit
    user.generations_used += 1
    db.add(new_resume)
    await db.commit()
    await db.refresh(new_resume)

    return new_resume