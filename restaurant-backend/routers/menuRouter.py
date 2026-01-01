from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.menu import Menu
from models.restaurants import Restaurant
from schemas.menuSchema import MenuCreate, MenuResponse

router = APIRouter(
    prefix="/api/menus",
    tags=["Menus"]
)

# 1. GET MENU FOR A RESTAURANT
# We pass restaurant_id as a query param: /api/menus/?restaurant_id=5
@router.get("/", response_model=List[MenuResponse])
def get_menu_items(restaurant_id: int, db: Session = Depends(get_db)):
    items = db.query(Menu).filter(Menu.restaurant_id == restaurant_id).all()
    return items

# 2. ADD MENU ITEM
@router.post("/", response_model=MenuResponse, status_code=status.HTTP_201_CREATED)
def create_menu_item(item: MenuCreate, db: Session = Depends(get_db)):
    # Verify restaurant exists first
    rest = db.query(Restaurant).filter(Restaurant.id == item.restaurant_id).first()
    if not rest:
        raise HTTPException(status_code=404, detail="Restaurant not found")
        
    new_item = Menu(**item.model_dump())
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

# 3. DELETE MENU ITEM
@router.delete("/{menu_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_menu_item(menu_id: int, db: Session = Depends(get_db)):
    item = db.query(Menu).filter(Menu.id == menu_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    db.delete(item)
    db.commit()
    return None