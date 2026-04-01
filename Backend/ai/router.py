from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from .ai_service import analyze_mood_text, save_result_to_db, get_saved_results

router = APIRouter(prefix="/ai", tags=["AI"])


class AnalyzeRequest(BaseModel):
    text: str
    store_result: bool = True


class AnalyzeResponse(BaseModel):
    sentiment: str
    confidence: float
    category: str
    emotional_tone: str
    short_reflection: str
    supportive_reflection: str
    fallback_used: bool
    processing_time_ms: float


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    result = analyze_mood_text(request.text)

    if request.store_result:
        save_result_to_db(result)

    return AnalyzeResponse(
        sentiment=result["sentiment"],
        confidence=result["confidence"],
        category=result["mood_category"],
        emotional_tone=result["emotional_tone"],
        short_reflection=result["short_reflection"],
        supportive_reflection=result["supportive_reflection"],
        fallback_used=result["fallback_used"],
        processing_time_ms=result["processing_time_ms"]
    )


@router.get("/results")
def results():
    return get_saved_results()