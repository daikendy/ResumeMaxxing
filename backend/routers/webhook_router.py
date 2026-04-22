import os
from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from svix.webhooks import Webhook, WebhookVerificationError

# Local Imports
from database import get_db
from crud import user_crud
from utils.logging_config import logger
from utils.limiter import limiter

router = APIRouter(
    prefix="/api/webhooks",
    tags=["webhooks"]
)

# Set this in your .env file in production
CLERK_WEBHOOK_SECRET = os.getenv("CLERK_WEBHOOK_SECRET", "whsec_test_secret_for_dev")

@router.post("/clerk")
@limiter.limit("60/minute") # 🛡️ Stability Shield
async def clerk_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """ listens for events from Clerk (like user deletion) and syncs our database. """
    
    headers = request.headers
    payload = await request.body()
    
    try:
        wh = Webhook(CLERK_WEBHOOK_SECRET)
        evt = wh.verify(payload, dict(headers))
    except WebhookVerificationError as e:
        logger.error("WEBHOOK_VERIFICATION_FAILED", error=str(e))
        raise HTTPException(status_code=400, detail="Invalid signature")

    event_type = evt.get("type")
    data = evt.get("data")
    
    logger.info("CLERK_WEBHOOK_RECEIVED", event_type=event_type)

    if event_type == "user.deleted":
        user_id = data.get("id")
        if user_id:
            success = await user_crud.delete_user(db, user_id)
            if success:
                logger.info("USER_DATA_SCRUBBED", clerk_id=user_id)
            else:
                logger.warning("USER_DELETE_FAILED", clerk_id=user_id, reason="Not found")
                
    return {"status": "success"}
