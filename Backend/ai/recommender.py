def map_sentiment_to_category(label: str, score: float) -> str:
    if score < 0.60:
        return "NEUTRAL"
    if label == "POSITIVE":
        return "MAINTAIN"
    if label == "NEGATIVE":
        return "CALM"
    return "NEUTRAL"

RECOMMENDATIONS = {
    "MAINTAIN": "Keep it going—write one thing you're proud of today.",
    "CALM": "Try slow breathing for one minute or take a short walk.",
    "NEUTRAL": "Do a quick check-in and set one small goal for today."
}

def get_recommendation(category: str) -> str:
    return RECOMMENDATIONS.get(category, RECOMMENDATIONS["NEUTRAL"])