"""
Migration script to add feedback fields to complaints table
Run this script to update the database schema
"""
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

# Database URL from environment or use default
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost/erp_db")

def migrate():
    """Add feedback fields to complaints table"""
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        try:
            # Add resolution_notes column
            print("Adding resolution_notes column...")
            conn.execute(text("""
                ALTER TABLE complaints 
                ADD COLUMN IF NOT EXISTS resolution_notes TEXT
            """))
            conn.commit()
            print("✓ resolution_notes column added")
            
            # Add parts_replaced column
            print("Adding parts_replaced column...")
            conn.execute(text("""
                ALTER TABLE complaints 
                ADD COLUMN IF NOT EXISTS parts_replaced TEXT
            """))
            conn.commit()
            print("✓ parts_replaced column added")
            
            # Add feedback_url column
            print("Adding feedback_url column...")
            conn.execute(text("""
                ALTER TABLE complaints 
                ADD COLUMN IF NOT EXISTS feedback_url VARCHAR
            """))
            conn.commit()
            print("✓ feedback_url column added")
            
            # Add feedback_qr column
            print("Adding feedback_qr column...")
            conn.execute(text("""
                ALTER TABLE complaints 
                ADD COLUMN IF NOT EXISTS feedback_qr TEXT
            """))
            conn.commit()
            print("✓ feedback_qr column added")
            
            print("\n✅ Migration completed successfully!")
            print("\nNew columns added to complaints table:")
            print("  - resolution_notes (TEXT)")
            print("  - parts_replaced (TEXT)")
            print("  - feedback_url (VARCHAR)")
            print("  - feedback_qr (TEXT)")
            
        except Exception as e:
            print(f"\n❌ Migration failed: {e}")
            conn.rollback()
            raise

if __name__ == "__main__":
    print("=" * 60)
    print("DATABASE MIGRATION: Add Feedback Fields")
    print("=" * 60)
    print(f"\nConnecting to database...")
    print(f"Database URL: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'local'}\n")
    
    migrate()
