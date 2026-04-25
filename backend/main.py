import os
import time

from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from dotenv import load_dotenv

from contextlib import asynccontextmanager

# Local Imports
from database import get_db
from routers import resume_router, user_router, job_router, webhook_router
from utils.exceptions import ResumeMaxxingException
from utils.logging_config import setup_logging, logger
from utils.limiter import limiter
from slowapi.errors import RateLimitExceeded
from auth_utils import get_jwks

load_dotenv()

host = os.getenv("HOST", "0.0.0.0")
port = int(os.getenv("PORT", 8000))
is_dev = os.getenv("ENVIRONMENT", "development").lower() == "development"
print(f"🚀 SYSTEM_STARTUP: Environment set to {'DEVELOPMENT' if is_dev else 'PRODUCTION'}")

# 🛡️ ALLOWED ORIGINS: Explicit list (CORS spec requires this with credentials)
# Capacitor uses capacitor://localhost (iOS) and http://localhost (Android)
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:8100,capacitor://localhost,http://localhost,https://resume-maxxing.vercel.app"
).split(",")

# 📝 Initialize Logging
setup_logging()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    MODERN STARTUP: Pre-fetch JWKS keys and warm up the engine.
    This replaces the deprecated @app.on_event("startup").
    """
    logger.info("SYSTEM_CORE_STARTUP", detail="Priming JWKS Cache...")
    try:
        await get_jwks(force_refresh=True)
        logger.info("SYSTEM_CORE_READY", detail="JWKS Synchronized.")
    except Exception as e:
        logger.error("SYSTEM_BOOT_FAILURE", error=str(e))
    
    yield
    
    logger.info("SYSTEM_CORE_SHUTDOWN")

app = FastAPI(
    title="ResumeMaxxing API",
    description="The backend API for ResumeMaxxing SaaS",
    version="0.1.0",
    lifespan=lifespan
)
app.state.limiter = limiter


# 🛡️ THE SENTINEL: Global Error Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, ResumeMaxxingException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"status": "error", "code": exc.code, "message": exc.message, "details": exc.details}
        )
    
    # Catch-all for unhandled system errors (Security: Don't expose tracebacks)
    logger.error("SYSTEM_UNHANDLED_ERROR", error=str(exc), path=request.url.path)
    return JSONResponse(
        status_code=500,
        content={"status": "error", "code": "INTERNAL_SERVER_ERROR", "message": "An unexpected system error occurred."}
    )

@app.exception_handler(RateLimitExceeded)
async def rate_limit_exception_handler(request: Request, exc: RateLimitExceeded):
    """Handler for when a user hits the rate limit guard."""
    logger.warning("RATE_LIMIT_HIT", path=request.url.path, ip=request.client.host if request.client else "unknown")
    return JSONResponse(
        status_code=429,
        content={
            "status": "error", 
            "code": "RATE_LIMIT_EXCEEDED", 
            "message": "Shields Up! You are moving too fast. Please wait a few seconds and try again."
        }
    )

# 🛡️ SECURITY: Request Body Size Limit (M1)
# Rejects requests with bodies larger than 10MB to prevent DoS.
@app.middleware("http")
async def limit_request_size(request: Request, call_next):
    content_length = request.headers.get("Content-Length")
    if content_length and int(content_length) > 10 * 1024 * 1024:
        return JSONResponse(
            status_code=413,
            content={"status": "error", "code": "PAYLOAD_TOO_LARGE", "message": "Request body exceeds 10MB limit."}
        )
    return await call_next(request)

# 🛡️ SECURITY HEADERS MIDDLEWARE
# Capacitor-safe: allows capacitor: and blob: schemes in CSP
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response: Response = await call_next(request)
    
    # Check environment inside the function to avoid global caching issues
    current_env = os.getenv("ENVIRONMENT", "development").lower()
    
    # 🛡️ TEMPORARILY DISABLED CSP FOR FRESH DEPLOYMENT SYNC
    # if current_env == "development":
    #     response.headers["Content-Security-Policy"] = (
    #         "default-src * 'self' capacitor://localhost http://localhost data: blob: 'unsafe-inline' 'unsafe-eval'; "
    #         "connect-src * 'self' blob: data: gap:; "
    #         "frame-ancestors 'none'"
    #     )
    # else:
    #     response.headers["Content-Security-Policy"] = (
    #         "default-src 'self' capacitor://localhost http://localhost; "
    #         "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://*.clerk.accounts.dev; "
    #         "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
    #         "font-src 'self' https://fonts.gstatic.com; "
    #         "img-src 'self' blob: data: https:; "
    #         "connect-src 'self' capacitor://localhost http://localhost https://api.clerk.com https://*.clerk.accounts.dev https://*.clerk-telemetry.com https://api.openai.com https://*.up.railway.app; "
    #         "frame-ancestors 'none'"
    #     )
    # response.headers["X-Content-Type-Options"] = "nosniff"
    # response.headers["X-Frame-Options"] = "DENY"
    # response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    # response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    
    # # HSTS: only in production (breaks localhost without HTTPS)
    # if os.getenv("ENVIRONMENT", "development") == "production":
    #     response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    
    return response

# 📡 TELEMETRY & AUTH: Request Processing Pipeline
@app.middleware("http")
async def attach_user_to_state(request: Request, call_next):
    """
    Silent Auth Middleware: Extracts the Clerk User ID from the JWT
    and attaches it to request.state.user_id for use in the Limiter.
    """
    from auth_utils import decode_token_silent
    
    auth_header = request.headers.get("Authorization")
    request.state.user_id = await decode_token_silent(auth_header or "")
    
    return await call_next(request)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    
    logger.info("HTTP_REQUEST", 
                method=request.method, 
                path=request.url.path, 
                status=response.status_code, 
                latency_ms=f"{process_time:.2f}ms")
    
    return response

# 📡 CORS: PRECISION UNBLOCK (Guaranteed for Railway)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8100",
        "capacitor://localhost",
        "http://localhost",
        "https://resume-maxxing.vercel.app",
        "https://resumemaxxing-production-b1b5.up.railway.app"
    ],
    allow_origin_regex="https://.*\.vercel\.app", # 🚀 Unlocks all Vercel previews!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach Routers
app.include_router(resume_router.router)
app.include_router(user_router.router)
app.include_router(job_router.router)
app.include_router(webhook_router.router)

@app.get("/")
async def read_root():
    return {"message": "Welcome to the ResumeMaxxing API"}

@app.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    """Health check endpoint to verify database connectivity."""
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        logger.error("HEALTH_CHECK_FAILED", error=str(e))
        raise HTTPException(
            status_code=503, 
            detail="Database connection failed"
        )

if __name__ == "__main__":
    import uvicorn
    # uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
    # uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
    uvicorn.run("main:app", host=host, port=port, reload=is_dev)
