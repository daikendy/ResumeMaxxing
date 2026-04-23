import asyncio
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config
from alembic import context

# ⚡ Import the Loaders
import sys
import os
from dotenv import load_dotenv

# Ensure the backend directory is in the path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
load_dotenv()

# 🛡️ Import Database metadata and all Models
from database import Base, SQLALCHEMY_DATABASE_URL  # noqa: E402
from models import user_model, job_model, vault_model, resume_model, roadmap_model, master_resume_model # noqa: F401

# Alembic config
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set the metadata for autogenerate support
target_metadata = Base.metadata

# Override the URL to use our environment variable
config.set_main_option("sqlalchemy.url", SQLALCHEMY_DATABASE_URL)

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()

async def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        # 🌀 FORCE RESET CHECK: If the DB is stuck on a version we deleted, clear it.
        try:
            from sqlalchemy import text
            result = await connection.execute(text("SELECT version_num FROM alembic_version"))
            version = result.scalar()
            
            # Reset if version is not one of our new ones.
            if version and version not in ['mega_sync_v2']:
                print(f"Detected version {version}. Resetting for mega_sync_v2...")
                await connection.execute(text("DELETE FROM alembic_version"))
                await connection.commit()
        except Exception:
            pass

        await connection.run_sync(do_run_migrations)

    await connectable.dispose()

if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
