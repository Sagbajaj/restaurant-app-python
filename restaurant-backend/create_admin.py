import os
import bcrypt
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# --- CONFIGURATION ---
# PASTE YOUR SUPABASE POOLER URL HERE (The one starting with postgresql://)
# Make sure to replace [YOUR-PASSWORD] with your actual password
DATABASE_URL = "postgresql://postgres.your_user:your_password@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# Setup Database Connection
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# Define User Model
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

# Create the table if it doesn't exist
Base.metadata.create_all(bind=engine)

def create_or_update_admin():
    db = SessionLocal()
    username = "admin"
    password = "admin123"

    # 1. Generate the Hash using pure bcrypt
    # (We convert strings to bytes because bcrypt requires bytes)
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_pw = bcrypt.hashpw(password_bytes, salt).decode('utf-8')

    # 2. Check if admin exists
    existing_user = db.query(User).filter(User.username == username).first()

    if existing_user:
        print(f"User '{username}' found. Updating password...")
        existing_user.hashed_password = hashed_pw
    else:
        print(f"User '{username}' not found. Creating new user...")
        new_user = User(username=username, hashed_password=hashed_pw)
        db.add(new_user)
    
    # 3. Save changes
    db.commit()
    print("✅ Success! You can now login with:")
    print(f"User: {username}")
    print(f"Pass: {password}")
    db.close()

if __name__ == "__main__":
    create_or_update_admin()