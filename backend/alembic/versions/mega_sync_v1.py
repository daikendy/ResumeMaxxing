"""mega_sync_production

Revision ID: mega_sync_v1
Revises: 
Create Date: 2026-04-24 03:15:00

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from database import Base
from models import user_model, job_model, vault_model, resume_model, roadmap_model, master_resume_model

# revision identifiers, used by Alembic.
revision: str = 'mega_sync_v1'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 🛡️ THE MEGA SYNC
    # This uses SQLAlchemy's internal logic to create any missing tables automatically.
    # It is safe to run even if tables already exist.
    bind = op.get_bind()
    Base.metadata.create_all(bind)
    
    # 🕵️‍♂️ SAFETY CHECK: Ensure action_code exists in activity_logs
    inspector = sa.inspect(bind)
    columns = [c['name'] for c in inspector.get_columns('activity_logs')]
    if 'action_code' not in columns:
        op.add_column('activity_logs', sa.Column('action_code', sa.String(length=50), nullable=False))

def downgrade() -> None:
    pass
