from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.job_model import TrackedJob
from schemas.job_schema import JobCreate, JobResponse

from auth_utils import get_current_user

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.get("/{user_id}", response_model=List[JobResponse])
def get_user_jobs(user_id: str, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """Fetch all tracked jobs for the authenticated user, ignoring the URL param in favor of the token identity."""
    return db.query(TrackedJob).filter(TrackedJob.user_id == current_user).order_by(TrackedJob.created_at.desc()).all()

@router.get("/track/{job_id}", response_model=JobResponse)
def get_job_by_id(job_id: int, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """Fetch a single tracked job for the authenticated user."""
    job = db.query(TrackedJob).filter(TrackedJob.id == job_id, TrackedJob.user_id == current_user).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job track not found or unauthorized access")
    return job

@router.post("/", response_model=JobResponse)
def create_job(payload: JobCreate, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a new tracked job for the authenticated user with a 3-job limit check."""
    
    # 1. Enforce the V1 Limit
    job_count = db.query(TrackedJob).filter(TrackedJob.user_id == current_user).count()
    if job_count >= 3:
        raise HTTPException(
            status_code=403, 
            detail="FREE TIER LIMIT: You have reached the maximum of 3 tracked jobs. Please upgrade to Pro for unlimited tracks."
        )
    
    # 2. Create the job
    db_job = TrackedJob(
        user_id=current_user,
        company_name=payload.company_name,
        job_title=payload.job_title,
        job_description=payload.job_description,
        status='bookmarked'
    )
    
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job
