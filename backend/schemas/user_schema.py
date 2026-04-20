from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# 1. What Next.js sends when a user signs up
class UserCreate(BaseModel):
    id: str # The UUID from your auth provider
    email: EmailStr

# 2. What Python returns to Next.js (Notice we hide sensitive DB data if needed)
class UserResponse(BaseModel):
    id: str
    email: EmailStr
    subscription_tier: str
    generations_used: int
    generations_limit: int
    referral_code: Optional[str] = None
    referred_by: Optional[str] = None
    bonus_quota: int = 0
    created_at: datetime

    class Config:
        from_attributes = True # This tells Pydantic to read the SQLAlchemy model perfectly

class RedeemCodeRequest(BaseModel):
    code: str