import asyncio
import os
import json
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select

# Mock imports/paths to match the project structure
import sys
sys.path.append(os.getcwd())

from database import SQLALCHEMY_DATABASE_URL, Base
from models.vault_model import VaultSnapshot, ActivityLog
from crud import vault_crud

async def verify_backend_vault():
    print("STARTING BACKEND VAULT VERIFICATION...")
    
    engine = create_async_engine(SQLALCHEMY_DATABASE_URL)
    AsyncSessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession)
    
    async with AsyncSessionLocal() as db:
        # 1. Check for a test user
        from models.user_model import User
        result = await db.execute(select(User).limit(1))
        user = result.scalars().first()
        
        if not user:
            print("NO USER FOUND. CANNOT VERIFY.")
            return
        
        print(f"USER FOUND: {user.email}")
        
        # 2. Simulate Activity Logging
        print("LOGGING ACTIVITY...")
        log = await vault_crud.log_activity(
            db, user.id, "TEST_VERIFY", "System diagnostic check successful."
        )
        print(f"LOG CREATED: ID={log.id}")
        
        # 3. Simulate Snapshot Creation
        print("CREATING SNAPSHOT...")
        mock_data = {"test": "data", "profile": "verified"}
        snapshot = await vault_crud.create_snapshot(
            db, user.id, "DIAGNOSTIC_SNAPSHOT", mock_data
        )
        print(f"SNAPSHOT CREATED: ID={snapshot.id}, NAME={snapshot.name}")
        
        # 4. Verify Telemetry Fetch
        print("FETCHING TELEMETRY...")
        recent = await vault_crud.get_recent_activity(db, user.id)
        if any(l.action_code == "TEST_VERIFY" for l in recent):
            print(f"TELEMETRY VERIFIED: Found {len(recent)} entries.")
        else:
            print("TELEMETRY NOT FOUND.")

    await engine.dispose()
    print("VERIFICATION COMPLETE.")

if __name__ == "__main__":
    asyncio.run(verify_backend_vault())
