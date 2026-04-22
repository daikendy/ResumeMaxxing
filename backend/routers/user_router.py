import io

import PyPDF2
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

# Local Imports
from auth_utils import get_current_user, sync_user_to_db
from crud import user_crud, resume_crud
from database import get_db
from models.master_resume_model import MasterResume
from schemas.master_resume_schema import MasterResumeCreate, MasterResumeResponse
from schemas.user_schema import UserResponse, RedeemCodeRequest
from services.ai_service import extract_resume_data
from utils.limiter import limiter

# Vault Imports
from schemas.vault_schema import VaultSnapshotResponse, ActivityLogResponse, VaultRestoreRequest
from crud import vault_crud
from services.ai_service import summarize_master_resume

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/master-resume", response_model=MasterResumeResponse | None)
async def get_master_resume(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Fetch the master resume for the authenticated user."""
    await sync_user_to_db(current_user, db)
    result = await db.execute(select(MasterResume).filter(MasterResume.user_id == current_user["id"]))
    return result.scalars().first()

@router.post("/master-resume", response_model=MasterResumeResponse)
async def save_master_resume(payload: MasterResumeCreate, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Save or update the master resume."""
    await sync_user_to_db(current_user, db)
    return await resume_crud.upsert_master_resume(db, current_user["id"], payload.resume_data)

@router.post("/upload-resume")
@limiter.limit("5/minute") # 🛡️ Strict AI Shield
async def upload_resume(request: Request, file: UploadFile = File(...), current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Extract data from a PDF resume using OCR/Text extraction and AI parsing."""
    await sync_user_to_db(current_user, db)
    
    if not file.filename or not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    try:
        contents = await file.read()
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(contents))
        
        # 1. Extract raw text
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        
        # 2. Extract hyperlink annotations (GitHub, LinkedIn, etc.)
        hyperlinks = []
        for page in pdf_reader.pages:
            annotations = page.get("/Annots", [])
            for annot in annotations: # type: ignore
                annot_obj = annot.get_object()
                if annot_obj.get("/Subtype") == "/Link":
                    action = annot_obj.get("/A")
                    if action and "/URI" in action:
                        uri = action["/URI"]
                        if uri not in hyperlinks:
                            hyperlinks.append(uri)
        
        if hyperlinks:
            text += "\n\n[HYPERLINKS]\n"
            for link in hyperlinks:
                text += f"- {link}\n"
            
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from PDF.")
            
        # 3. Send text to the AI Engine for structuring
        json_data = await extract_resume_data(text)
        return {"resume_data": json_data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF Parsing Failed: {str(e)}")

@router.get("/me", response_model=UserResponse)
async def get_user_me(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Fetch current user details and stats."""
    await sync_user_to_db(current_user, db)
    user = await user_crud.get_user(db, current_user["id"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/redeem-code")
@limiter.limit("5/minute") # 🛑 Anti-Fraud Shield
async def redeem_code(request: Request, payload: RedeemCodeRequest, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Redeem a referral code for bonus resume generations."""
    await sync_user_to_db(current_user, db)
    result = await user_crud.redeem_referral_code(db, current_user["id"], payload.code)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    
    return result

# --- VAULT & HUD HUD TELEMETRY ---

@router.get("/vault", response_model=list[VaultSnapshotResponse])
async def get_vault_snapshots(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """List all vaulted snapshots for the user."""
    await sync_user_to_db(current_user, db)
    return await vault_crud.get_snapshots(db, current_user["id"])

@router.post("/vault/snapshot", response_model=VaultSnapshotResponse)
@limiter.limit("5/minute") # 🛡️ Protection against AI-burn and spam
async def create_vault_snapshot(request: Request, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Create a new vault snapshot from the current master resume."""
    user = await sync_user_to_db(current_user, db)
    
    # 🕵️ Backend Limit Check (Hard Standard: 20)
    current_snapshots = await vault_crud.get_snapshots(db, user.id)
    if len(current_snapshots) >= 20:
        raise HTTPException(
            status_code=403, 
            detail="VAULT_FULL: Clear archive or decommission versions to continue."
        )

    # 1. Fetch current master
    result = await db.execute(select(MasterResume).filter(MasterResume.user_id == user.id))
    master = result.scalars().first()
    if not master:
        raise HTTPException(status_code=404, detail="MASTER_PROFILE_NOT_FOUND")
        
    # 2. AI Summarization for the name
    summary = await summarize_master_resume(master.resume_data)
    
    # 3. Save snapshot
    snapshot = await vault_crud.create_snapshot(db, user.id, summary, master.resume_data)
    
    # 4. Log Activity (Non-Blocking)
    try:
        await vault_crud.log_activity(db, user.id, "VAULT_SAVE", f"Snapshot Created: {summary}")
    except Exception as e:
        from utils.logging_config import logger
        logger.error("TELEMETRY_FAILED", error=str(e))
    
    return snapshot

@router.post("/vault/restore")
@limiter.limit("10/minute") # 🛡️ Guard against rapid state switching
async def restore_vault_snapshot(request: Request, payload: VaultRestoreRequest, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Restore a vaulted snapshot into the active master resume."""
    user = await sync_user_to_db(current_user, db)
    
    snapshot = await vault_crud.get_snapshot_by_id(db, payload.snapshot_id, user.id)
    if not snapshot:
        raise HTTPException(status_code=404, detail="SNAPSHOT_NOT_FOUND")
    
    await resume_crud.upsert_master_resume(db, user.id, snapshot.resume_data)
    
    try:
        await vault_crud.log_activity(db, user.id, "VAULT_RESTORE", f"Profile restored: {snapshot.name}")
    except Exception as e:
        from utils.logging_config import logger
        logger.error("TELEMETRY_FAILED", error=str(e))
    
    return {"status": "SUCCESS", "name": snapshot.name}

@router.delete("/vault/purge")
@limiter.limit("2/minute") # 🛡️ High-risk protocol
async def purge_vault(request: Request, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Wipe the entire vault archive for the current pilot."""
    user = await sync_user_to_db(current_user, db)
    count = await vault_crud.purge_vault(db, user.id)
    
    await vault_crud.log_activity(db, user.id, "SYSTEM_WIPE", f"Erased {count} snapshots from the archive.")
    return {"status": "SUCCESS", "erased_count": count}

@router.delete("/vault/{snapshot_id}")
@limiter.limit("20/minute")
async def delete_snapshot(request: Request, snapshot_id: int, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Decommission a specific version from the vault."""
    user = await sync_user_to_db(current_user, db)
    success = await vault_crud.delete_snapshot(db, snapshot_id, user.id)
    if not success:
        raise HTTPException(status_code=404, detail="SNAPSHOT_NOT_FOUND")
    
    await vault_crud.log_activity(db, user.id, "VAULT_DECOMMISSION", f"Version ID:{snapshot_id} scrubbed.")
    return {"status": "SUCCESS"}

@router.get("/activity", response_model=list[ActivityLogResponse])
async def get_activity_telemetry(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Fetch recent HUD activity for display."""
    await sync_user_to_db(current_user, db)
    return await vault_crud.get_recent_activity(db, current_user["id"], limit=15)
