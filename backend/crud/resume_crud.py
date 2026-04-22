from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.master_resume_model import MasterResume
from utils.sanitization import sanitize_data

async def get_master_resume(db: AsyncSession, user_id: str):
    """Retrieve the master profile for a pilot."""
    result = await db.execute(select(MasterResume).filter(MasterResume.user_id == user_id))
    return result.scalars().first()

async def upsert_master_resume(db: AsyncSession, user_id: str, data: dict):
    """Save or Restore a master profile into the active slot."""
    db_resume = await get_master_resume(db, user_id)
    
    sanitized = sanitize_data(data)
    
    if db_resume:
        db_resume.resume_data = sanitized
    else:
        db_resume = MasterResume(user_id=user_id, resume_data=sanitized)
        db.add(db_resume)
    
    await db.commit()
    await db.refresh(db_resume)
    return db_resume
