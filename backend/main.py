from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db, Base, engine

# Create the database tables if they don't already exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ResumeMaxxing API",
    description="The backend API for ResumeMaxxing SaaS",
    version="0.1.0"
)

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
