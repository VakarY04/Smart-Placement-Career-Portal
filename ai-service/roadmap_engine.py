RESOURCE_DB = {
    "javascript": {"title": "JavaScript Comprehensive Guide", "type": "Documentation", "link": "https://developer.mozilla.org/en-US/docs/Web/JavaScript"},
    "react": {"title": "React.js Official Tutorial", "type": "Course", "link": "https://react.dev/learn"},
    "node.js": {"title": "Node.js Basics to Advanced", "type": "Course", "link": "https://nodejs.org/en/learn"},
    "python": {"title": "Python for Everybody", "type": "Specialization", "link": "https://www.py4e.com/"},
    "machine learning": {"title": "Intro to Machine Learning", "type": "Course", "link": "https://www.coursera.org/learn/machine-learning"},
    "aws": {"title": "AWS Cloud Practitioner Essentials", "type": "Certification Prep", "link": "https://aws.amazon.com/training/"},
    "docker": {"title": "Docker for Beginners", "type": "Video Course", "link": "https://docs.docker.com/get-started/"},
    "sql": {"title": "SQL Murder Mystery", "type": "Interactive Game", "link": "https://mystery.knightlab.com/"},
    "mongodb": {"title": "MongoDB University", "type": "Course", "link": "https://learn.mongodb.com/"},
    "typescript": {"title": "TypeScript Handbook", "type": "Documentation", "link": "https://www.typescriptlang.org/docs/"}
}


def generate_roadmap(profile, job):
    if not job:
        return {"error": "Job not found"}

    student_skills = [s.strip().lower() for s in profile.get("skills", [])]
    raw_job_skills = job.get("required_skills", job.get("requiredSkills", []))
    job_skills = [s.strip().lower() for s in raw_job_skills]
    
    missing_skills = [s for s in job_skills if s not in student_skills]
    
    roadmap_steps = []
    
    # Generate timeline based on missing skills
    for i, skill in enumerate(missing_skills):
        resource = RESOURCE_DB.get(skill, {"title": f"Mastering {skill.title()}", "type": "Online Resource", "link": "#"})
        step = {
            "month": i + 1,
            "title": f"Learn {skill.title()}",
            "description": f"Focus on acquiring core fundamentals and building small practical projects using {skill.title()}.",
            "resource": {
                "name": resource["title"],
                "type": resource["type"],
                "url": resource["link"]
            }
        }
        roadmap_steps.append(step)
    
    # Final step (or immediate step if no skills are missing)
    final_month = len(missing_skills) + 1
    if len(missing_skills) == 0:
        roadmap_steps.append({
            "month": 1,
            "title": f"Ready to Apply: {job['title']}",
            "description": f"You possess all the fundamental core skills for this role! Focus entirely on interview readiness.",
            "resource": {
                "name": "Cracking the Coding Interview",
                "type": "Book",
                "url": "#"
            }
        })
    else:
        roadmap_steps.append({
            "month": final_month,
            "title": f"Interview Prep for {job['title']}",
            "description": f"Prepare for behavioral and technical interviews specifically tailored to {job['company']}.",
            "resource": {
                "name": "System Design Primer & LeetCode",
                "type": "Practice",
                "url": "https://github.com/donnemartin/system-design-primer"
            }
        })
    
    return {
        "job": job,
        "is_ready": len(missing_skills) == 0,
        "missing_skills": [s.title() for s in missing_skills],
        "missingSkills": [s.title() for s in missing_skills],
        "roadmap": roadmap_steps
    }
