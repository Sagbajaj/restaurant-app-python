from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from database import Base

class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    
    res_type = Column(String) 
    cuisine = Column(String)  
    location = Column(String) 
    address = Column(String)
    phone = Column(String)
    
    email = Column(String, nullable=True)
    website = Column(String, nullable=True)
    wifi_ssid = Column(String, nullable=True)
    wifi_password = Column(String, nullable=True)

    # --- RELATIONSHIPS ---
    
    # 1. Menu Items
    menu_items = relationship("Menu", back_populates="restaurant")
    
    # 2. Reviews
    # The string "Review" here MUST match 'class Review' in the other file.
    reviews = relationship("Review", back_populates="Restaurant", cascade="all, delete-orphan")