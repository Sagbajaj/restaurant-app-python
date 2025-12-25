import os
import bcrypt  # <--- Using pure bcrypt now
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel
from typing import List, Optional

# --- DATABASE CONFIG ---
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Fallback for local testing if env var is missing
if not DATABASE_URL:
    print("WARNING: No DATABASE_URL found. App will crash on DB access.")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- DB MODELS ---
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)



class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    user = Column(String)
    text = Column(String)
    rating = Column(Integer)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    restaurant = relationship("Restaurant", back_populates="reviews")

# Create tables
Base.metadata.create_all(bind=engine)

# --- SCHEMAS ---
class ReviewSchema(BaseModel):
    id: Optional[int]
    user: str
    text: str
    rating: int
    class Config: from_attributes = True

class RestaurantSchema(BaseModel):
    id: Optional[int]
    name: str
    res_type: str
    cuisine: str
    address: str
    phone: str
    wifi_ssid: Optional[str]
    wifi_password: Optional[str]
    reviews: List[ReviewSchema] = []
    class Config: from_attributes = True

# --- APP ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

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

# # --- OTHER ROUTES ---
# @app.get("/api/restaurants", response_model=List[RestaurantSchema])
# def get_restaurants(db: Session = Depends(get_db)):
#     return db.query(Restaurant).all()

# @app.post("/api/restaurants", response_model=RestaurantSchema)
# def create_restaurant(rest: RestaurantSchema, db: Session = Depends(get_db)):
    # Safely convert Pydantic model to dict
    data = rest.model_dump(exclude={"reviews", "id"})
    db_rest = Restaurant(**data)
    db.add(db_rest)
    db.commit()
    db.refresh(db_rest)
    return db_rest

@app.delete("/api/reviews/{review_id}")
def delete_review(review_id: int, db: Session = Depends(get_db)):
    db.query(Review).filter(Review.id == review_id).delete()
    db.commit()
    return {"message": "Review deleted"}