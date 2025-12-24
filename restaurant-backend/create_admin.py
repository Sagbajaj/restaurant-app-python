
import bcrypt
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()


@app.post("/api/login")
def login(username: str, password: str, db: Session = Depends(get_db)):
    # 1. Debug: Print what the server actually receives
    print(f"Login attempt: user={username}, password_len={len(password)}") 

    user = db.query(User).filter(User.username == username).first()
    
    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    # 2. Check Password using pure bcrypt
    # We must encode strings to bytes for bcrypt
    try:
        # password.encode('utf-8') turns "admin123" into bytes
        # user.hashed_password.encode('utf-8') turns the DB hash into bytes
        if not bcrypt.checkpw(password.encode('utf-8'), user.hashed_password.encode('utf-8')):
             raise HTTPException(status_code=400, detail="Incorrect password")
    except Exception as e:
        print(f"Hashing Error: {e}")
        raise HTTPException(status_code=500, detail="Authentication system error")
    
    return {"message": "Login successful", "username": user.username}