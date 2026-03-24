from fastapi import FastAPI, UploadFile, File
import shutil
from resume_parser import extract_text, extract_skills

app = FastAPI()


@app.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    
    file_path = f"temp_{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    text = extract_text(file_path)
    skills = extract_skills(text)

    return {
        "skills": skills
    }