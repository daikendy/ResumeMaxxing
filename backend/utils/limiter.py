from slowapi import Limiter
from slowapi.util import get_remote_address

# 🛡️ GLOBAL LIMITER
# Uses the remote IP address (remote_address) as the key to track requests.
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per minute"] # Very generous default for standard browsing
)
