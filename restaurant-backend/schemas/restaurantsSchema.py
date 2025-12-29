from pydantic import BaseModel
from typing import Optional

# Shared properties
class RestaurantBase(BaseModel):
    name: str
    res_type: str  # e.g., "Cafe", "Fine Dining"
    cuisine: str   # e.g., "Indian", "Italian"
    address: Optional[str] = None
    location: str  # e.g., "Mumbai"
    phone: str
    email: Optional[str] = None
    website: Optional[str] = None
    wifi_ssid: Optional[str] = None
    wifi_password: Optional[str] = None

# Properties to receive on CREATE
class RestaurantCreate(RestaurantBase):
    pass

# Properties to return to Client (includes ID)
class RestaurantResponse(RestaurantBase):
    id: int

    class Config:
        from_attributes = True