from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select, desc, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

# Local Imports
from auth_utils import get_current_user, sync_user_to_db
from database import get_db
from models.job_model import TrackedJob
from models.user_model import User
from schemas.job_schema import JobCreate, JobResponse, JobUpdate
from utils.exceptions import LimitReachedException
from utils.sanitization import sanitize_text
from utils.limiter import limiter
from crud import vault_crud

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.get("/", response_model=List[JobResponse])
async def get_user_jobs(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Fetch all tracked jobs for the authenticated user."""
    await sync_user_to_db(current_user, db)
    
    result = await db.execute(
        select(TrackedJob)
        .options(selectinload(TrackedJob.resume_versions))
        .filter(TrackedJob.user_id == current_user["id"])
        .order_by(desc(TrackedJob.created_at))
    )
    return result.scalars().all()

@router.get("/track/{job_id}", response_model=JobResponse)
async def get_job_by_id(job_id: int, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Fetch a single tracked job."""
    await sync_user_to_db(current_user, db)
    
    result = await db.execute(
        select(TrackedJob)
        .options(selectinload(TrackedJob.resume_versions))
        .filter(TrackedJob.id == job_id, TrackedJob.user_id == current_user["id"])
    )
    job = result.scalars().first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job track not found or unauthorized access")
    return job

@router.post("/", response_model=JobResponse)
@limiter.limit("30/minute") # 🛡️ Guard active 
async def create_job(request: Request, payload: JobCreate, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Create a new job for the user."""
    await sync_user_to_db(current_user, db)
    user_id = current_user["id"]
    
    # 1. Enforce the V1 Limit
    result = await db.execute(select(User).filter(User.id == user_id))
    db_user = result.scalars().first()
    total_quota = (db_user.generations_limit + db_user.bonus_quota) if db_user else 5
    
    count_result = await db.execute(
        select(func.count(TrackedJob.id)).filter(TrackedJob.user_id == user_id)
    )
    job_count = count_result.scalar() or 0
    
    if job_count >= total_quota:
        raise LimitReachedException(f"TIER LIMIT: You have reached your limit of {total_quota} tracked jobs. Invite friends or upgrade to Pro for more.")
    
    # 2. Create the job (Sanitized)
    db_job = TrackedJob(
        user_id=user_id,
        company_name=sanitize_text(payload.company_name),
        job_title=sanitize_text(payload.job_title),
        job_description=sanitize_text(payload.job_description),
        job_url=payload.job_url,
        status='bookmarked'
    )
    
    db.add(db_job)
    
    await vault_crud.log_activity(
        db, user_id, "TARGET_ACQUIRED", 
        f"New Target: {db_job.job_title} @ {db_job.company_name}"
    )
    
    await db.commit()
    await db.refresh(db_job)
    return db_job

@router.delete("/{job_id}")
async def delete_tracked_job(job_id: int, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Delete a tracked job and its versions."""
    await sync_user_to_db(current_user, db)
    
    result = await db.execute(
        select(TrackedJob).filter(TrackedJob.id == job_id, TrackedJob.user_id == current_user["id"])
    )
    job = result.scalars().first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or access denied")
        
    await db.delete(job)
    await db.commit()
    return {"status": "success", "message": f"Job {job_id} and associated resumes deleted"}

@router.patch("/{job_id}", response_model=JobResponse)
async def update_tracked_job(job_id: int, payload: JobUpdate, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Update a tracked job (e.g., status, job_url)."""
    await sync_user_to_db(current_user, db)
    
    result = await db.execute(
        select(TrackedJob)
        .options(selectinload(TrackedJob.resume_versions)) # ⚡ Fix: Eager load relationships
        .filter(TrackedJob.id == job_id, TrackedJob.user_id == current_user["id"])
    )
    job = result.scalars().first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or access denied")
    
    # Apply updates dynamically
    if payload.status is not None:
        job.status = payload.status
    if payload.job_url is not None:
        job.job_url = payload.job_url
    if payload.job_title is not None:
        job.job_title = sanitize_text(payload.job_title)
    if payload.company_name is not None:
        job.company_name = sanitize_text(payload.company_name)
    
    # Log status update if changed
    if payload.status is not None:
         await vault_crud.log_activity(
            db, current_user["id"], "TARGET_STATUS_UPDATED", 
            f"Target Status: {job.job_title} -> {payload.status.upper()}"
        )
    
    await db.commit()
    await db.refresh(job)
    return job
