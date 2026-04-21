from sqlalchemy import Column, Integer, String, Text, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class TrackedJob(Base):
    __tablename__ = "tracked_jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(255), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    company_name = Column(String(255), nullable=False)
    job_title = Column(String(255), nullable=False)
    job_description = Column(Text)
    job_url = Column(String(1000), nullable=True) # ⚡ New Field
    status = Column(Enum('bookmarked', 'applied', 'interviewing', 'rejected', 'hired', name="status_enum"), default='bookmarked')
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Java @ManyToOne equivalent
    owner = relationship("User", back_populates="jobs")
    resume_versions = relationship("ResumeVersion", back_populates="job", cascade="all, delete-orphan")