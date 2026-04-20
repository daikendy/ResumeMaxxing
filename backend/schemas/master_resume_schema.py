from pydantic import BaseModel
from typing import Dict, Any

class MasterResumeCreate(BaseModel):
    resume_data: Dict[str, Any]

class MasterResumeResponse(BaseModel):
    id: int
    user_id: str
    resume_data: Dict[str, Any]

    class Config:
        from_attributes = True
