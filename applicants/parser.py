
import PyPDF2
import re
from typing import List, Optional
from io import BytesIO

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract text from PDF resume"""
    try:
        pdf_reader = PyPDF2.PdfReader(BytesIO(pdf_bytes))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        raise Exception(f"Error extracting text from PDF: {str(e)}")

def extract_skills_from_text(text: str) -> List[str]:
    """Extract skills from resume text using keyword matching"""
    # Common technical skills keywords
    skill_keywords = [
        # Programming languages
        'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
        'swift', 'kotlin', 'scala', 'r', 'matlab', 'sql', 'html', 'css',
        
        # Frameworks and libraries
        'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'laravel',
        'fastapi', 'bootstrap', 'jquery', 'tensorflow', 'pytorch', 'pandas', 'numpy',
        
        # Databases
        'mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'oracle', 'sql server',
        
        # Tools and technologies
        'git', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'jenkins', 'linux', 'windows',
        'jira', 'agile', 'scrum', 'ci/cd', 'devops', 'microservices', 'rest api', 'graphql',
        
        # Soft skills
        'leadership', 'communication', 'teamwork', 'problem solving', 'project management',
        'analytical', 'creative', 'adaptable', 'detail oriented'
    ]
    
    # Convert text to lowercase for matching
    text_lower = text.lower()
    
    # Find matching skills
    found_skills = []
    for skill in skill_keywords:
        if skill.lower() in text_lower:
            found_skills.append(skill.title())
    
    # Remove duplicates and return
    return list(set(found_skills))

def parse_resume(pdf_bytes: bytes) -> tuple[str, List[str]]:
    """Parse resume PDF and extract text and skills"""
    text = extract_text_from_pdf(pdf_bytes)
    skills = extract_skills_from_text(text)
    return text, skills
