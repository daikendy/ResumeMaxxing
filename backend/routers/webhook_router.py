import os
import json
from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from svix.webhooks import Webhook, WebhookVerificationError
from database import get_db
from crud import user_crud

router = APIRouter(
    prefix="/api/webhooks",
    tags=["webhooks"]
)

# You'll need to set this in your .env file in production
CLERK_WEBHOOK_SECRET = os.getenv("CLERK_WEBHOOK_SECRET", "whsec_test_secret_for_dev")

@router.post("/clerk")
async def clerk_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """
    RECEIVE CLERK WEBHOOKS
    This listens for events from Clerk (like user deletion) and syncs our database.
    """
    
    # 1. Verification: Make sure this actually came from Clerk
    # Clerk sends these headers which we use to verify the signature
    headers = request.headers
    payload = await request.body()
    
    try:
        wh = Webhook(CLERK_WEBHOOK_SECRET)
        # This will raise an error if the signature is invalid
        evt = wh.verify(payload, headers)
    except WebhookVerificationError as e:
        print(f"❌ Webhook verification failed: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid signature")

    # 2. Parse the Event
    event_type = evt.get("type")
    data = evt.get("data")
    
    print(f"🔔 Received Clerk Event: {event_type}")

    # 3. Handle User Deletion
    if event_type == "user.deleted":
        user_id = data.get("id")
        if user_id:
            success = await user_crud.delete_user(db, user_id)
            if success:
                print(f"💀 USER SCRUBBED: Deleted all data for Clerk ID {user_id}")
            else:
                print(f"⚠️ DELETE FAILED: No record found for ID {user_id}")
                
    # 4. Handle User Creation (Optional Sync)
    elif event_type == "user.created":
        # Usually we handle creation on the first login, but we could sync here too
        pass

    return {"status": "success"}
