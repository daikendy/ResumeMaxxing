from pydantic import BaseModel
from datetime import datetime
from typing import Any, Dict, List

class VaultSnapshotBase(BaseModel):
    name: str
    resume_data: Dict[str, Any]

class VaultSnapshotCreate(VaultSnapshotBase):
    pass

class VaultSnapshotResponse(VaultSnapshotBase):
    id: int
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class ActivityLogResponse(BaseModel):
    id: int
    user_id: str
    action_code: str
    description: str
    timestamp: datetime

    class Config:
        from_attributes = True

class VaultRestoreRequest(BaseModel):
    snapshot_id: int
