from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

# CHANGE 1: Class name should be Singular to match the relationship string in Restaurant
class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user = Column(String)
    text = Column(String)
    rating = Column(Integer)
    
    # ForeignKey links to the 'restaurants' table, 'id' column
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    
    # CHANGE 2: back_populates matches the variable name in Restaurant model ('reviews')
    # restaurant = relationship("Restaurant", back_populates="Review")