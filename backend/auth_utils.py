import os
import requests
from typing import Optional

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from dotenv import load_dotenv

# Local Imports
from models.user_model import User

load_dotenv()

# Clerk Configuration
CLERK_FRONTEND_API = os.getenv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY")
CLERK_API_KEY = os.getenv("CLERK_SECRET_KEY")
CLERK_JWKS_URL = os.getenv("CLERK_JWKS_URL")

security = HTTPBearer()

# Cache for JSON Web Key Set (JWKS) to avoid fetching it on every request
_jwks_cache = None

def get_jwks():
    """ Fetch the public keys from Clerk to verify the JWT. """
    global _jwks_cache
    if _jwks_cache is None:
        response = requests.get(CLERK_JWKS_URL)
        if response.status_code == 200:
            _jwks_cache = response.json()
        else:
            raise Exception("Failed to fetch JWKS from Clerk")
    return _jwks_cache

async def get_current_user(token: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Verifies the JWT token from Clerk and returns the user payload.
    This acts as our 'Auth Guard'.
    """
    jwks = get_jwks()
    try:
        # 1. Decode and verify the token
        payload = jwt.decode(
            token.credentials,
            jwks,
            algorithms=["RS256"],
            options={"verify_aud": False} # Clerk uses specific audience formats
        )
        # 2. Extract common fields
        return {
            "id": payload.get("sub"),
            "email": payload.get("email") or payload.get("emails", [None])[0]
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid authentication token: {str(e)}")

async def sync_user_to_db(clerk_user: dict, db: AsyncSession) -> User:
    """
    Ensures that the Clerk User exists in our local MySQL database.
    If not, we create them (Lazy Sync).
    """
    user_id = clerk_user["id"]
    email = clerk_user["email"]

    # 1. Look for user (⚡ Async 2.0 Syntax)
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()

    if not user:
        # Generate a unique referral code for the new user
        import random
        import string
        unique_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        
        user = User(
            id=user_id,
            email=email,
            subscription_tier='free',
            generations_limit=5,
            referral_code=unique_code
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return user
