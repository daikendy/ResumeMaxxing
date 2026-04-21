from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from models.vault_model import VaultSnapshot, ActivityLog
from typing import List

async def log_activity(db: AsyncSession, user_id: str, action_code: str, description: str):
    """Log a system action to the HUD telemetry feed."""
    new_log = ActivityLog(
        user_id=user_id,
        action_code=action_code,
        description=description
    )
    db.add(new_log)
    await db.commit()
    return new_log

async def get_recent_activity(db: AsyncSession, user_id: str, limit: int = 10) -> List[ActivityLog]:
    """Fetch recent telemetry for the HUD activity feed."""
    result = await db.execute(
        select(ActivityLog)
        .filter(ActivityLog.user_id == user_id)
        .order_by(desc(ActivityLog.timestamp))
        .limit(limit)
    )
    return result.scalars().all()

async def create_snapshot(db: AsyncSession, user_id: str, name: str, data: dict):
    """Store a new snapshot in the Master Vault."""
    snapshot = VaultSnapshot(
        user_id=user_id,
        name=name,
        resume_data=data
    )
    db.add(snapshot)
    await db.commit()
    await db.refresh(snapshot)
    return snapshot

async def get_snapshots(db: AsyncSession, user_id: str) -> List[VaultSnapshot]:
    """List all vaulted items for a user."""
    result = await db.execute(
        select(VaultSnapshot)
        .filter(VaultSnapshot.user_id == user_id)
        .order_by(desc(VaultSnapshot.created_at))
    )
    return result.scalars().all()

async def get_snapshot_by_id(db: AsyncSession, snapshot_id: int, user_id: str):
    """Retrieve a specific vaulted item."""
    result = await db.execute(
        select(VaultSnapshot)
        .filter(VaultSnapshot.id == snapshot_id, VaultSnapshot.user_id == user_id)
    )
    return result.scalars().first()

async def delete_snapshot(db: AsyncSession, snapshot_id: int, user_id: str):
    """Permanently scrub a snapshot from the vault."""
    snapshot = await get_snapshot_by_id(db, snapshot_id, user_id)
    if snapshot:
        await db.delete(snapshot)
        await db.commit()
        return True
    return False
