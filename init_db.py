
#!/usr/bin/env python3

import sys
import os

# Add the current directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, Base

# Import all models to ensure they're registered with SQLAlchemy
from auth.models import User, UserRole
from jobs.models import JobPosition
from applicants.models import Applicant
from interviews.models import Interview, InterviewStatus
from offers.models import OfferLetter

def init_database():
    """Initialize the database with all tables"""
    print("Creating database tables...")
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully!")
        return True
    except Exception as e:
        print(f"Error creating database tables: {e}")
        return False

if __name__ == "__main__":
    success = init_database()
    if success:
        print("Database initialization completed.")
        sys.exit(0)
    else:
        print("Database initialization failed.")
        sys.exit(1)
