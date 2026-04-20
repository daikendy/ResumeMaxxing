from pydantic import BaseModel
from typing import Dict, Any
from datetime import datetime

class ResumeCreate(BaseModel):
    tracked_job_id: int
    # The frontend will pass the raw resume text/JSON here
    raw_resume_data: Dict[str, Any] 

class ResumeResponse(BaseModel):
    id: int
    tracked_job_id: int
    version_number: int
    is_active: bool
    resume_content: Dict[str, Any] # The final AI-tailored JSON
    created_at: datetime

    class Config:
        from_attributes = True