from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address

def get_user_id_or_ip(request: Request) -> str:
    """
    Custom key function for the rate limiter.
    Prioritizes the Clerk User ID from request state,
    falls back to remote IP for unauthenticated routes.
    """
    user_id = getattr(request.state, "user_id", None)
    if user_id:
        return f"user:{user_id}"
    return get_remote_address(request)

# 🛡️ GLOBAL LIMITER
# Now identifies users primarily by Clerk ID to prevent shared-IP throttling.
limiter = Limiter(
    key_func=get_user_id_or_ip,
    default_limits=["200 per minute"]
)
