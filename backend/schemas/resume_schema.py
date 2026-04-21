from pydantic import BaseModel, Field
from typing import Dict, Any
from datetime import datetime

class ResumeCreate(BaseModel):
    tracked_job_id: int
    # Limiting raw input size to prevent massive payload trolls (approx 1MB in JSON chars)
    raw_resume_data: Dict[str, Any] = Field(..., max_length=1000000)

class ResumeResponse(BaseModel):
    id: int
    tracked_job_id: int
    version_number: int
    is_active: bool
    resume_content: Dict[str, Any] 
    created_at: datetime

    class Config:
        from_attributes = True