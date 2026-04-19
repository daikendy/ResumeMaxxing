from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
import io
import PyPDF2
from sqlalchemy.orm import Session
from database import get_db
from models.master_resume_model import MasterResume
from models.user_model import User
from schemas.master_resume_schema import MasterResumeCreate, MasterResumeResponse
from services.ai_service import extract_resume_data

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/{user_id}/master-resume", response_model=MasterResumeResponse)
def get_master_resume(user_id: str, db: Session = Depends(get_db)):
    db_resume = db.query(MasterResume).filter(MasterResume.user_id == user_id).first()
    if not db_resume:
        raise HTTPException(status_code=404, detail="Master resume not found")
    return db_resume

@router.post("/{user_id}/master-resume", response_model=MasterResumeResponse)
def save_master_resume(user_id: str, payload: MasterResumeCreate, db: Session = Depends(get_db)):
    # Quick sanity check
    if user_id != payload.user_id:
        raise HTTPException(status_code=400, detail="Path user_id does not match payload")

    # Check if exists
    db_resume = db.query(MasterResume).filter(MasterResume.user_id == user_id).first()

    if db_resume:
        # Update existing
        db_resume.resume_data = payload.resume_data
    else:
        # Create new
        db_resume = MasterResume(user_id=user_id, resume_data=payload.resume_data)
        db.add(db_resume)

    db.commit()
    db.refresh(db_resume)
    return db_resume

@router.post("/{user_id}/upload-resume")
async def upload_resume(user_id: str, file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    try:
        # Read the file
        contents = await file.read()
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(contents))
        
        # Extract text from all pages
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
            
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from PDF.")
            
        # Send text to AI
        json_data = await extract_resume_data(text)
        return {"resume_data": json_data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
