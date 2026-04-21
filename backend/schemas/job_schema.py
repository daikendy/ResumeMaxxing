from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from .resume_schema import ResumeResponse

class JobCreate(BaseModel):
    company_name: str = Field(..., max_length=150)
    job_title: str = Field(..., max_length=150)
    job_description: Optional[str] = Field(None, max_length=15000)
    job_url: Optional[str] = Field(None, max_length=1000)

class JobUpdate(BaseModel):
    status: Optional[str] = Field(None, max_length=50)
    job_url: Optional[str] = Field(None, max_length=1000)
    job_title: Optional[str] = Field(None, max_length=150)
    company_name: Optional[str] = Field(None, max_length=150)

class JobResponse(BaseModel):
    id: int
    user_id: str
    company_name: str
    job_title: str
    job_description: Optional[str] = None
    job_url: Optional[str] = None
    status: Optional[str] = "bookmarked"
    created_at: datetime
    resume_versions: List[ResumeResponse] = []

    class Config:
        from_attributes = True