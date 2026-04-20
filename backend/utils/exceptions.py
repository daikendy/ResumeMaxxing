from fastapi import HTTPException

class ResumeMaxxingException(HTTPException):
    """Base exception for the ResumeMaxxing API ensuring a clean format."""
    def __init__(self, status_code: int, code: str, message: str, details: dict = None):
        super().__init__(status_code=status_code, detail=message)
        self.code = code
        self.message = message
        self.details = details or {}

class QuotaExceededException(ResumeMaxxingException):
    def __init__(self, message: str = "Generation quota exceeded. Upgrade to Pro for more generations."):
        super().__init__(
            status_code=403,
            code="QUOTA_EXCEEDED",
            message=message
        )

class LimitReachedException(ResumeMaxxingException):
    def __init__(self, message: str = "Resource limit reached. Upgrade to Pro to unlock more capacity."):
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
