import sys
import os
import asyncio
from unittest.mock import MagicMock, AsyncMock

# Add the current directory (backend) to sys.path
sys.path.append(os.getcwd())

from utils.limiter import get_user_id_or_ip
from auth_utils import decode_token_silent, get_jwks

async def test_jwks_and_auth_logic():
    print("--- VERIFYING ASYNC AUTH & ROTATION LOGIC ---")
    
    # 1. Test JWKS Caching
    print("Testing JWKS Cache...")
    cache1 = await get_jwks()
    cache2 = await get_jwks()
    assert cache1 is cache2, "FAIL: JWKS Cache did not reuse object"
    print("PASS: Cache Reused Successfully")

    # 2. Test Silent Auth (No Token)
    print("Testing Silent Auth (Missing Token)...")
    user_id = await decode_token_silent(None)
    assert user_id is None, "FAIL: Should return None for missing token"
    print("PASS: Silent Auth handled missing token")

    # 3. Test Limiter Key Function (Still Sync)
    print("Testing Limiter Key Logic...")
    mock_request = MagicMock()
    mock_request.state.user_id = "clerk_prod_123"
    key = get_user_id_or_ip(mock_request)
    assert key == "user:clerk_prod_123", "FAIL: Limiter key mismatch"
    print("PASS: Limiter accurately mapped state to key")

    print("--- ALL BACKEND HARDENING TESTS PASSED ---")

if __name__ == "__main__":
    asyncio.run(test_jwks_and_auth_logic())
