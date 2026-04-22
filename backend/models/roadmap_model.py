from __future__ import annotations
from sqlalchemy import Integer, String, Boolean, Enum, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from database import Base
from typing import List, Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from .job_model import TrackedJob

class SkillGap(Base):
    __tablename__ = "skill_gaps"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tracked_job_id: Mapped[int] = mapped_column(Integer, ForeignKey("tracked_jobs.id", ondelete="CASCADE"), nullable=False)
    missing_skill: Mapped[str] = mapped_column(String(255), nullable=False)
    urgency_weight: Mapped[int] = mapped_column(Integer, default=1)
    status: Mapped[str] = mapped_column(Enum('flagged', 'learning', 'acquired', name="gap_status_enum"), default='flagged')

    # Relationships
    job: Mapped["TrackedJob"] = relationship("TrackedJob") # Links back to the job
    roadmaps: Mapped[List["LearningRoadmap"]] = relationship("LearningRoadmap", back_populates="skill_gap", cascade="all, delete-orphan")

class LearningRoadmap(Base):
    __tablename__ = "learning_roadmaps"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    skill_gap_id: Mapped[int] = mapped_column(Integer, ForeignKey("skill_gaps.id", ondelete="CASCADE"), nullable=False)
    day_number: Mapped[int] = mapped_column(Integer, nullable=False) # 1 to 7
    topic_title: Mapped[str] = mapped_column(String(255), nullable=False)
    resource_link: Mapped[Optional[str]] = mapped_column(String(500)) 
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationships
    skill_gap: Mapped["SkillGap"] = relationship("SkillGap", back_populates="roadmaps")