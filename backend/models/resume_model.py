from sqlalchemy import Column, Integer, String, JSON, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class ResumeVersion(Base):
    __tablename__ = "resume_versions"

    id = Column(Integer, primary_key=True, index=True)
    tracked_job_id = Column(Integer, ForeignKey("tracked_jobs.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(255), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    resume_content = Column(JSON, nullable=False) # Stores the AI JSON payload
    version_number = Column(Integer, nullable=False) # 1, 2, 3...
    is_active = Column(Boolean, default=True) # The "Undo" flag
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    owner = relationship("User", back_populates="resumes")
    job = relationship("TrackedJob", back_populates="resume_versions")