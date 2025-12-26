from pydantic import BaseModel
from typing import Optional

class RestaurantCreate(BaseModel):
    name: str
    type: str
    cuisine: str
    address: str
    phone: str
    wifi_ssid: Optional[str] = None
    wifi_password: Optional[str] = None

class RestaurantResponse(RestaurantCreate):
    id: int

    class Config:
        orm_mode = True