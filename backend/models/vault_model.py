from sqlalchemy import Column, String, Integer, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class VaultSnapshot(Base):
    __tablename__ = "vault_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(255), ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False) # AI Generated summary or Timestamp
    resume_data = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to user
    owner = relationship("User")

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(255), ForeignKey("users.id"), nullable=False, index=True)
    action_code = Column(String(50), nullable=False) # e.g. "ZAP_GEN", "TARGET_NEW", "VAULT_SAVE"
    description = Column(String(255), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    owner = relationship("User")
