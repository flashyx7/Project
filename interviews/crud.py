
from sqlalchemy.orm import Session
from interviews.models import Interview
from interviews.schemas import InterviewCreate, InterviewUpdate

def create_interview(db: Session, interview: InterviewCreate):
    db_interview = Interview(
        applicant_id=interview.applicant_id,
        position_id=interview.position_id,
        date_time=interview.date_time
    )
    db.add(db_interview)
    db.commit()
    db.refresh(db_interview)
    return db_interview

def get_interviews(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Interview).offset(skip).limit(limit).all()

def get_interview(db: Session, interview_id: int):
    return db.query(Interview).filter(Interview.id == interview_id).first()

def update_interview(db: Session, interview_id: int, interview_update: InterviewUpdate):
    db_interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if db_interview:
        update_data = interview_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_interview, field, value)
        db.commit()
        db.refresh(db_interview)
    return db_interview

def get_interviews_by_company(db: Session, company_id: int):
    return db.query(Interview).join(Interview.position).filter_by(company_id=company_id).all()
