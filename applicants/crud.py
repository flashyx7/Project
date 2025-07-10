
from sqlalchemy.orm import Session
from applicants.models import Applicant
from applicants.schemas import ApplicantCreate

def create_applicant(db: Session, applicant: ApplicantCreate, user_id: int, resume_text: str = None, skills: list = None):
    db_applicant = Applicant(
        user_id=user_id,
        name=applicant.name,
        email=applicant.email,
        resume_text=resume_text,
        skills=skills or []
    )
    db.add(db_applicant)
    db.commit()
    db.refresh(db_applicant)
    return db_applicant

def get_applicants(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Applicant).offset(skip).limit(limit).all()

def get_applicant(db: Session, applicant_id: int):
    return db.query(Applicant).filter(Applicant.id == applicant_id).first()

def get_applicant_by_user_id(db: Session, user_id: int):
    return db.query(Applicant).filter(Applicant.user_id == user_id).first()

def update_applicant_resume(db: Session, applicant_id: int, resume_text: str, skills: list):
    db_applicant = db.query(Applicant).filter(Applicant.id == applicant_id).first()
    if db_applicant:
        db_applicant.resume_text = resume_text
        db_applicant.skills = skills
        db.commit()
        db.refresh(db_applicant)
    return db_applicant
