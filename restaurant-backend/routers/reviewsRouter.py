from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.reviews import Reviews # Ensure you have this model created!
from schemas.reviewsSchema import ReviewBase

router = APIRouter(
    prefix="/api/reviews",
    tags=["Reviews"]
)

# 1. GET ALL RESTAURANTS
@router.get("/all-reviews", response_model=List[ReviewBase])
def get_reviews(db: Session = Depends(get_db)):
    return db.query(Reviews).all()

@router.get("/{restaurant_id}", response_model=ReviewBase)
def get_restaurant_reviews(restaurant_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Reviews).filter(Reviews.restaurant_id == restaurant_id).first()
    if not reviews:
        raise HTTPException(status_code=404, detail="No reviews found")
    return reviews