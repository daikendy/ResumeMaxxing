from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
import io
import PyPDF2
from sqlalchemy.orm import Session
from database import get_db
from models.master_resume_model import MasterResume
from models.user_model import User
from schemas.master_resume_schema import MasterResumeCreate, MasterResumeResponse
from services.ai_service import extract_resume_data

from auth_utils import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/master-resume", response_model=MasterResumeResponse)
def get_master_resume(current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """Fetch the master resume for the authenticated user."""
    db_resume = db.query(MasterResume).filter(MasterResume.user_id == current_user).first()
    if not db_resume:
        raise HTTPException(status_code=404, detail="Master resume not found")
    return db_resume

@router.post("/master-resume", response_model=MasterResumeResponse)
def save_master_resume(payload: MasterResumeCreate, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """Save or update the master resume for the authenticated user."""
    # Check if exists
    db_resume = db.query(MasterResume).filter(MasterResume.user_id == current_user).first()

    if db_resume:
        # Update existing
        db_resume.resume_data = payload.resume_data
    else:
        # Create new
        db_resume = MasterResume(user_id=current_user, resume_data=payload.resume_data)
        db.add(db_resume)

    db.commit()
    db.refresh(db_resume)
    return db_resume

@router.post("/upload-resume")
async def upload_resume(current_user: str = Depends(get_current_user), file: UploadFile = File(...)):
    """Extract data from a PDF resume for the authenticated user."""
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
        
        # Extract hyperlink annotations (GitHub/LinkedIn URLs hidden behind link text)
        hyperlinks = []
        for page in pdf_reader.pages:
            if "/Annots" in page:
                annotations = page["/Annots"]
                for annot in annotations:
                    annot_obj = annot.get_object()
                    if annot_obj.get("/Subtype") == "/Link":
                        action = annot_obj.get("/A")
                        if action and "/URI" in action:
                            uri = action["/URI"]
                            if uri not in hyperlinks:
                                hyperlinks.append(uri)
        
        # Append hyperlinks to the text so the AI can identify GitHub/LinkedIn URLs
        if hyperlinks:
            text += "\n\n[HYPERLINKS]\n"
            for link in hyperlinks:
                text += f"- {link}\n"
            
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from PDF.")
            
        # Send text to AI
        json_data = await extract_resume_data(text)
        return {"resume_data": json_data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
