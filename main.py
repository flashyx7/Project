
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import uvicorn

from database import engine, Base
from auth.router import router as auth_router
from jobs.router import router as jobs_router
from applicants.router import router as applicants_router
from matching.router import router as matching_router
from interviews.router import router as interviews_router
from offers.router import router as offers_router

# Create upload directories
os.makedirs("uploads", exist_ok=True)
os.makedirs("offer_letters", exist_ok=True)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Recruitment Tracker System",
    description="A complete hiring management system with job postings, resume uploads, skill matching, interview scheduling, and offer letter generation.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://0.0.0.0:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for offer letters
app.mount("/offer_letters", StaticFiles(directory="offer_letters"), name="offer_letters")

# Include routers
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(jobs_router, prefix="/jobs", tags=["Jobs"])
app.include_router(applicants_router, prefix="/applicants", tags=["Applicants"])
app.include_router(matching_router, prefix="/matching", tags=["Matching"])
app.include_router(interviews_router, prefix="/interviews", tags=["Interviews"])
app.include_router(offers_router, prefix="/offers", tags=["Offers"])

@app.get("/")
async def root():
    return {"message": "Welcome to Recruitment Tracker System", "docs": "/docs"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
