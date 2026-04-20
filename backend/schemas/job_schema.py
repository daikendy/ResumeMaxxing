from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from .resume_schema import ResumeResponse

class JobCreate(BaseModel):
    company_name: str
    job_title: str
    job_description: str

class JobResponse(BaseModel):
    id: int
    user_id: str
    company_name: str
    job_title: str
    job_description: Optional[str] = None
    status: Optional[str] = "bookmarked"
    created_at: datetime
    resume_versions: List[ResumeResponse] = []

    class Config:
        from_attributes = True