from sqlalchemy import Column, String, Integer, Enum, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(255), primary_key=True, index=True) # UUID from Auth
    email = Column(String(255), unique=True, nullable=False, index=True)
    subscription_tier = Column(Enum('free', 'premium_1', 'premium_2', name="tier_enum"), default='free')
    generations_used = Column(Integer, default=0)
    generations_limit = Column(Integer, default=5)
    referral_code = Column(String(50), unique=True, index=True)
    referred_by = Column(String(255), nullable=True)
    bonus_quota = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Java @OneToMany equivalent: A user has many jobs and resumes
    jobs = relationship("TrackedJob", back_populates="owner", cascade="all, delete-orphan")
    resumes = relationship("ResumeVersion", back_populates="owner", cascade="all, delete-orphan")