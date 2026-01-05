from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List, Dict
from fastapi.middleware.cors import CORSMiddleware
from routers import authRouter as auth
from routers import restaurantsRouter as restaurant
from routers import menuRouter as menu


class ConnectionManager:
    def __init__(self):
        # Stores active connections: { order_id: [socket1, socket2] }
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, order_id: str):
        await websocket.accept()
        if order_id not in self.active_connections:
            self.active_connections[order_id] = []
        self.active_connections[order_id].append(websocket)

    def disconnect(self, websocket: WebSocket, order_id: str):
        if order_id in self.active_connections:
            if websocket in self.active_connections[order_id]:
                self.active_connections[order_id].remove(websocket)

    async def broadcast(self, message: dict, order_id: str):
        if order_id in self.active_connections:
            for connection in self.active_connections[order_id]:
                await connection.send_json(message)
                
# --- DB MODELS ---
# class User(Base):
#     __tablename__ = "users"
#     id = Column(Integer, primary_key=True, index=True)
#     username = Column(String, unique=True, index=True)
#     hashed_password = Column(String)

# class Restaurant(Base):
#     __tablename__ = "restaurants"
#     id = Column(Integer, primary_key=True, index=True)
#     name = Column(String)
#     res_type = Column(String)
#     cuisine = Column(String)
#     location = Column(String)
#     address = Column(String)
#     phone = Column(String)
#     email = Column(String)
#     website = Column(String)
#     wifi_ssid = Column(String)
#     wifi_password = Column(String)
    
#     reviews = relationship("Review", back_populates="restaurant", cascade="all, delete-orphan")

# class Review(Base):
#     __tablename__ = "reviews"
#     id = Column(Integer, primary_key=True, index=True)
#     user = Column(String)
#     text = Column(String)
#     rating = Column(Integer)
#     restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
#     restaurant = relationship("Restaurant", back_populates="reviews")

# # Create tables
# Base.metadata.create_all(bind=engine)

# # --- SCHEMAS ---
# class ReviewSchema(BaseModel):
#     id: Optional[int]
#     user: str
#     text: str
#     rating: int
#     class Config: from_attributes = True

# class RestaurantSchema(BaseModel):
    # id: Optional[int]
    # name: str
    # res_type: str
    # cuisine: str
    # address: str
    # phone: str
    # wifi_ssid: Optional[str]
    # wifi_password: Optional[str]
    # reviews: List[ReviewSchema] = []
    # class Config: from_attributes = True

# --- APP ---
manager = ConnectionManager()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(restaurant.router)
app.include_router(menu.router)

@app.websocket("/ws/track/{order_id}")
async def websocket_endpoint(websocket: WebSocket, order_id: str):
    await manager.connect(websocket, order_id)
    try:
        while True:
            # Receive data (from Driver/Simulator)
            data = await websocket.receive_json()
            # Broadcast it (to Customer/Map)
            await manager.broadcast(data, order_id)
    except WebSocketDisconnect:
        manager.disconnect(websocket, order_id)

# --- OTHER ROUTES ---
# @app.get("/api/restaurants", response_model=List[RestaurantSchema])
# def get_restaurants(db: Session = Depends(get_db)):
#     return db.query(Restaurant).all()

# @app.post("/api/restaurants", response_model=RestaurantSchema)
# def create_restaurant(rest: RestaurantSchema, db: Session = Depends(get_db)):
#     # Safely convert Pydantic model to dict
#     data = rest.model_dump(exclude={"reviews", "id"})
#     db_rest = Restaurant(**data)
#     db.add(db_rest)
#     db.commit()
#     db.refresh(db_rest)
#     return db_rest

# @app.delete("/api/reviews/{review_id}")
# def delete_review(review_id: int, db: Session = Depends(get_db)):
#     db.query(Review).filter(Review.id == review_id).delete()
#     db.commit()
#     return {"message": "Review deleted"}

# @app.post("/restaurants/", response_model=schemas.RestaurantResponse)
# def create_restaurant(
#     restaurant: schemas.RestaurantCreate, 
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(get_current_user) # Requires Login
# ):
#     new_restaurant = models.Restaurant(
#         name=restaurant.name,
#         type=restaurant.type,
#         cuisine=restaurant.cuisine,
#         address=restaurant.address,
#         phone=restaurant.phone,
#         wifi_ssid=restaurant.wifi_ssid,
#         wifi_password=restaurant.wifi_password
#     )
    
#     db.add(new_restaurant)
#     db.commit()
#     db.refresh(new_restaurant)
#     return new_restaurant