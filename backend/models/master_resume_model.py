from sqlalchemy import Column, String, Integer, JSON, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class MasterResume(Base):
    __tablename__ = "master_resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(255), ForeignKey("users.id"), unique=True, nullable=False, index=True)
    resume_data = Column(JSON, nullable=False)

    # Establish relationship to User if required in future queries
    owner = relationship("User")
