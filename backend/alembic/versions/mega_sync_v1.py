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
    # 🛡️ THE MEGA SYNC: TABLES
    print("🚀 STARTING MEGA SYNC: Ensuring all tables exist...")
    bind = op.get_bind()
    Base.metadata.create_all(bind)
    print("✅ TABLE SYNC COMPLETE.")

    # 🕵️‍♂️ THE MEGA SYNC: COLUMNS
    # We manually sync critical columns that might be missing from existing tables.
    inspector = sa.inspect(bind)
    
    def sync_columns(table_name, required_columns):
        existing = [c['name'] for c in inspector.get_columns(table_name)]
        for col_name, col_type in required_columns:
            if col_name not in existing:
                print(f"➕ Adding missing column {table_name}.{col_name}...")
                op.add_column(table_name, sa.Column(col_name, col_type, nullable=True))

    # Sync Tracked Jobs
    sync_columns('tracked_jobs', [
        ('company_name', sa.String(255)),
        ('job_title', sa.String(255)),
        ('job_description', sa.Text()),
        ('job_url', sa.String(500)),
        ('status', sa.String(50)),
    ])

    # Sync Activity Logs
    sync_columns('activity_logs', [
        ('action_code', sa.String(50)),
        ('description', sa.String(255)),
    ])

    # Sync Users
    sync_columns('users', [
        ('subscription_tier', sa.String(50)),
        ('generations_used', sa.Integer()),
        ('generations_limit', sa.Integer()),
        ('referral_code', sa.String(50)),
        ('bonus_quota', sa.Integer()),
    ])

    print("🏁 ALL COLUMNS SYNCED.")

def downgrade() -> None:
    pass
