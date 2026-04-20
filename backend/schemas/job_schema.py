from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class JobCreate(BaseModel):
    user_id: str
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

    class Config:
        from_attributes = True