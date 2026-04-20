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

async def get_current_user(token: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """
    Dependency to verify the Clerk JWT and return the user's Clerk ID (sub claim).
    """
    try:
        jwks = get_jwks()
        unverified_header = jwt.get_unverified_header(token.credentials)
        
        # Find the correct key in JWKS
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

        # Decode and verify the token
        payload = jwt.decode(
            token.credentials,
            rsa_key,
            algorithms=["RS256"],
            issuer=CLERK_ISSUER
        )
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token missing identity (sub)")
            
        return user_id

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTClaimsError:
        raise HTTPException(status_code=401, detail="Invalid claims (check issuer)")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")
