"""Initial Full Migration

Revision ID: 1a2b3c4d5e6f
Revises: 
Create Date: 2026-04-23 23:50:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '1a2b3c4d5e6f'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # 1. Users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('subscription_tier', sa.Enum('free', 'premium_1', 'premium_2', name='tier_enum'), nullable=True),
        sa.Column('generations_used', sa.Integer(), nullable=True),
        sa.Column('generations_limit', sa.Integer(), nullable=True),
        sa.Column('referral_code', sa.String(length=50), nullable=True),
        sa.Column('referred_by', sa.String(length=255), nullable=True),
        sa.Column('bonus_quota', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_referral_code'), 'users', ['referral_code'], unique=True)

    # 2. Master Resumes table
    op.create_table(
        'master_resumes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.String(length=255), nullable=False),
        sa.Column('resume_data', sa.JSON(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_master_resumes_id'), 'master_resumes', ['id'], unique=False)
    op.create_index(op.f('ix_master_resumes_user_id'), 'master_resumes', ['user_id'], unique=True)

    # 3. Tracked Jobs table
    op.create_table(
        'tracked_jobs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.String(length=255), nullable=False),
        sa.Column('company', sa.String(length=255), nullable=False),
        sa.Column('position', sa.String(length=255), nullable=False),
        sa.Column('status', sa.String(length=50), server_default='applied', nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=True),
        sa.Column('job_url', sa.String(length=1000), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_tracked_jobs_id'), 'tracked_jobs', ['id'], unique=False)

    # 4. Resume Versions table
    op.create_table(
        'resumes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.String(length=255), nullable=False),
        sa.Column('job_id', sa.Integer(), nullable=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('resume_data', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=True),
        sa.ForeignKeyConstraint(['job_id'], ['tracked_jobs.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_resumes_id'), 'resumes', ['id'], unique=False)

    # 5. Vault Snapshots table
    op.create_table(
        'vault_snapshots',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.String(length=255), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('resume_data', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_vault_snapshots_id'), 'vault_snapshots', ['id'], unique=False)

    # 6. Activity Logs table
    op.create_table(
        'activity_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.String(length=255), nullable=False),
        sa.Column('action_type', sa.String(length=50), nullable=False),
        sa.Column('description', sa.String(length=500), nullable=True),
        sa.Column('timestamp', sa.DateTime(), server_default=sa.func.now(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_activity_logs_id'), 'activity_logs', ['id'], unique=False)

def downgrade():
    op.drop_table('activity_logs')
    op.drop_table('vault_snapshots')
    op.drop_table('resumes')
    op.drop_table('tracked_jobs')
    op.drop_table('master_resumes')
    op.drop_table('users')
