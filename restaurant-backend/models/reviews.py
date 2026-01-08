from sqlalchemy import Column, Integer, String,ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Reviews(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user = Column(String)
    # You must define this property explicitly
    text = Column(String)
    rating = Column(Integer) # e.g., "Cafe", "Fine Dining"
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    restaurant = relationship("Restaurant", back_populates="reviews")