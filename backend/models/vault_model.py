from __future__ import annotations
from sqlalchemy import String, Integer, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from database import Base
from typing import Any, TYPE_CHECKING
import datetime

if TYPE_CHECKING:
    from .user_model import User

class VaultSnapshot(Base):
    __tablename__ = "vault_snapshots"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[str] = mapped_column(String(255), ForeignKey("users.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False) # AI Generated summary or Timestamp
    resume_data: Mapped[Any] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationship to user
    owner: Mapped["User"] = relationship("User")

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[str] = mapped_column(String(255), ForeignKey("users.id"), nullable=False, index=True)
    action_code: Mapped[str] = mapped_column(String(50), nullable=False) # e.g. "ZAP_GEN", "TARGET_NEW", "VAULT_SAVE"
    description: Mapped[str] = mapped_column(String(255), nullable=False)
    timestamp: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())
    
    owner: Mapped["User"] = relationship("User")
