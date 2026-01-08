from pydantic import BaseModel
from typing import Optional

class ReviewBase(BaseModel):
    user : str
    text : str
    rating : int
    
class ReviewResponse(ReviewBase):
    id: int

class Config:
    from_attributes = True