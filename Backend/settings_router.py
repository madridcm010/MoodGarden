from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User
from auth import hash_password
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/settings", tags=["Settings"])

class UpdateEmail(BaseModel):
    user_id: int
    new_email: EmailStr

class UpdatePassword(BaseModel):
    user_id: int
    new_password: str


@router.post("/update-email")
def update_email(data: UpdateEmail, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if email already exists
    existing = db.query(User).filter(User.email == data.new_email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already in use")

    user.email = data.new_email
    db.commit()

    return {"success": True, "message": "Email updated"}


@router.post("/update-password")
def update_password(data: UpdatePassword, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    hashed = hash_password(data.new_password)
    user.hashed_password = hashed
    db.commit()

    return {"success": True, "message": "Password updated"}
