
from sqlalchemy.orm import Session
from jobs.models import JobPosition
from jobs.schemas import JobPositionCreate, JobPositionUpdate

def create_job(db: Session, job: JobPositionCreate, company_id: int):
    db_job = JobPosition(
        title=job.title,
        description=job.description,
        skills=job.skills,
        company_id=company_id
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

def get_jobs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(JobPosition).offset(skip).limit(limit).all()

def get_job(db: Session, job_id: int):
    return db.query(JobPosition).filter(JobPosition.id == job_id).first()

def update_job(db: Session, job_id: int, job_update: JobPositionUpdate):
    db_job = db.query(JobPosition).filter(JobPosition.id == job_id).first()
    if db_job:
        update_data = job_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_job, field, value)
        db.commit()
        db.refresh(db_job)
    return db_job

def delete_job(db: Session, job_id: int):
    db_job = db.query(JobPosition).filter(JobPosition.id == job_id).first()
    if db_job:
        db.delete(db_job)
        db.commit()
    return db_job
