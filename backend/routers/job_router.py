from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.job_model import TrackedJob
from schemas.job_schema import JobCreate, JobResponse

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.get("/{user_id}", response_model=List[JobResponse])
def get_user_jobs(user_id: str, db: Session = Depends(get_db)):
    """Fetch all tracked jobs for a specific user."""
    return db.query(TrackedJob).filter(TrackedJob.user_id == user_id).order_by(TrackedJob.created_at.desc()).all()

@router.post("/", response_model=JobResponse)
def create_job(payload: JobCreate, db: Session = Depends(get_db)):
    """Create a new tracked job with a 3-job limit check."""
    
    # 1. Enforce the V1 Limit
    job_count = db.query(TrackedJob).filter(TrackedJob.user_id == payload.user_id).count()
    if job_count >= 3:
        raise HTTPException(
            status_code=403, 
            detail="FREE TIER LIMIT: You have reached the maximum of 3 tracked jobs. Please upgrade to Pro for unlimited tracks."
        )
    
    # 2. Create the job
    db_job = TrackedJob(
        user_id=payload.user_id,
        company_name=payload.company_name,
        job_title=payload.job_title,
        job_description=payload.job_description,
        status='bookmarked'
    )
    
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job
