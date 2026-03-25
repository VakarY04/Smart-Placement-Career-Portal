import re

STRONG_ACTION_VERBS = [
    "architected", "developed", "engineered", "spearheaded", "implemented", 
    "resolved", "maximized", "optimized", "managed", "designed", "created", 
    "orchestrated", "led", "mentored", "delivered", "built", "accelerated",
    "deployed", "launched", "reduced", "increased", "achieved", "improved",
    "streamlined", "transformed", "modernized"
]

WEAK_WORDS = [
    "helped", "worked on", "responsible for", "assisted", "did", "made",
    "tried", "good at", "hard worker", "team player"
]

def analyze_ats(text):
    text_lower = text.lower()
    score = 100
    feedback = []

    # 1. Action Verb Analysis
    verb_count = sum(1 for verb in STRONG_ACTION_VERBS if verb in text_lower)
    if verb_count < 5:
        score -= 20
        feedback.append("Low narrative impact. Use stronger action verbs like 'Architected', 'Spearheaded', or 'Optimized' to begin your bullet points.")
    elif verb_count < 10:
        score -= 10
        feedback.append("Moderate action verb usage. Incorporate more high-impact words to demonstrate leadership and ownership.")

    # 2. Weak Word Filtering
    weak_count = sum(1 for word in WEAK_WORDS if word in text_lower)
    if weak_count > 0:
        score -= (weak_count * 2)
        feedback.append(f"Avoid passive phrases. We detected '{weak_count}' weak phrases like 'responsible for' or 'helped'. Replace them with direct active verbs.")

    # 3. Numerical Quantifications (Impact parsing checking for % or $ or numbers)
    has_numbers = bool(re.search(r'\d+', text))
    has_percentages = bool(re.search(r'\d+%', text))
    
    if not has_numbers:
        score -= 25
        feedback.append("No numerical data found. To pass top-tier ATS systems, you MUST quantify your bullet points (e.g. 'Reduced latency by 450ms' or 'Managed a team of 5').")
    elif not has_percentages:
        score -= 10
        feedback.append("Good use of numbers, but try incorporating percentage improvements (e.g. 'Increased efficiency by 20%') to clearly demonstrate business impact.")

    # 4. Length / Density
    word_count = len(text.split())
    if word_count < 150:
        score -= 15
        feedback.append("Resume is dangerously sparse. Expand upon your actual technical contributions and methodologies.")
    elif word_count > 800:
        score -= 15
        feedback.append("Resume text is highly dense. Top recruiters span 6 seconds globally per resume. Cut down unnecessary fat and focus on core impact algorithms.")

    # Bound
    score = max(0, min(100, score))

    if score >= 90:
        feedback.insert(0, "Excellent format! Your resume is highly competitive for Top N Companies.")

    return {
        "score": score,
        "feedback": list(set(feedback))
    }
