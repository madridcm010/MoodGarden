import os
import re
import time
import sqlite3
from typing import Dict, Any, List, Tuple, Optional

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import SGDClassifier
from sklearn.pipeline import Pipeline
from sklearn.exceptions import NotFittedError
from sqlalchemy import text


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "moodgarden.db")
MODEL_PATH = os.path.join(BASE_DIR, "emotion_model.joblib")


DEFAULT_TRAINING_DATA: List[Tuple[str, str]] = [
    ("I feel happy and excited today", "happy"),
    ("I am feeling really sad and alone", "sad"),
    ("I am stressed out and overwhelmed", "stressed"),
    ("I feel nervous and worried about everything", "anxious"),
    ("I am angry and frustrated right now", "angry"),
    ("I feel calm and peaceful", "calm"),
    ("I am burnt out and mentally tired", "burnout"),
    ("I feel unmotivated and stuck", "unmotivated"),
    ("I feel lonely and disconnected", "lonely"),
    ("I am confused and unsure what to do", "confused"),
    ("I feel hopeful about things getting better", "hopeful"),
    ("I feel guilty about what happened", "guilty"),
    ("I feel ashamed of myself", "ashamed"),
    ("I feel exhausted and worn out", "tired"),
    ("I feel frustrated because nothing is going right", "frustrated"),
    ("I feel overwhelmed with school and life", "overwhelmed"),
    ("I feel good and confident today", "happy"),
    ("I feel down and empty", "sad"),
    ("I am under a lot of pressure", "stressed"),
    ("I am uneasy and scared", "anxious"),
    ("I feel ready to get things done", "motivated"),
    ("I feel focused and productive", "motivated"),
]


TONE_MAP = {
    "happy": "uplifted",
    "sad": "heavy",
    "stressed": "tense",
    "anxious": "uneasy",
    "angry": "frustrated",
    "calm": "steady",
    "burnout": "drained",
    "unmotivated": "low-energy",
    "lonely": "isolated",
    "confused": "uncertain",
    "hopeful": "optimistic",
    "guilty": "regretful",
    "ashamed": "self-critical",
    "tired": "drained",
    "frustrated": "irritated",
    "overwhelmed": "flooded",
    "motivated": "driven",
    "neutral": "balanced",
}

RECOMMENDATION_BANK = {
    "happy": [
        "Keep doing what is helping you feel this way.",
        "Write down what went well today so you can remember it.",
        "Use this good energy to build a healthy routine."
    ],
    "sad": [
        "Try one small comforting thing today.",
        "Give yourself a little space and take things slowly.",
        "Reach out to someone you trust if that feels okay."
    ],
    "stressed": [
        "Focus on one task at a time instead of everything at once.",
        "Make a short list and start with the easiest thing first.",
        "Take a short break and reset before jumping back in."
    ],
    "anxious": [
        "Slow your breathing and focus on what you can control right now.",
        "Try grounding yourself by noticing what is around you.",
        "Break the problem into smaller pieces."
    ],
    "angry": [
        "Take a short pause before reacting.",
        "Step away for a moment and let the feeling cool down.",
        "Try writing out what upset you before responding."
    ],
    "calm": [
        "Keep building on what is helping you stay steady.",
        "This is a good time to reflect or recharge.",
        "Use this calm moment to plan your next step."
    ],
    "burnout": [
        "Rest matters right now, even if it is short.",
        "Lower the pressure where you can and give yourself recovery time.",
        "Try not to force too much when your energy is already low."
    ],
    "unmotivated": [
        "Start with one very small task.",
        "Make the goal tiny so it feels easier to begin.",
        "Focus on progress, not perfection."
    ],
    "lonely": [
        "Try reaching out to one person you trust.",
        "Do one thing that helps you feel a little more connected.",
        "Even a small conversation can help."
    ],
    "confused": [
        "Break the problem into smaller steps.",
        "Write down what you know and what you need next.",
        "Focus on one decision at a time."
    ],
    "hopeful": [
        "Keep moving toward what is helping you feel better.",
        "Hold onto that hope and build on it.",
        "Use this momentum to keep going."
    ],
    "guilty": [
        "Focus on what you can learn and do next.",
        "If possible, take one small step to make things right.",
        "Let the feeling guide growth, not just self-criticism."
    ],
    "ashamed": [
        "Try to give yourself some grace right now.",
        "One moment does not define who you are.",
        "Be kind to yourself while you figure out your next step."
    ],
    "tired": [
        "Rest, water, food, and a break may help.",
        "Your body and mind may need recovery right now.",
        "Try to lower the pressure for a little while."
    ],
    "frustrated": [
        "Take a short pause and reset before trying again.",
        "Focus on the part you can control.",
        "Step back for a minute so the feeling does not build more."
    ],
    "overwhelmed": [
        "Shrink the moment down to one next step.",
        "Ignore everything that is not urgent for a minute.",
        "Pick one thing and let that be enough for now."
    ],
    "motivated": [
        "Use that momentum while it is here.",
        "This is a good time to make progress on something important.",
        "Keep going and build on the energy you have."
    ],
    "neutral": [
        "Take a moment to check in with yourself.",
        "Your mood may be balanced right now, and that still matters.",
        "Think about what you need most today."
    ]
}


classifier = None


def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ai_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            user_text TEXT NOT NULL,
            cleaned_text TEXT NOT NULL,
            sentiment TEXT NOT NULL,
            mood_category TEXT NOT NULL,
            emotional_tone TEXT NOT NULL,
            confidence REAL NOT NULL,
            short_reflection TEXT NOT NULL,
            supportive_reflection TEXT NOT NULL,
            recommendation TEXT NOT NULL,
            fallback_used INTEGER NOT NULL,
            processing_time_ms REAL NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS emotion_training_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            training_text TEXT NOT NULL,
            emotion_label TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ai_feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            result_id INTEGER NOT NULL,
            user_id TEXT NOT NULL,
            helpful INTEGER,
            correct_label TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (result_id) REFERENCES ai_results(id)
        )
    """)

    conn.commit()
    conn.close()
    seed_training_data_if_needed()


def seed_training_data_if_needed():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM emotion_training_data")
    count = cursor.fetchone()[0]

    if count == 0:
        cursor.executemany("""
            INSERT INTO emotion_training_data (training_text, emotion_label)
            VALUES (?, ?)
        """, DEFAULT_TRAINING_DATA)
        conn.commit()

    conn.close()


def clean_text(text: str) -> str:
    text = text.strip().lower()
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^a-zA-Z0-9\s.,!?'-]", "", text)
    return text


def normalize_sentiment(emotion: str) -> str:
    positive_emotions = {"happy", "calm", "hopeful", "motivated"}
    negative_emotions = {
        "sad", "stressed", "anxious", "angry", "burnout",
        "unmotivated", "lonely", "confused", "guilty",
        "ashamed", "tired", "frustrated", "overwhelmed"
    }

    if emotion in positive_emotions:
        return "positive"
    if emotion in negative_emotions:
        return "negative"
    return "neutral"


def load_training_data_from_db() -> List[Tuple[str, str]]:
    init_db()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT training_text, emotion_label
        FROM emotion_training_data
    """)
    rows = cursor.fetchall()
    conn.close()

    if not rows:
        return DEFAULT_TRAINING_DATA

    return [(row[0], row[1]) for row in rows]


def get_model() -> Pipeline:
    global classifier

    if classifier is not None:
        return classifier

    if os.path.exists(MODEL_PATH):
        classifier = joblib.load(MODEL_PATH)
        return classifier

    training_data = load_training_data_from_db()
    texts = [item[0] for item in training_data]
    labels = [item[1] for item in training_data]

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), stop_words="english")),
        ("clf", SGDClassifier(loss="log_loss", max_iter=1000, tol=1e-3, random_state=42))
    ])

    pipeline.fit(texts, labels)
    joblib.dump(pipeline, MODEL_PATH)
    classifier = pipeline
    return classifier


def retrain_model():
    global classifier

    training_data = load_training_data_from_db()
    texts = [item[0] for item in training_data]
    labels = [item[1] for item in training_data]

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), stop_words="english")),
        ("clf", SGDClassifier(loss="log_loss", max_iter=1000, tol=1e-3, random_state=42))
    ])

    pipeline.fit(texts, labels)
    joblib.dump(pipeline, MODEL_PATH)
    classifier = pipeline


def add_training_example(text: str, label: str):
    init_db()
    cleaned = clean_text(text)
    label = label.strip().lower()

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO emotion_training_data (training_text, emotion_label)
        VALUES (?, ?)
    """, (cleaned, label))
    conn.commit()
    conn.close()

    retrain_model()


def save_result_to_db(result_data: Dict[str, Any]) -> int:
    init_db()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO ai_results (
            user_id,
            user_text,
            cleaned_text,
            sentiment,
            mood_category,
            emotional_tone,
            confidence,
            short_reflection,
            supportive_reflection,
            recommendation,
            fallback_used,
            processing_time_ms
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        result_data["user_id"],
        result_data["original_text"],
        result_data["cleaned_text"],
        result_data["sentiment"],
        result_data["mood_category"],
        result_data["emotional_tone"],
        result_data["confidence"],
        result_data["short_reflection"],
        result_data["supportive_reflection"],
        result_data["recommendation"],
        1 if result_data["fallback_used"] else 0,
        result_data["processing_time_ms"]
    ))

    result_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return result_id


def get_result_by_id(result_id: int) -> Optional[Dict[str, Any]]:
    init_db()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM ai_results WHERE id = ?", (result_id,))
    row = cursor.fetchone()
    conn.close()

    if row is None:
        return None

    return dict(row)


def get_saved_results():
    init_db()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM ai_results ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_user_history(user_id: str):
    init_db()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM ai_results
        WHERE user_id = ?
        ORDER BY created_at DESC
    """, (user_id,))
    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]


def get_user_summary(user_id: str) -> Dict[str, Any]:
    history = get_user_history(user_id)

    emotion_counts: Dict[str, int] = {}
    for item in history:
        emotion = item["mood_category"]
        emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1

    most_common = None
    if emotion_counts:
        most_common = max(emotion_counts, key=emotion_counts.get)

    return {
        "user_id": user_id,
        "total_entries": len(history),
        "most_common_emotion": most_common,
        "recent_history": history[:10],
        "emotion_counts": emotion_counts
    }


def choose_personalized_recommendation(user_id: str, mood_category: str) -> str:
    options = RECOMMENDATION_BANK.get(mood_category, RECOMMENDATION_BANK["neutral"])

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT r.recommendation, COUNT(*) as helpful_count
        FROM ai_feedback f
        JOIN ai_results r ON f.result_id = r.id
        WHERE f.user_id = ?
          AND f.helpful = 1
          AND r.mood_category = ?
        GROUP BY r.recommendation
        ORDER BY helpful_count DESC
    """, (user_id, mood_category))

    rows = cursor.fetchall()
    conn.close()

    if rows:
        best_recommendation = rows[0][0]
        if best_recommendation:
            return best_recommendation

    history = get_user_history(user_id)
    used_recommendations = [
        item["recommendation"]
        for item in history
        if item["mood_category"] == mood_category
    ]

    for option in options:
        if option not in used_recommendations:
            return option

    return options[0]


def save_feedback(result_id: int, user_id: str, helpful: Optional[bool] = None, correct_label: Optional[str] = None):
    init_db()

    result = get_result_by_id(result_id)
    if result is None:
        raise ValueError("Result not found.")

    helpful_value = None
    if helpful is not None:
        helpful_value = 1 if helpful else 0

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO ai_feedback (result_id, user_id, helpful, correct_label)
        VALUES (?, ?, ?, ?)
    """, (result_id, user_id, helpful_value, correct_label))

    if correct_label:
        cursor.execute("""
            UPDATE ai_results
            SET mood_category = ?,
                sentiment = ?,
                emotional_tone = ?
            WHERE id = ?
        """, (
            correct_label.strip().lower(),
            normalize_sentiment(correct_label.strip().lower()),
            TONE_MAP.get(correct_label.strip().lower(), "balanced"),
            result_id
        ))

    conn.commit()
    conn.close()

    if correct_label:
        add_training_example(result["cleaned_text"], correct_label.strip().lower())


def analyze_mood_text(user_id: str, text: str) -> Dict[str, Any]:
    from .recommender import get_reflections
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    start_time = time.perf_counter()
    cleaned = clean_text(text)
    fallback_used = False
    result_id = cursor.lastrowid;
    if not cleaned:
        return {
            "result_id": result_id,
            "user_id": user_id,
            "original_text": text,
            "cleaned_text": "",
            "sentiment": "neutral",
            "mood_category": "neutral",
            "emotional_tone": "balanced",
            "confidence": 0.50,
            "short_reflection": "Please enter how you are feeling.",
            "supportive_reflection": "Type a few words or a sentence.",
            "recommendation": "Take a moment to check in with yourself.",
            "fallback_used": True,
            "processing_time_ms": 0
        }

    try:
        model = get_model()
        probabilities = model.predict_proba([cleaned])[0]
        classes = model.classes_
        predicted_index = probabilities.argmax()
        mood_category = str(classes[predicted_index])
        confidence = round(float(probabilities[predicted_index]), 3)

    except (NotFittedError, Exception):
        retrain_model()
        model = get_model()
        probabilities = model.predict_proba([cleaned])[0]
        classes = model.classes_
        predicted_index = probabilities.argmax()
        mood_category = str(classes[predicted_index])
        confidence = round(float(probabilities[predicted_index]), 3)
        fallback_used = True

    if confidence < 0.55:
        mood_category = "neutral"
        confidence = 0.50
        fallback_used = True

    sentiment = normalize_sentiment(mood_category)
    emotional_tone = TONE_MAP.get(mood_category, "balanced")
    reflections = get_reflections(mood_category)
    recommendation = choose_personalized_recommendation(user_id, mood_category)

    response = {
        "user_id": user_id,
        "original_text": text,
        "cleaned_text": cleaned,
        "sentiment": sentiment,
        "mood_category": mood_category,
        "emotional_tone": emotional_tone,
        "confidence": confidence,
        "short_reflection": reflections["short_reflection"],
        "supportive_reflection": reflections["supportive_reflection"],
        "recommendation": recommendation,
        "fallback_used": fallback_used,
        "processing_time_ms": round((time.perf_counter() - start_time) * 1000, 2)
    }

    result_id = save_result_to_db(response)
    response["result_id"] = result_id
    return response