import os
import requests
from jose import jwt, jwk
from jose.utils import base64url_decode
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

load_dotenv()

# Configuration
CLERK_ISSUER = os.getenv("CLERK_ISSUER")
CLERK_JWKS_URL = os.getenv("CLERK_JWKS_URL")

security = HTTPBearer()

# Cache for JWKS keys to avoid frequent network calls
_jwks_cache = None

def get_jwks():
    global _jwks_cache
    if _jwks_cache is None:
        print(f"Fetching JWKS from {CLERK_JWKS_URL}...")
        response = requests.get(CLERK_JWKS_URL)
        if response.status_code != 200:
            raise Exception("Failed to fetch JWKS from Clerk")
        _jwks_cache = response.json()
    return _jwks_cache

import string
import random
from sqlalchemy.orm import Session
from models.user_model import User

def generate_referral_code(db: Session):
    chars = string.ascii_uppercase + string.digits
    while True:
        code = ''.join(random.choices(chars, k=6))
        # Collision check
        if not db.query(User).filter(User.referral_code == code).first():
            return code

def sync_user_to_db(user_data: dict, db: Session):
    """
    Ensures a user exists in the local database (Lazy Sync).
    """
    user_id = user_data["id"]
    email = user_data.get("email") or f"{user_id}@clerk.user"
    
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        print(f"Syncing new user to DB: {user_id}")
        db_user = User(
            id=user_id,
            email=email,
            subscription_tier='free',
            referral_code=generate_referral_code(db)
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    return db_user

async def get_current_user(token: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Dependency to verify the Clerk JWT and return the user's details.
    """
    try:
        jwks = get_jwks()
        unverified_header = jwt.get_unverified_header(token.credentials)
        
        rsa_key = {}
        for key in jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"]
                }
                break

        if not rsa_key:
            raise HTTPException(status_code=401, detail="Invalid authentication header: Key not found")

        payload = jwt.decode(
            token.credentials,
            rsa_key,
            algorithms=["RS256"],
            issuer=CLERK_ISSUER
        )
        
        user_id = payload.get("sub")
        email = payload.get("email") # Clerk can include this in JWT if configured
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Token missing identity (sub)")
            
        return {"id": user_id, "email": email}

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTClaimsError:
        raise HTTPException(status_code=401, detail="Invalid claims (check issuer)")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")
