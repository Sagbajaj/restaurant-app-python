from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from database import Base

class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    # You must define this property explicitly
    menu_items = relationship("Menu", back_populates="restaurant")
    reviews = relationship("Review", back_populates="restaurant", cascade="all, delete-orphan")
    res_type = Column(String) # e.g., "Cafe", "Fine Dining"
    cuisine = Column(String)  # e.g., "Indian", "Italian"
    location = Column(String) # e.g., "Mumbai"
    address = Column(String)
    phone = Column(String)
    
    # Optional Fields (nullable=True)
    email = Column(String, nullable=True)
    website = Column(String, nullable=True)
    wifi_ssid = Column(String, nullable=True)
    wifi_password = Column(String, nullable=True)

    # --- RELATIONSHIPS ---
    # Keep this commented out until we create the Review model.
    # If you uncomment it now without Review existing, it will crash.
    # reviews = relationship("Review", back_populates="restaurant", cascade="all, delete-orphan")