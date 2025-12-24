import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel
from typing import List, Optional
from passlib.context import CryptContext

# --- DATABASE CONFIG ---
# Render will provide the DATABASE_URL environment variable
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
# Setup Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- DB MODELS ---
class Restaurant(Base):
    __tablename__ = "restaurants"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    res_type = Column(String)
    cuisine = Column(String)
    location = Column(String)
    address = Column(String)
    phone = Column(String)
    email = Column(String)
    website = Column(String)
    wifi_ssid = Column(String)
    wifi_password = Column(String)
    
    # Relationship to reviews (Make sure you have the Review class defined below)
    reviews = relationship("Review", back_populates="restaurant", cascade="all, delete-orphan")

class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    user = Column(String)
    text = Column(String)
    rating = Column(Integer)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    restaurant = relationship("Restaurant", back_populates="reviews")

# Create tables in Supabase
Base.metadata.create_all(bind=engine)

# --- SCHEMAS (Pydantic) ---
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

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    
# --- API ---
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

@app.get("/api/restaurants", response_model=List[RestaurantSchema])
def get_restaurants(db: Session = Depends(get_db)):
    return db.query(Restaurant).all()

@app.post("/api/restaurants", response_model=RestaurantSchema)
def create_restaurant(rest: RestaurantSchema, db: Session = Depends(get_db)):
    db_rest = Restaurant(**rest.model_dump(exclude={"reviews", "id"}))
    db.add(db_rest)
    db.commit()
    db.refresh(db_rest)
    return db_rest

@app.delete("/api/reviews/{review_id}")
def delete_review(review_id: int, db: Session = Depends(get_db)):
    db.query(Review).filter(Review.id == review_id).delete()
    db.commit()
    return {"message": "Review deleted"}

# Add this endpoint to your FastAPI app
@app.post("/api/login")
def login(username: str, password: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user or not pwd_context.verify(password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    return {"message": "Login successful", "username": user.username}