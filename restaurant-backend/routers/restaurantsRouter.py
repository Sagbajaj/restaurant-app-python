from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.restaurants import Restaurant # Ensure you have this model created!
from schemas.restaurantsSchema import RestaurantCreate, RestaurantResponse

router = APIRouter(
    prefix="/api/restaurants",
    tags=["Restaurants"]
)

# 1. GET ALL RESTAURANTS
@router.get("/", response_model=List[RestaurantResponse])
def get_restaurants(db: Session = Depends(get_db)):
    return db.query(Restaurant).all()

# 2. CREATE RESTAURANT
@router.post("/", response_model=RestaurantResponse, status_code=status.HTTP_201_CREATED)
def create_restaurant(restaurant: RestaurantCreate, db: Session = Depends(get_db)):
    new_restaurant = Restaurant(**restaurant.model_dump())
    db.add(new_restaurant)
    db.commit()
    db.refresh(new_restaurant)
    return new_restaurant

# 3. GET SINGLE RESTAURANT
@router.get("/{restaurant_id}", response_model=RestaurantResponse)
def get_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant

# 4. DELETE RESTAURANT
@router.delete("/{restaurant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    db.delete(restaurant)
    db.commit()
    return None

@router.put("/{restaurant_id}", response_model=RestaurantResponse)
def update_restaurant(restaurant_id: int, updated_data: RestaurantCreate, db: Session = Depends(get_db)):
    # 1. Find the restaurant
    db_rest = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not db_rest:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # 2. Update fields
    # Convert Pydantic model to dict, exclude unset fields
    data = updated_data.model_dump(exclude_unset=True)
    
    for key, value in data.items():
        setattr(db_rest, key, value)
    
    # 3. Save
    db.commit()
    db.refresh(db_rest)
    return db_rest