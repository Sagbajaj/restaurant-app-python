from pydantic import BaseModel
from typing import Optional

# Shared properties
class MenuBase(BaseModel):
    name: str
    price: float
    description: Optional[str] = None
    is_vegetarian: bool = True
    image_url: Optional[str] = None  # <--- This holds your Picture URL

# Receive this when creating (we also need the restaurant_id!)
class MenuCreate(MenuBase):
    restaurant_id: int

# Return this to the client (includes ID)
class MenuResponse(MenuBase):
    id: int
    restaurant_id: int

    class Config:
        from_attributes = True