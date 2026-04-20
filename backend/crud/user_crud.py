import uuid
import string
import random
from sqlalchemy.orm import Session
from models.user_model import User
from schemas.user_schema import UserCreate

def generate_referral_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

# Read
def get_user(db: Session, user_id: str):
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user_by_referral_code(db: Session, code: str):
    return db.query(User).filter(User.referral_code == code).first()

# Create
def create_user(db: Session, user: UserCreate):
    # Generate unique referral code
    unique_code = generate_referral_code()
    # Basic collision check (unlikely with 6 chars but good practice)
    while db.query(User).filter(User.referral_code == unique_code).first():
        unique_code = generate_referral_code()

    db_user = User(
        id=user.id, 
        email=user.email,
        referral_code=unique_code
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Referral Logic
def redeem_referral_code(db: Session, current_user_id: str, code: str):
    # 1. Verification: Does code exist?
    inviter = get_user_by_referral_code(db, code)
    if not inviter:
        return {"success": False, "message": "INVALID_CODE"}
    
    # 2. Security: No self-referral
    if inviter.id == current_user_id:
        return {"success": False, "message": "SELF_REFERRAL_PROTECTION"}
    
    # 3. Check if user already has a referrer
    invitee = get_user(db, current_user_id)
    if not invitee or invitee.referred_by:
        return {"success": False, "message": "ALREADY_REFERRED"}

    # 4. Atomic rewards (+5 for both)
    inviter.bonus_quota += 5
    invitee.bonus_quota += 5
    invitee.referred_by = inviter.id
    
    db.commit()
    return {"success": True, "message": "REFERRAL_SUCCESS"}

# Delete
def delete_user(db: Session, user_id: str):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
        return True
    return False