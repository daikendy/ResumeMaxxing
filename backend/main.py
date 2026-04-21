import os
import time
from fastapi import FastAPI, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from database import get_db, Base, engine
from routers import resume_router, user_router, job_router, webhook_router
from fastapi.middleware.cors import CORSMiddleware
import models

# 📝 Initialize Logging
from utils.logging_config import setup_logging, logger
setup_logging()

from fastapi.responses import JSONResponse
from utils.exceptions import ResumeMaxxingException

app = FastAPI(
    title="ResumeMaxxing API",
    description="The backend API for ResumeMaxxing SaaS",
    version="0.1.0"
)

# 📡 THE "UNBLOCKER": Proactive CORS Hardening
# Moving this to the very top ensures it wraps the Global Exception Handler
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for local dev to prevent Axios Network Error
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

# 📡 TELEMETRY: Request/Response Logging Middleware
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

MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")

# 🚨 THE FIX: Attach the routers to the app immediately
app.include_router(resume_router.router)
app.include_router(user_router.router)
app.include_router(job_router.router)
app.include_router(webhook_router.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the ResumeMaxxing API"}

@app.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    """
    Health check endpoint to verify that the server is running
    and the database connection is active.
    """
    try:
        # Simple test query to verify database connectivity
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
    # This block allows you to run it directly from your IDE 
    # Just make sure your IDE is using the python interpreter from the 'venv' folder
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)