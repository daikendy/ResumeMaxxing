import os
import time
import httpx
from typing import Optional

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
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

# 🛡️ JWKS CACHE STATE
_jwks_cache = None
_jwks_last_fetched = 0
JWKS_TTL = 86400  # 24 Hours

async def _fetch_jwks() -> dict:
    """ Performs the actual asynchronous fetch from Clerk. """
    async with httpx.AsyncClient() as client:
        response = await client.get(CLERK_JWKS_URL)
        if response.status_code == 200:
            return response.json()
        raise Exception(f"Failed to fetch JWKS: {response.status_code}")

async def get_jwks(force_refresh: bool = False) -> dict:
    """ 
    Fetches the public keys from Clerk with 24h TTL cache.
    Supports 'force_refresh' for handling rotated keys.
    """
    global _jwks_cache, _jwks_last_fetched
    
    now = time.time()
    if force_refresh or _jwks_cache is None or (now - _jwks_last_fetched) > JWKS_TTL:
        _jwks_cache = await _fetch_jwks()
        _jwks_last_fetched = now
        
    return _jwks_cache

async def get_current_user(token: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Verifies the JWT token from Clerk and returns the user payload.
    Implements a 'Refresh on Miss' strategy for rotated keys.
    """
    jwks = await get_jwks()
    
    try:
        # 1. First Attempt: Standard Verification
        payload = jwt.decode(
            token.credentials,
            jwks,
            algorithms=["RS256"],
            options={"verify_aud": False}
        )
    except JWTError:
        # 2. Key Rotation Fallback: Bush the cache and retry once
        try:
            jwks = await get_jwks(force_refresh=True)
            payload = jwt.decode(
                token.credentials,
                jwks,
                algorithms=["RS256"],
                options={"verify_aud": False}
            )
        except Exception as retry_err:
            raise HTTPException(
                status_code=401, 
                detail=f"Invalid authentication token (Key Rotation Check Failed): {str(retry_err)}"
            )
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

    return {
        "id": payload.get("sub"),
        "email": payload.get("email") or payload.get("emails", [None])[0]
    }

async def sync_user_to_db(clerk_user: dict, db: AsyncSession) -> User:
    """ Ensures Clerk User exists in local MySQL (Lazy Sync). """
    user_id = clerk_user["id"]
    email = clerk_user["email"]

    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()

    if not user:
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

async def decode_token_silent(token_str: str) -> Optional[str]:
    """
    Asynchronously decodes a Clerk JWT and returns User ID.
    Silently fails (returns None) for anonymous/invalid traffic.
    """
    if not token_str:
        return None
    
    try:
        # Standard Bearer extraction
        if token_str.lower().startswith("bearer "):
            token_str = token_str[7:]
            
        jwks = await get_jwks()
        
        try:
            payload = jwt.decode(
                token_str,
                jwks,
                algorithms=["RS256"],
                options={"verify_aud": False}
            )
        except JWTError:
            # Refresh on potential key rotation
            jwks = await get_jwks(force_refresh=True)
            payload = jwt.decode(
                token_str,
                jwks,
                algorithms=["RS256"],
                options={"verify_aud": False}
            )
            
        return payload.get("sub")
    except Exception:
        return None
