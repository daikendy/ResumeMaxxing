"""mega_sync_production

Revision ID: mega_sync_v1
Revises: 
Create Date: 2026-04-24 03:15:00

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from database import Base
from models.user_model import User
from models.job_model import TrackedJob
from models.vault_model import VaultSnapshot, ActivityLog
from models.resume_model import ResumeVersion
from models.roadmap_model import LearningRoadmap, SkillGap
from models.master_resume_model import MasterResume

# revision identifiers, used by Alembic.
revision: str = 'mega_sync_v1'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 🛡️ THE MEGA SYNC
    print("🚀 STARTING MEGA SYNC: Ensuring all tables exist...")
    bind = op.get_bind()
    Base.metadata.create_all(bind)
    print("✅ MEGA SYNC COMPLETE: Tables verified.")
    
    # 🕵️‍♂️ SAFETY CHECK: Ensure action_code exists in activity_logs
    inspector = sa.inspect(bind)
    columns = [c['name'] for c in inspector.get_columns('activity_logs')]
    if 'action_code' not in columns:
        op.add_column('activity_logs', sa.Column('action_code', sa.String(length=50), nullable=False))

def downgrade() -> None:
    pass
