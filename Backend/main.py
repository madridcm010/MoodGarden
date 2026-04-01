from ai.router import router as ai_router
from fastapi import FastAPI, HTTPException, APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db, Base, engine
from crud import create_user, get_user_by_email
from auth import verify_password
from schemas import UserRegister, UserLogin, UserProfile
from models import User
import models
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.include_router(ai_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

router = APIRouter(prefix="/auth")

Base.metadata.create_all(bind=engine)

@router.post("/register", response_model=UserProfile)
def register(data: UserRegister, db: Session = Depends(get_db)):
    if get_user_by_email(db, data.email):
        raise HTTPException(status_code=400, detail="Username already exists")

    user = create_user(db, data.name, data.email, data.password)
    return user

@router.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = get_user_by_email(db, data.email)
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    return {"message": "Login successful", "user_id": user.id}

app.include_router(router)

@app.get("/test-db")
def test_db(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"connected": True}
    except Exception as e:
        return {"connected": False, "error": str(e)}