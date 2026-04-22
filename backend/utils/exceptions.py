from fastapi import HTTPException
from typing import Optional, Any

class ResumeMaxxingException(HTTPException):
    """Base exception for the ResumeMaxxing API ensuring a clean format."""
    def __init__(self, status_code: int, code: str, message: str, details: Optional[dict[Any, Any]] = None):
        super().__init__(status_code=status_code, detail=message)
        self.code = code
        self.message = message
        self.details = details or {}

class QuotaExceededException(ResumeMaxxingException):
    def __init__(self, message: str = "Generation quota exceeded. Invite friends to get more resources. Note: Premium tiers are coming in a future protocol update."):
        super().__init__(
            status_code=403,
            code="QUOTA_EXCEEDED",
            message=message
        )

class LimitReachedException(ResumeMaxxingException):
    def __init__(self, message: str = "Resource limit reached. Invite friends to expand your HUD capacity. Note: Premium tiers are coming in a future protocol update."):
        super().__init__(
            status_code=403,
            code="LIMIT_REACHED",
            message=message
        )

class AuthRequiredException(ResumeMaxxingException):
    def __init__(self, message: str = "Authentication required to access this resource."):
        super().__init__(
            status_code=401,
            code="AUTH_REQUIRED",
            message=message
        )
