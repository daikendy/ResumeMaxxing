from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.job_model import TrackedJob
from schemas.job_schema import JobCreate, JobResponse

from auth_utils import get_current_user, sync_user_to_db

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.get("/", response_model=List[JobResponse])
def get_user_jobs(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Fetch all tracked jobs for the authenticated user, automatically syncing the user record first."""
    sync_user_to_db(current_user, db)
    return db.query(TrackedJob).filter(TrackedJob.user_id == current_user["id"]).order_by(TrackedJob.created_at.desc()).all()

@router.get("/track/{job_id}", response_model=JobResponse)
def get_job_by_id(job_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Fetch a single tracked job, ensuring the user record is synced."""
    sync_user_to_db(current_user, db)
    job = db.query(TrackedJob).filter(TrackedJob.id == job_id, TrackedJob.user_id == current_user["id"]).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job track not found or unauthorized access")
    return job

from utils.exceptions import LimitReachedException

@router.post("/", response_model=JobResponse)
def create_job(payload: JobCreate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a new job for the user, syncing their record and enforcing limits."""
    sync_user_to_db(current_user, db)
    user_id = current_user["id"]
    
    # 1. Enforce the V1 Limit
    from models.user_model import User
    db_user = db.query(User).filter(User.id == user_id).first()
    total_quota = (db_user.generations_limit + db_user.bonus_quota) if db_user else 5
    
    job_count = db.query(TrackedJob).filter(TrackedJob.user_id == user_id).count()
    if job_count >= total_quota:
        raise LimitReachedException(f"TIER LIMIT: You have reached your limit of {total_quota} tracked jobs. Invite friends or upgrade to Pro for more.")
    
    # 2. Create the job
    db_job = TrackedJob(
        user_id=user_id,
        company_name=payload.company_name,
        job_title=payload.job_title,
        job_description=payload.job_description,
        status='bookmarked'
    )
    
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

@router.delete("/{job_id}")
def delete_tracked_job(job_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Delete a tracked job and all its associated resume versions. Restricted to the job owner."""
    sync_user_to_db(current_user, db)
    job = db.query(TrackedJob).filter(TrackedJob.id == job_id, TrackedJob.user_id == current_user["id"]).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or access denied")
        
    db.delete(job)
    db.commit()
    return {"status": "success", "message": f"Job {job_id} and associated resumes deleted"}
