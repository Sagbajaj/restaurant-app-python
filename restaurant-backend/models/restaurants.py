

class Restaurant(Base):
    __tablename__ = "restaurants"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    res_type = Column(String)
    cuisine = Column(String)
    location = Column(String)
    address = Column(String)
    phone = Column(String)
    email = Column(String)
    website = Column(String)
    wifi_ssid = Column(String)
    wifi_password = Column(String)
    
    reviews = relationship("Review", back_populates="restaurant", cascade="all, delete-orphan")