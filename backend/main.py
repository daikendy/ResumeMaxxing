import os
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db, Base, engine
from routers import resume_router
from fastapi.middleware.cors import CORSMiddleware
import models

# Create the database tables if they don't already exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ResumeMaxxing API",
    description="The backend API for ResumeMaxxing SaaS",
    version="0.1.0"
)

MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")

# 2. Add this block to allow Next.js to talk to Python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Your Next.js port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🚨 THE FIX: Attach the routers to the app immediately
app.include_router(resume_router.router)

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
    uvicorn.run("main:app", host=MYSQL_HOST, port=8000, reload=True)