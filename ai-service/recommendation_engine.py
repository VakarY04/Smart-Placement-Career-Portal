import json
import math

# Load the jobs database
def load_jobs():
    with open("jobs.json", "r") as f:
        return json.load(f)

def calculate_match_score(student_profile, job):
    score = 0.0
    max_score = 100
    details = []

    # 1. Skill Matching (Weight: 60%)
    student_skills = [s.lower() for s in student_profile.get("skills", [])]
    job_skills = [s.lower() for s in job.get("required_skills", [])]
    
    if not job_skills:
        skill_score = 60
    else:
        matched_skills = set(student_skills).intersection(set(job_skills))
        skill_score = (len(matched_skills) / len(job_skills)) * 60
        if len(matched_skills) > 0:
            details.append(f"Matches {len(matched_skills)} key skills: {', '.join(matched_skills).title()}")
        else:
            details.append("Missing required core skills.")
            
    score += skill_score

    # 2. CGPA Matching (Weight: 20%)
    # If student meets or exceeds min CGPA, full 20. If below, scale down.
    student_cgpa = float(student_profile.get("cgpa", 0.0))
    min_cgpa = float(job.get("min_cgpa", 0.0))
    
    if student_cgpa >= min_cgpa:
        score += 20
        details.append(f"Meets CGPA requirement ({student_cgpa} >= {min_cgpa})")
    else:
        # Penalty for low CGPA
        cgpa_ratio = student_cgpa / min_cgpa if min_cgpa > 0 else 0
        score += (cgpa_ratio * 15) # Max 15 if below
        details.append(f"CGPA is slightly below the recommended {min_cgpa}")

    # 3. Contextual / Bonus Matching (Weight: 20%)
    # Looking for extra keywords in bio, interests, or internships
    context_text = " ".join([
        student_profile.get("bio", ""),
        " ".join(student_profile.get("interests", [])),
        " ".join(student_profile.get("internships", [])),
        " ".join(student_profile.get("certifications", []))
    ]).lower()
    
    context_matches = 0
    for js in job_skills:
        if js in context_text:
            context_matches += 1
            
    context_score = min((context_matches / max(1, len(job_skills))) * 20, 20)
    score += context_score
    
    if context_score > 10:
        details.append("Strong background alignment in internships/bio.")

    return {
        "job": job,
        "match_percentage": round(score),
        "match_details": details
    }

def get_recommendations(student_profile, top_n=5):
    jobs = load_jobs()
    recommendations = []
    
    for job in jobs:
        match_result = calculate_match_score(student_profile, job)
        recommendations.append(match_result)
        
    recommendations.sort(key=lambda x: x["match_percentage"], reverse=True)
    return recommendations[:top_n]
