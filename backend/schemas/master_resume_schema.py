from pydantic import BaseModel, Field
from typing import Dict, Any

class MasterResumeCreate(BaseModel):
    # Support up to 1MB of JSON profile data
    resume_data: Dict[str, Any] = Field(..., max_length=1000000)

class MasterResumeResponse(BaseModel):
    id: int
    user_id: str
    resume_data: Dict[str, Any]

    class Config:
        from_attributes = True
