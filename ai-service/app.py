from fastapi import FastAPI, UploadFile, File
import shutil
from resume_parser import extract_text
from recommendation_engine import get_recommendations
from roadmap_engine import generate_roadmap
from match_engine import analyze_match, analyze_matches, get_embedding_model
from gemini_resume_analyzer import analyze_resume_with_gemini
from fallback_resume_analyzer import analyze_resume_locally
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()


@app.on_event("startup")
async def warm_embedding_model():
    get_embedding_model()

class StudentProfileRequest(BaseModel):
    cgpa: float
    skills: List[str]
    interests: List[str]
    internships: List[str]
    certifications: List[str]
    bio: str

class StudentMatchRequest(BaseModel):
    skills: List[str]
    bio: str
    cgpa: float


class JobMatchRequest(BaseModel):
    required_skills: List[str]
    description: str
    min_cgpa: float
    id: Optional[str] = None
    _id: Optional[str] = None
    title: Optional[str] = None
    company: Optional[str] = None


class AnalyzeMatchRequest(BaseModel):
    student: StudentMatchRequest
    job: JobMatchRequest


class AnalyzeMatchesRequest(BaseModel):
    student: StudentMatchRequest
    jobs: List[JobMatchRequest]

@app.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    file_path = f"temp_{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    text = extract_text(file_path)
    try:
        gemini_analysis = analyze_resume_with_gemini(text)
        gemini_analysis["provider"] = "gemini"
        return gemini_analysis
    except Exception as exc:
        fallback_analysis = analyze_resume_locally(text)
        fallback_analysis["provider"] = "fallback"
        fallback_analysis["warning"] = str(exc)
        return fallback_analysis

@app.post("/recommend")
async def recommend_jobs(profile: StudentProfileRequest):
    recommendations = get_recommendations(profile.dict(), top_n=5)
    return {
        "recommendations": recommendations
    }

class RoadmapRequest(BaseModel):
    job: dict
    profile: StudentProfileRequest

@app.post("/roadmap")
async def get_roadmap(request: RoadmapRequest):
    return generate_roadmap(request.profile.dict(), request.job)


@app.post("/analyze-match")
async def analyze_student_job_match(request: AnalyzeMatchRequest):
    return analyze_match(request.student.dict(), request.job.dict())


@app.post("/analyze-matches")
async def analyze_student_job_matches(request: AnalyzeMatchesRequest):
    return {
        "recommendations": analyze_matches(
            request.student.dict(),
            [job.dict() for job in request.jobs],
        )
    }
