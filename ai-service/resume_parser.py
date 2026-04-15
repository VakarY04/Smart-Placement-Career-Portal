import pdfplumber
import json

# Load skills
with open("skills.json") as f:
    SKILLS_DB = json.load(f)


def extract_text(file_path):
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text


def extract_skills(text):
    normalized_text = (text or "").lower()
    found_skills = []

    for skill in SKILLS_DB:
        if skill in normalized_text:
            found_skills.append(skill)

    return list(set(found_skills))
