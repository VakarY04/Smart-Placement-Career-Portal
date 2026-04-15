import re
from ats_engine import analyze_ats, STRONG_ACTION_VERBS


SKILL_CATEGORIES = {
    "Programming Languages": [
        "python", "java", "javascript", "typescript", "c", "c++", "c#", "go", "ruby", "php",
        "kotlin", "swift", "r", "sql",
    ],
    "Frontend": [
        "react", "next.js", "next", "redux", "html", "css", "tailwind", "bootstrap", "figma",
        "framer motion", "vue", "angular",
    ],
    "Backend": [
        "node", "node.js", "express", "django", "flask", "spring", "spring boot", "rest api",
        "graphql", "fastapi",
    ],
    "Databases": [
        "mongodb", "mysql", "postgresql", "postgres", "sqlite", "redis", "firebase",
    ],
    "Cloud & DevOps": [
        "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "terraform", "linux", "ci/cd",
    ],
    "Data & AI": [
        "machine learning", "deep learning", "data analysis", "pandas", "numpy", "matplotlib",
        "tensorflow", "pytorch", "nlp", "scikit-learn",
    ],
    "Tools": [
        "git", "github", "postman", "jira", "vite", "webpack", "npm", "yarn",
    ],
}


def _find_skills(text):
    normalized = (text or "").lower()
    categorized = {}
    seen = set()

    for category, skills in SKILL_CATEGORIES.items():
        matches = []
        for skill in skills:
            pattern = rf"(?<!\w){re.escape(skill)}(?!\w)"
            if re.search(pattern, normalized):
                label = skill.replace(".js", ".js").title()
                label = label.replace("Aws", "AWS").replace("Gcp", "GCP").replace("Ci/Cd", "CI/CD").replace("Nlp", "NLP")
                if skill not in seen:
                    seen.add(skill)
                    matches.append(label)
        if matches:
            categorized[category] = sorted(matches)

    flat_skills = []
    for skill_list in categorized.values():
        flat_skills.extend(skill_list)

    return categorized, flat_skills


def _has_section(text, keywords):
    lowered = text.lower()
    return any(keyword in lowered for keyword in keywords)


def _build_suggestions(text, ats_feedback, categorized_skills):
    lowered = text.lower()
    suggestions = []
    word_count = len(text.split())
    bullet_count = len(re.findall(r"^[\-\*\u2022]", text, flags=re.MULTILINE))
    quant_count = len(re.findall(r"\d+%|\d+\+?|\$\d+", text))
    verb_count = sum(1 for verb in STRONG_ACTION_VERBS if verb in lowered)

    if not _has_section(lowered, ["summary", "profile", "objective"]):
        suggestions.append({
            "area": "Professional Summary",
            "suggestion": "Add a short 2-3 line summary at the top to frame your target role, core stack, and strongest outcomes.",
            "example": "Full-stack developer with experience building React and Node.js products, optimizing APIs, and shipping user-facing dashboards.",
        })

    if quant_count < 3:
        suggestions.append({
            "area": "Impact Metrics",
            "suggestion": "Quantify more bullets with speed, scale, accuracy, or adoption metrics so recruiters can see measurable impact quickly.",
            "example": "Improved dashboard load time by 32% and reduced API response latency from 900ms to 420ms.",
        })

    if verb_count < 6:
        suggestions.append({
            "area": "Bullet Strength",
            "suggestion": "Start more bullets with strong action verbs to make your contributions sound more direct and ownership-driven.",
            "example": "Engineered a resume analysis workflow using FastAPI and React instead of 'Worked on a resume upload feature'.",
        })

    if bullet_count < 4:
        suggestions.append({
            "area": "Scannability",
            "suggestion": "Convert dense paragraphs into concise bullet points so ATS tools and recruiters can scan projects and experience faster.",
            "example": "Built job recommendation engine, Integrated resume parsing API, Improved profile completion flow.",
        })

    if not _has_section(lowered, ["project", "projects"]):
        suggestions.append({
            "area": "Projects Section",
            "suggestion": "Add a projects section to showcase technical depth, especially if your formal experience is still limited.",
            "example": "AI Career Portal | React, Node.js, MongoDB | Built resume parsing, ATS insights, and recommendation workflows.",
        })

    if not _has_section(lowered, ["github", "linkedin", "portfolio"]):
        suggestions.append({
            "area": "Credibility Links",
            "suggestion": "Include GitHub, LinkedIn, or portfolio links so recruiters can verify depth beyond the PDF.",
            "example": "GitHub: github.com/yourname | Portfolio: yourname.dev | LinkedIn: linkedin.com/in/yourname",
        })

    if len(categorized_skills) < 2:
        suggestions.append({
            "area": "Technical Breadth",
            "suggestion": "Surface more tools, frameworks, and databases explicitly so the resume matches a wider set of job filters.",
            "example": "Skills: React, Node.js, MongoDB, Express, Tailwind CSS, Git, Postman, AWS",
        })

    for feedback in ats_feedback[:2]:
        suggestions.append({
            "area": "ATS Insight",
            "suggestion": feedback,
            "example": "Revise one recent bullet to reflect this recommendation in a more measurable, action-first format.",
        })

    return suggestions[:6]


def analyze_resume_locally(text):
    categorized_skills, flat_skills = _find_skills(text)
    ats = analyze_ats(text)
    suggestions = _build_suggestions(text, ats.get("feedback", []), categorized_skills)

    return {
        "provider": "ai",
        "skills": flat_skills,
        "skills_by_category": categorized_skills or {"General": flat_skills},
        "ats_score": int(ats.get("score", 0) or 0),
        "improvement_suggestions": suggestions,
    }
