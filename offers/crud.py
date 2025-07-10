
from sqlalchemy.orm import Session
from offers.models import OfferLetter
from offers.schemas import OfferLetterCreate

def create_offer_letter(db: Session, offer: OfferLetterCreate, pdf_path: str):
    db_offer = OfferLetter(
        applicant_id=offer.applicant_id,
        position_id=offer.position_id,
        pdf_path=pdf_path
    )
    db.add(db_offer)
    db.commit()
    db.refresh(db_offer)
    return db_offer

def get_offer_letter(db: Session, offer_id: int):
    return db.query(OfferLetter).filter(OfferLetter.id == offer_id).first()

def get_offers_by_company(db: Session, company_id: int):
    return db.query(OfferLetter).join(OfferLetter.position).filter_by(company_id=company_id).all()
