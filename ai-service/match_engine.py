from functools import lru_cache
from typing import Dict, List

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


def _normalize_skill(skill: str) -> str:
    return skill.strip().lower()


def _dedupe_skills(skills: List[str]) -> List[str]:
    seen = set()
    normalized = []

    for skill in skills or []:
        if not isinstance(skill, str):
            continue
        clean_skill = _normalize_skill(skill)
        if not clean_skill or clean_skill in seen:
            continue
        seen.add(clean_skill)
        normalized.append(clean_skill)

    return normalized


@lru_cache(maxsize=1)
def get_embedding_model() -> SentenceTransformer:
    return SentenceTransformer("all-MiniLM-L6-v2")


def _semantic_score(student_bio: str, job_description: str) -> float:
    student_text = (student_bio or "").strip()
    job_text = (job_description or "").strip()

    if not student_text or not job_text:
        return 0.0

    model = get_embedding_model()
    embeddings = model.encode([student_text, job_text])
    similarity = float(cosine_similarity([embeddings[0]], [embeddings[1]])[0][0])
    similarity = max(0.0, min(similarity, 1.0))

    return round(similarity * 20, 2)


def _match_status(score: float) -> str:
    if score >= 80:
        return "Highly Recommended"
    if score >= 60:
        return "Recommended"
    if score >= 40:
        return "Potential Match"
    return "Needs Upskilling"


def analyze_match(student: Dict, job: Dict) -> Dict:
    student_skills = _dedupe_skills(student.get("skills", []))
    required_skills = _dedupe_skills(job.get("required_skills", []))
    student_skill_set = set(student_skills)

    matched_skills = sorted(student_skill_set.intersection(required_skills))
    missing_skills = [
        original_skill
        for original_skill in job.get("required_skills", [])
        if isinstance(original_skill, str) and _normalize_skill(original_skill) not in student_skill_set
    ]

    if required_skills:
        skills_score = round((len(matched_skills) / len(required_skills)) * 60, 2)
    else:
        skills_score = 60.0

    academic_score = 20.0 if float(student.get("cgpa", 0) or 0) >= float(job.get("min_cgpa", 0) or 0) else 0.0
    semantic_score = _semantic_score(student.get("bio", ""), job.get("description", ""))

    # The component scores are already weighted to 60/20/20 points.
    readiness_score = round(skills_score + academic_score + semantic_score, 2)

    return {
        "readiness_score": readiness_score,
        "matchPercentage": readiness_score,
        "breakdown": {
            "skills": skills_score,
            "academic": academic_score,
            "semantic": semantic_score,
        },
        "missing_skills": missing_skills,
        "missingSkills": missing_skills,
        "match_status": _match_status(readiness_score),
    }


def analyze_matches(student: Dict, jobs: List[Dict]) -> List[Dict]:
    if not jobs:
        return []

    model = get_embedding_model()
    student_bio = (student.get("bio", "") or "").strip()
    job_descriptions = [(job.get("description", "") or "").strip() for job in jobs]

    semantic_scores = []
    if student_bio and any(job_descriptions):
        embeddings = model.encode([student_bio, *job_descriptions])
        student_embedding = embeddings[0]
        for index, description in enumerate(job_descriptions, start=1):
            if not description:
                semantic_scores.append(0.0)
                continue
            similarity = float(cosine_similarity([student_embedding], [embeddings[index]])[0][0])
            similarity = max(0.0, min(similarity, 1.0))
            semantic_scores.append(round(similarity * 20, 2))
    else:
        semantic_scores = [0.0 for _ in jobs]

    analyzed_jobs = []

    for job, semantic_score in zip(jobs, semantic_scores):
        result = analyze_match(student, job)
        result["breakdown"]["semantic"] = semantic_score
        result["readiness_score"] = round(
            result["breakdown"]["skills"] + result["breakdown"]["academic"] + semantic_score,
            2,
        )
        result["matchPercentage"] = result["readiness_score"]
        result["match_status"] = _match_status(result["readiness_score"])
        analyzed_jobs.append({
            "job": job,
            "matchPercentage": result["matchPercentage"],
            "breakdown": result["breakdown"],
            "missingSkills": result["missingSkills"],
            "matchStatus": result["match_status"],
            "readinessScore": result["readiness_score"],
        })

    analyzed_jobs.sort(key=lambda item: item["matchPercentage"], reverse=True)
    return analyzed_jobs
