"""
Add a receptionist user to the database
"""
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
from auth import get_password_hash

def add_receptionist():
    db = SessionLocal()
    
    try:
        # Check if user already exists
        existing_user = db.query(models.User).filter(
            models.User.username == "ajaik"
        ).first()
        
        if existing_user:
            print("❌ User 'ajaik' already exists!")
            return
        
        # Create new receptionist user
        new_user = models.User(
            username="ajaik",
            email="ajaik@yaminiinfotech.com",
            hashed_password=get_password_hash("ajai1234"),
            full_name="Ajaik Reception",
            role=models.UserRole.RECEPTION,
            is_active=True
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        print("=" * 60)
        print("✅ RECEPTIONIST USER CREATED SUCCESSFULLY!")
        print("=" * 60)
        print(f"Username: {new_user.username}")
        print(f"Password: ajai1234")
        print(f"Role: {new_user.role}")
        print(f"Full Name: {new_user.full_name}")
        print(f"Email: {new_user.email}")
        print("=" * 60)
        print("\nYou can now login at: http://localhost:5173/login")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Error creating user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_receptionist()
