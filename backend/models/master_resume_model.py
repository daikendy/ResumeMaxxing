from __future__ import annotations
from sqlalchemy import String, Integer, JSON, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from database import Base
from typing import Any, TYPE_CHECKING

if TYPE_CHECKING:
    from .user_model import User

class MasterResume(Base):
    __tablename__ = "master_resumes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[str] = mapped_column(String(255), ForeignKey("users.id"), unique=True, nullable=False, index=True)
    resume_data: Mapped[Any] = mapped_column(JSON, nullable=False)

    # Relationships
    owner: Mapped["User"] = relationship("User")
