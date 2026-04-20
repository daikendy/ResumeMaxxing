from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
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
async def generate_tailored_resume(payload: ResumeCreate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    
    # 1. Ensure User is synced
    user = sync_user_to_db(current_user, db)
    
    total_allowed = user.generations_limit + user.bonus_quota
    if user.generations_used >= total_allowed:
        raise QuotaExceededException()

    # 2. Fetch the Job Description
    job = db.query(TrackedJob).filter(TrackedJob.id == payload.tracked_job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # 3. Call the AI Engine (Awaited because it's an async network call)
    tailored_content = await tailor_resume(
        raw_resume=payload.raw_resume_data,
        job_description=job.job_description,
        job_title=job.job_title
    )

    # 4. Calculate the new Version Number (The LIFO Stack Logic)
    existing_versions = db.query(ResumeVersion).filter(ResumeVersion.tracked_job_id == job.id).count()
    new_version_number = existing_versions + 1

    # 5. Deactivate old versions so only the newest is "active"
    db.query(ResumeVersion).filter(ResumeVersion.tracked_job_id == job.id).update({"is_active": False})

    # 6. Push the new version to the database
    new_resume = ResumeVersion(
        tracked_job_id=job.id,
        user_id=user.id,
        resume_content=tailored_content,
        version_number=new_version_number,
        is_active=True
    )
    
    # 7. Update User Quota and Commit
    user.generations_used += 1
    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)

    return new_resume