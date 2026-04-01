import os
import re
import time
import sqlite3
from typing import Dict, Any

try:
    from transformers import pipeline
except ImportError:
    pipeline = None


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "moodgarden.db")

classifier = None
if pipeline is not None:
    try:
        classifier = pipeline(
            "sentiment-analysis",
            model="distilbert/distilbert-base-uncased-finetuned-sst-2-english"
        )
    except Exception:
        classifier = None


POSITIVE_WORDS = {
    "happy", "good", "great", "fine", "excited", "calm", "relaxed",
    "hopeful", "better", "awesome", "nice", "motivated", "thankful",
    "grateful", "peaceful", "confident", "joyful", "content"
}

NEGATIVE_WORDS = {
    "sad", "stressed", "stress", "angry", "upset", "tired", "anxious",
    "depressed", "mad", "worried", "frustrated", "lonely", "scared",
    "overwhelmed", "hurt", "bad", "terrible", "exhausted", "drained"
}

CATEGORY_KEYWORDS = {
    "happy": ["happy", "joy", "excited", "great", "good", "amazing", "awesome", "grateful"],
    "sad": ["sad", "down", "depressed", "cry", "hurt", "lonely", "empty"],
    "stressed": ["stressed", "stress", "overwhelmed", "pressure", "busy", "burned out"],
    "anxious": ["anxious", "nervous", "worried", "panic", "scared", "uneasy"],
    "angry": ["angry", "mad", "frustrated", "annoyed", "irritated"],
    "calm": ["calm", "peaceful", "relaxed", "steady"],
    "tired": ["tired", "exhausted", "drained", "sleepy", "worn out"],
    "confused": ["confused", "lost", "unsure", "unclear", "stuck"],
    "motivated": ["motivated", "focused", "determined", "ready", "productive"]
}

TONE_MAP = {
    "happy": "uplifted",
    "sad": "heavy",
    "stressed": "tense",
    "anxious": "uneasy",
    "angry": "frustrated",
    "calm": "steady",
    "tired": "drained",
    "confused": "uncertain",
    "motivated": "driven",
    "neutral": "balanced"
}


def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ai_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_text TEXT NOT NULL,
            cleaned_text TEXT NOT NULL,
            sentiment TEXT NOT NULL,
            mood_category TEXT NOT NULL,
            emotional_tone TEXT NOT NULL,
            confidence REAL NOT NULL,
            short_reflection TEXT NOT NULL,
            supportive_reflection TEXT NOT NULL,
            fallback_used INTEGER NOT NULL,
            processing_time_ms REAL NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()


def clean_text(text: str) -> str:
    text = text.strip().lower()
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^a-zA-Z0-9\s.,!?'-]", "", text)
    return text


def keyword_score(text: str) -> Dict[str, int]:
    scores = {category: 0 for category in CATEGORY_KEYWORDS}

    for category, words in CATEGORY_KEYWORDS.items():
        for word in words:
            if word in text:
                scores[category] += 1

    return scores


def detect_mood_category(text: str, sentiment: str) -> str:
    scores = keyword_score(text)
    best_category = max(scores, key=scores.get)

    if scores[best_category] > 0:
        return best_category

    if sentiment == "positive":
        return "happy"
    if sentiment == "negative":
        return "sad"
    return "neutral"


def detect_sentiment_fallback(text: str) -> Dict[str, Any]:
    positive_hits = sum(1 for word in POSITIVE_WORDS if word in text)
    negative_hits = sum(1 for word in NEGATIVE_WORDS if word in text)
    total_hits = positive_hits + negative_hits

    if total_hits == 0:
        return {"label": "NEUTRAL", "score": 0.50}

    if positive_hits > negative_hits:
        score = min(0.95, 0.55 + (positive_hits / (total_hits + 1)))
        return {"label": "POSITIVE", "score": round(score, 3)}

    if negative_hits > positive_hits:
        score = min(0.95, 0.55 + (negative_hits / (total_hits + 1)))
        return {"label": "NEGATIVE", "score": round(score, 3)}

    return {"label": "NEUTRAL", "score": 0.50}


def normalize_sentiment_output(label: str, score: float) -> Dict[str, Any]:
    label = label.lower()

    if "pos" in label:
        sentiment = "positive"
    elif "neg" in label:
        sentiment = "negative"
    else:
        sentiment = "neutral"

    score = max(0.0, min(float(score), 1.0))
    score = round(score, 3)

    if score < 0.60:
        sentiment = "neutral"

    return {
        "sentiment": sentiment,
        "confidence": score
    }


def save_result_to_db(result_data: Dict[str, Any]):
    init_db()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO ai_results (
            user_text,
            cleaned_text,
            sentiment,
            mood_category,
            emotional_tone,
            confidence,
            short_reflection,
            supportive_reflection,
            fallback_used,
            processing_time_ms
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        result_data["original_text"],
        result_data["cleaned_text"],
        result_data["sentiment"],
        result_data["mood_category"],
        result_data["emotional_tone"],
        result_data["confidence"],
        result_data["short_reflection"],
        result_data["supportive_reflection"],
        1 if result_data["fallback_used"] else 0,
        result_data["processing_time_ms"]
    ))
    conn.commit()
    conn.close()


def get_saved_results():
    init_db()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM ai_results ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def analyze_mood_text(text: str) -> Dict[str, Any]:
    from .recommender import get_reflections

    start_time = time.perf_counter()
    cleaned = clean_text(text)
    fallback_used = False

    if classifier is not None:
        try:
            result = classifier(cleaned)[0]
            normalized = normalize_sentiment_output(result["label"], result["score"])
        except Exception:
            raw = detect_sentiment_fallback(cleaned)
            normalized = normalize_sentiment_output(raw["label"], raw["score"])
            fallback_used = True
    else:
        raw = detect_sentiment_fallback(cleaned)
        normalized = normalize_sentiment_output(raw["label"], raw["score"])
        fallback_used = True

    mood_category = detect_mood_category(cleaned, normalized["sentiment"])
    emotional_tone = TONE_MAP.get(mood_category, "balanced")
    reflections = get_reflections(mood_category)

    if normalized["confidence"] < 0.60:
        fallback_used = True
        mood_category = "neutral"
        emotional_tone = "balanced"
        reflections = get_reflections("neutral")

    response = {
        "original_text": text,
        "cleaned_text": cleaned,
        "sentiment": normalized["sentiment"] if normalized["confidence"] >= 0.60 else "neutral",
        "mood_category": mood_category,
        "emotional_tone": emotional_tone,
        "confidence": normalized["confidence"] if normalized["confidence"] >= 0.60 else 0.50,
        "short_reflection": reflections["short_reflection"],
        "supportive_reflection": reflections["supportive_reflection"],
        "fallback_used": fallback_used,
        "processing_time_ms": round((time.perf_counter() - start_time) * 1000, 2)
    }

    return response