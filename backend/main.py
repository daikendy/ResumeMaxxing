import os
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db, Base, engine
from routers import resume_router, user_router, job_router
from fastapi.middleware.cors import CORSMiddleware
import models

# Create the database tables if they don't already exist
Base.metadata.create_all(bind=engine)

from fastapi.responses import JSONResponse
from utils.exceptions import ResumeMaxxingException

app = FastAPI(
    title="ResumeMaxxing API",
    description="The backend API for ResumeMaxxing SaaS",
    version="0.1.0"
)

@app.exception_handler(ResumeMaxxingException)
async def resume_maxxing_exception_handler(request, exc: ResumeMaxxingException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "code": exc.code,
            "message": exc.message,
            "details": exc.details
        }
    )

MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")

# 2. Add this block to allow Next.js to talk to Python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://0.0.0.0:3000",
    ], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🚨 THE FIX: Attach the routers to the app immediately
app.include_router(resume_router.router)
app.include_router(user_router.router)
app.include_router(job_router.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the ResumeMaxxing API"}

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint to verify that the server is running
    and the database connection is active.
    """
    try:
        # Simple test query to verify database connectivity
        db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        raise HTTPException(
            status_code=503, 
            detail=f"Database connection failed: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    # This block allows you to run it directly from your IDE 
    # Just make sure your IDE is using the python interpreter from the 'venv' folder
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)