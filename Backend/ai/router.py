from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from .ai_service import (
    analyze_mood_text,
    get_saved_results,
    get_user_history,
    get_user_summary,
    save_feedback
)

router = APIRouter(prefix="/ai", tags=["AI"])


class AnalyzeRequest(BaseModel):
    user_id: str
    text: str


class AnalyzeResponse(BaseModel):
    result_id: int
    sentiment: str
    confidence: float
    category: str
    emotional_tone: str
    short_reflection: str
    supportive_reflection: str
    recommendation: str
    fallback_used: bool
    processing_time_ms: float


class FeedbackRequest(BaseModel):
    user_id: str
    result_id: int
    helpful: Optional[bool] = None
    correct_label: Optional[str] = None


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest):
    if not request.user_id.strip():
        raise HTTPException(status_code=400, detail="User ID is required.")

    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    result = analyze_mood_text(request.user_id, request.text)

    return AnalyzeResponse(
        result_id=result["result_id"],
        sentiment=result["sentiment"],
        confidence=result["confidence"],
        category=result["mood_category"],
        emotional_tone=result["emotional_tone"],
        short_reflection=result["short_reflection"],
        supportive_reflection=result["supportive_reflection"],
        recommendation=result["recommendation"],
        fallback_used=result["fallback_used"],
        processing_time_ms=result["processing_time_ms"]
    )


@router.post("/feedback")
def feedback(request: FeedbackRequest):
    if not request.user_id.strip():
        raise HTTPException(status_code=400, detail="User ID is required.")

    try:
        save_feedback(
            result_id=request.result_id,
            user_id=request.user_id,
            helpful=request.helpful,
            correct_label=request.correct_label
        )
        return {"message": "Feedback saved successfully."}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/results")
def results():
    return get_saved_results()


@router.get("/history/{user_id}")
def history(user_id: str):
    return get_user_history(user_id)


@router.get("/summary/{user_id}")
def summary(user_id: str):
    return get_user_summary(user_id)