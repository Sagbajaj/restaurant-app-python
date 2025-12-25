import os
import bcrypt  # <--- Using pure bcrypt now
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel
from typing import List, Optional
from database import get_db
from models import User;

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- NEW AUTHENTICATION LOGIC (BCRYPT) ---
@app.post("/api/login")
def login(username: str, password: str, db: Session = Depends(get_db)):
    # 1. Fetch user
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    # 2. Verify password using BCRYPT directly
    try:
        # Encode inputs to bytes for checking
        if not bcrypt.checkpw(password.encode('utf-8'), user.hashed_password.encode('utf-8')):
             raise HTTPException(status_code=400, detail="Incorrect password")
    except Exception as e:
        print(f"Auth Error: {e}")
        raise HTTPException(status_code=500, detail="Authentication error")
    
    return {"message": "Login successful", "username": user.username}