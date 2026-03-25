from fastapi import FastAPI, UploadFile, File
import shutil
from resume_parser import extract_text, extract_skills
from recommendation_engine import get_recommendations
from roadmap_engine import generate_roadmap
from ats_engine import analyze_ats
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

class StudentProfileRequest(BaseModel):
    cgpa: float
    skills: List[str]
    interests: List[str]
    internships: List[str]
    certifications: List[str]
    bio: str

class RoadmapRequest(BaseModel):
    job: dict
    profile: StudentProfileRequest

@app.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    
    file_path = f"temp_{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    text = extract_text(file_path)
    skills = extract_skills(text)
    ats_analysis = analyze_ats(text)

    return {
        "skills": skills,
        "ats": ats_analysis
    }

@app.post("/recommend")
async def recommend_jobs(profile: StudentProfileRequest):
    recommendations = get_recommendations(profile.dict(), top_n=5)
    return {
        "recommendations": recommendations
    }

class RoadmapRequest(BaseModel):
    target_job: str
    profile: StudentProfileRequest

@app.post("/roadmap")
async def get_roadmap(request: RoadmapRequest):
    return generate_roadmap(request.profile.dict(), request.target_job)