from fastapi import APIRouter
from pydantic import BaseModel
from .ai_service import analyze_sentiment
from .recommender import map_sentiment_to_category, get_recommendation

router = APIRouter(prefix="/ai", tags=["AI"])

class AnalyzeRequest(BaseModel):
    text: str

class AnalyzeResponse(BaseModel):
    sentiment: str
    confidence: float
    category: str
    recommendation: str

@router.post("/analyze", response_model=AnalyzeResponse)
def ai_analyze(req: AnalyzeRequest):
    text = req.text.strip()

    # fallback for empty input
    if not text:
        return AnalyzeResponse(
            sentiment="NEUTRAL",
            confidence=0.0,
            category="NEUTRAL",
            recommendation=get_recommendation("NEUTRAL")
        )

    sent = analyze_sentiment(text)
    category = map_sentiment_to_category(sent["label"], sent["score"])
    rec = get_recommendation(category)

    return AnalyzeResponse(
        sentiment=sent["label"],
        confidence=sent["score"],
        category=category,
        recommendation=rec
    )