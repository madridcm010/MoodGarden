from ai.router import router as ai_router
from fastapi import FastAPI, HTTPException, APIRouter
from models import UserRegister, UserLogin
from auth import create_user, authenticate_user

app = FastAPI()

app.include_router(ai_router)

@app.post("/register")
def register_user(data: UserRegister):
    success = create_user(data.username, data.password)
    if not success:
        raise HTTPException(status_code=400, detail="Username already exists")
    return {"message": "User registered successfully"}

@app.post("/login")
def login_user(data: UserLogin):
    authenticated = authenticate_user(data.username, data.password)
    if not authenticated:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {"message": "Login successful"}