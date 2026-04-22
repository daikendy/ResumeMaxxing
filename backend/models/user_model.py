from __future__ import annotations
from sqlalchemy import String, Integer, Enum, DateTime
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from database import Base
from typing import List, Optional, TYPE_CHECKING
import datetime

if TYPE_CHECKING:
    from .job_model import TrackedJob
    from .resume_model import ResumeVersion

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(255), primary_key=True, index=True) # UUID from Auth
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    subscription_tier: Mapped[str] = mapped_column(Enum('free', 'premium_1', 'premium_2', name="tier_enum"), default='free')
    generations_used: Mapped[int] = mapped_column(Integer, default=0)
    generations_limit: Mapped[int] = mapped_column(Integer, default=5)
    referral_code: Mapped[Optional[str]] = mapped_column(String(50), unique=True, index=True)
    referred_by: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    bonus_quota: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationships
    jobs: Mapped[List["TrackedJob"]] = relationship("TrackedJob", back_populates="owner", cascade="all, delete-orphan")
    resumes: Mapped[List["ResumeVersion"]] = relationship("ResumeVersion", back_populates="owner", cascade="all, delete-orphan")