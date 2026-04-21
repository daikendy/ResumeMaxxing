import random
import string
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.user_model import User
from schemas.user_schema import UserCreate

def generate_referral_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

# Read
async def get_user(db: AsyncSession, user_id: str):
    result = await db.execute(select(User).filter(User.id == user_id))
    return result.scalars().first()

async def get_user_by_email(db: AsyncSession, email: str):
    result = await db.execute(select(User).filter(User.email == email))
    return result.scalars().first()

async def get_user_by_referral_code(db: AsyncSession, code: str):
    result = await db.execute(select(User).filter(User.referral_code == code))
    return result.scalars().first()

# Create
async def create_user(db: AsyncSession, user: UserCreate):
    # Generate unique referral code
    unique_code = generate_referral_code()
    
    # ⚡ ASYNC COLLISION CHECK (SQLAlchemy 2.0)
    while True:
        result = await db.execute(select(User).filter(User.referral_code == unique_code))
        if not result.scalars().first():
            break
        unique_code = generate_referral_code()

    db_user = User(
        id=user.id, 
        email=user.email,
        referral_code=unique_code
    )
    
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

# Referral Logic
async def redeem_referral_code(db: AsyncSession, current_user_id: str, code: str):
    # 1. Verification: Does code exist?
    inviter = await get_user_by_referral_code(db, code)
    if not inviter:
        return {"success": False, "message": "INVALID_CODE"}
    
    # 2. Security: No self-referral
    if inviter.id == current_user_id:
        return {"success": False, "message": "SELF_REFERRAL_PROTECTION"}
    
    # 3. Check if user already has a referrer
    invitee = await get_user(db, current_user_id)
    if not invitee or invitee.referred_by:
        return {"success": False, "message": "ALREADY_REFERRED"}

    # 4. Atomic rewards (+5 for both)
    inviter.bonus_quota += 5
    invitee.bonus_quota += 5
    invitee.referred_by = inviter.id
    
    await db.commit()
    return {"success": True, "message": "REFERRAL_SUCCESS"}

# Delete
async def delete_user(db: AsyncSession, user_id: str):
    result = await db.execute(select(User).filter(User.id == user_id))
    db_user = result.scalars().first()
    if db_user:
        await db.delete(db_user)
        await db.commit()
        return True
    return False