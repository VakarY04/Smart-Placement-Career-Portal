import json
import os
from pathlib import Path
from dotenv import load_dotenv
import requests

load_dotenv()
load_dotenv(Path(__file__).resolve().parent / ".env")
load_dotenv(Path(__file__).resolve().parent.parent / "backend" / ".env")

GEMINI_API_URL = os.getenv(
    "GEMINI_API_URL",
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
)


def _normalize_analysis(payload):
    skills_by_category = payload.get("skills_by_category") or {}
    normalized_categories = {}
    deduped_skills = []
    seen = set()

    for category, skills in skills_by_category.items():
        valid_skills = []
        for skill in skills or []:
            normalized_skill = str(skill).strip()
            if not normalized_skill:
                continue
            valid_skills.append(normalized_skill)
            skill_key = normalized_skill.lower()
            if skill_key not in seen:
                seen.add(skill_key)
                deduped_skills.append(normalized_skill)
        if valid_skills:
            normalized_categories[str(category).strip() or "Other"] = valid_skills

    if not normalized_categories and payload.get("skills"):
        normalized_categories = {"General": [str(skill).strip() for skill in payload.get("skills", []) if str(skill).strip()]}
        deduped_skills = normalized_categories["General"]

    suggestions = []
    for suggestion in payload.get("improvement_suggestions", []):
        if not isinstance(suggestion, dict):
            continue
        suggestions.append({
            "area": str(suggestion.get("area", "")).strip(),
            "suggestion": str(suggestion.get("suggestion", "")).strip(),
            "example": str(suggestion.get("example", "")).strip(),
        })

    return {
        "skills": deduped_skills,
        "skills_by_category": normalized_categories,
        "ats_score": max(0, min(100, int(payload.get("ats_score", 0) or 0))),
        "improvement_suggestions": suggestions,
    }


def analyze_resume_with_gemini(text):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured")

    prompt = (
        "You are an expert ATS and resume reviewer. Analyze the resume text and return only valid JSON with this exact shape: "
        "{"
        "\"skills_by_category\": {\"Category\": [\"Skill\"]}, "
        "\"skills\": [\"Skill\"], "
        "\"ats_score\": 0, "
        "\"improvement_suggestions\": [{\"area\": \"\", \"suggestion\": \"\", \"example\": \"\"}]"
        "}. "
        "Rules: "
        "1. Return JSON only, no markdown fences. "
        "2. Group skills into practical categories like Programming Languages, Frameworks, Tools, Cloud, Databases, Soft Skills, or Other. "
        "3. ATS score must be an integer from 0 to 100. "
        "4. Provide 3 to 6 concise improvement suggestions."
    )

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": f"{prompt}\n\nResume text:\n{text[:30000]}"
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "responseMimeType": "application/json",
        },
    }

    try:
        with requests.Session() as session:
            # Bypass broken system/local proxy settings; Gemini is reachable directly.
            session.trust_env = False
            response = session.post(
                GEMINI_API_URL,
                headers={
                    "Content-Type": "application/json",
                    "x-goog-api-key": api_key,
                },
                json=payload,
                timeout=40,
            )
        response.raise_for_status()
        raw_body = response.text
    except requests.HTTPError as exc:
        error_body = exc.response.text if exc.response is not None else str(exc)
        raise RuntimeError(f"Gemini request failed: {error_body}") from exc
    except requests.RequestException as exc:
        raise RuntimeError(f"Gemini request failed: {exc}") from exc

    data = json.loads(raw_body)
    candidate_text = (
        data.get("candidates", [{}])[0]
        .get("content", {})
        .get("parts", [{}])[0]
        .get("text", "{}")
    )

    cleaned_text = candidate_text.strip()
    if cleaned_text.startswith("```"):
        cleaned_text = cleaned_text.strip("`")
        if cleaned_text.startswith("json"):
            cleaned_text = cleaned_text[4:].strip()

    try:
        parsed = json.loads(cleaned_text)
    except json.JSONDecodeError as exc:
        raise RuntimeError("Gemini returned invalid JSON") from exc

    return _normalize_analysis(parsed)
