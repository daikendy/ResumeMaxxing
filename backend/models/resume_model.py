from __future__ import annotations
from sqlalchemy import Integer, String, JSON, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from database import Base
from typing import Any, TYPE_CHECKING
import datetime

if TYPE_CHECKING:
    from .user_model import User
    from .job_model import TrackedJob

class ResumeVersion(Base):
    __tablename__ = "resume_versions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tracked_job_id: Mapped[int] = mapped_column(Integer, ForeignKey("tracked_jobs.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[str] = mapped_column(String(255), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    resume_content: Mapped[Any] = mapped_column(JSON, nullable=False) # Stores the AI JSON payload
    version_number: Mapped[int] = mapped_column(Integer, nullable=False) # 1, 2, 3...
    is_active: Mapped[bool] = mapped_column(Boolean, default=True) # The "Undo" flag
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationships
    owner: Mapped["User"] = relationship("User", back_populates="resumes")
    job: Mapped["TrackedJob"] = relationship("TrackedJob", back_populates="resume_versions")