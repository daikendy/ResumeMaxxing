from __future__ import annotations
from sqlalchemy import Integer, String, Text, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from database import Base
from typing import List, Optional, TYPE_CHECKING
import datetime

if TYPE_CHECKING:
    from .user_model import User
    from .resume_model import ResumeVersion

class TrackedJob(Base):
    __tablename__ = "tracked_jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[str] = mapped_column(String(255), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    job_title: Mapped[str] = mapped_column(String(255), nullable=False)
    job_description: Mapped[Optional[str]] = mapped_column(Text)
    job_url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True) # ⚡ New Field
    status: Mapped[str] = mapped_column(Enum('bookmarked', 'applied', 'interviewing', 'rejected', 'hired', name="status_enum"), default='bookmarked')
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationships
    owner: Mapped["User"] = relationship("User", back_populates="jobs")
    resume_versions: Mapped[List["ResumeVersion"]] = relationship("ResumeVersion", back_populates="job", cascade="all, delete-orphan")