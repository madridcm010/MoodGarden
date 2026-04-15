from models import User, Result, Recommendation, Feedback
from fastapi import FastAPI, HTTPException, APIRouter, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db, Base, engine
from crud import create_user, get_user_by_email
from auth import verify_password
from schemas import UserRegister, UserLogin, UserProfile
from ai.router import router as ai_router
from ai.ai_service import init_db
app = FastAPI()

# -------------------------
# CORS MUST COME FIRST
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:8000",
        "http://127.0.0.1:5500",
        "http://127.0.0.1:5501"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------
# DATABASE INIT
# -------------------------
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    init_db()
# -------------------------
# AUTH ROUTER
# -------------------------
router = APIRouter(prefix="/auth")

@router.post("/register", response_model=UserProfile)
def register(data: UserRegister, db: Session = Depends(get_db)):
    if get_user_by_email(db, data.email):
        raise HTTPException(status_code=400, detail="Email already exists")

    user = create_user(db, data.name, data.email, data.password)
    return user

@router.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = get_user_by_email(db, data.email)
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    return {"message": "Login successful", "user_id": user.id}

@app.get("/api/moods/{userId}")
def get_moods(userId: int, db: Session = Depends(get_db)):
    results = db.query(Result).filter(Result.user_id == userId).all()
    return results

# -------------------------
# INCLUDE ROUTERS
# -------------------------
app.include_router(ai_router)
app.include_router(router)

# -------------------------
# TEST DB
# -------------------------
@app.get("/test-db")
def test_db(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"connected": True}
    except Exception as e:
        return {"connected": False, "error": str(e)}