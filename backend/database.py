import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

import os

# 1. Look for Railway's injected URL or manual override
RAILWAY_URL = os.getenv("MYSQL_URL")
MANUAL_URL = os.getenv("SQLALCHEMY_DATABASE_URL")

if RAILWAY_URL or MANUAL_URL:
    # 🌩️ PRODUCTION: We are on Railway! 
    TARGET_URL = RAILWAY_URL or MANUAL_URL
    # Swap the generic 'mysql://' to your async 'mysql+aiomysql://' driver
    if TARGET_URL.startswith("mysql://"):
        SQLALCHEMY_DATABASE_URL = TARGET_URL.replace("mysql://", "mysql+aiomysql://", 1)
    else:
        SQLALCHEMY_DATABASE_URL = TARGET_URL
else:
    # 💻 LOCAL: We are on your laptop! 
    # Fall back to your separated variables
    MYSQL_USER = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "root")
    MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_PORT = os.getenv("MYSQL_PORT", "3306")
    MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "resumemaxxing_db")
    
    SQLALCHEMY_DATABASE_URL = f"mysql+aiomysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}"

print(f"Database configured for: {'Production (Railway)' if RAILWAY_URL else 'Local Development'}")

# Set up the SQLAlchemy Async Engine
engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL,
    echo=False,  # Set to True if you want to see raw SQL logs
    pool_pre_ping=True,
)

# Configure the async session local class
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)

# Base class for the declarative models
Base = declarative_base()

# 🛡️ ASYNC DEPENDENCY: Get the database session as an async generator
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
