
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from auth.router import get_current_user, require_role
from auth.models import User
from applicants import schemas, crud
from applicants.parser import parse_resume

router = APIRouter()

@router.post("/", response_model=schemas.Applicant)
async def register_applicant(
    name: str,
    email: str,
    resume: UploadFile = File(...),
    current_user: User = Depends(require_role("applicant")),
    db: Session = Depends(get_db)
):
    """Register applicant and upload resume PDF"""
    # Check if applicant already exists for this user
    existing_applicant = crud.get_applicant_by_user_id(db, user_id=current_user.id)
    if existing_applicant:
        raise HTTPException(status_code=400, detail="Applicant profile already exists")
    
    # Validate file type
    if not resume.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        # Read and parse resume
        resume_bytes = await resume.read()
        resume_text, skills = parse_resume(resume_bytes)
        
        # Create applicant profile
        applicant_data = schemas.ApplicantCreate(name=name, email=email)
        return crud.create_applicant(
            db=db, 
            applicant=applicant_data, 
            user_id=current_user.id,
            resume_text=resume_text,
            skills=skills
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing resume: {str(e)}")

@router.get("/", response_model=List[schemas.Applicant])
def list_applicants(
    skip: int = 0, 
    limit: int = 100,
    current_user: User = Depends(require_role("company")),
    db: Session = Depends(get_db)
):
    """List all applicants (HR only)"""
    return crud.get_applicants(db, skip=skip, limit=limit)

@router.get("/{applicant_id}", response_model=schemas.Applicant)
def get_applicant(
    applicant_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get applicant details"""
    applicant = crud.get_applicant(db, applicant_id=applicant_id)
    if applicant is None:
        raise HTTPException(status_code=404, detail="Applicant not found")
    
    # Applicants can only view their own profile, companies can view all
    if current_user.role.value == "applicant" and applicant.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this profile")
    
    return applicant
