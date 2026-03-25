from sqlalchemy.orm import Session
from models import User
from auth import hash_password

def create_user(db: Session, name:str, email: str, password: str):
    hashed = hash_password(password)
    user = User( name=name,email=email, hashed_password=hashed)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

#def get_user_by_username(db: Session, username: str):
    #return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()