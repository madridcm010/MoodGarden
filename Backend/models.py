from sqlalchemy import Column, Integer, String, Float, Boolean
from database import Base
from sqlalchemy.sql import func
from sqlalchemy import DateTime 

# -------------------------
# USERS TABLE
# -------------------------
print(">>> USING MODELS FROM:", __file__)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)


# -------------------------
# RESULTS TABLE (AI output)
# -------------------------
class Result(Base):
    __tablename__ = "ai_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    user_text = Column(String)
    cleaned_text = Column(String)
    sentiment = Column(String)
    mood_category = Column(String)
    emotional_tone = Column(String)
    confidence = Column(Float)
    short_reflection = Column(String)
    supportive_reflection = Column(String)
    recommendation = Column(String)
    fallback_used = Column(Boolean)
    processing_time_ms = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Feedback(Base):
    __tablename__ = "ai_feedback"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String)
    result_id = Column(Integer)
    helpful = Column(Boolean)
    correct_label = Column(String)



# -------------------------
# RECOMMENDATIONS TABLE
# -------------------------
class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String)
    recommendation = Column(String)  # REQUIRED by your SQL


