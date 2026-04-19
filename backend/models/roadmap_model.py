from sqlalchemy import Column, Integer, String, Boolean, Enum, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class SkillGap(Base):
    __tablename__ = "skill_gaps"

    id = Column(Integer, primary_key=True, index=True)
    tracked_job_id = Column(Integer, ForeignKey("tracked_jobs.id", ondelete="CASCADE"), nullable=False)
    missing_skill = Column(String(255), nullable=False)
    urgency_weight = Column(Integer, default=1)
    status = Column(Enum('flagged', 'learning', 'acquired', name="gap_status_enum"), default='flagged')

    # Relationships
    job = relationship("TrackedJob") # Links back to the job
    roadmaps = relationship("LearningRoadmap", back_populates="skill_gap", cascade="all, delete-orphan")

class LearningRoadmap(Base):
    __tablename__ = "learning_roadmaps"

    id = Column(Integer, primary_key=True, index=True)
    skill_gap_id = Column(Integer, ForeignKey("skill_gaps.id", ondelete="CASCADE"), nullable=False)
    day_number = Column(Integer, nullable=False) # 1 to 7
    topic_title = Column(String(255), nullable=False)
    resource_link = Column(String(500)) 
    is_completed = Column(Boolean, default=False)

    # Relationships
    skill_gap = relationship("SkillGap", back_populates="roadmaps")