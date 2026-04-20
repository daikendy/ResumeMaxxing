from database import engine
from sqlalchemy import text

def sync_db():
    try:
        with engine.connect() as conn:
            # Add referred_by
            try:
                conn.execute(text('ALTER TABLE users ADD COLUMN referred_by VARCHAR(255) NULL'))
                print("Added referred_by")
            except Exception as e:
                print(f"referred_by skip or already exists")
                
            # Add bonus_quota    
            try:
                conn.execute(text('ALTER TABLE users ADD COLUMN bonus_quota INT DEFAULT 0'))
                print("Added bonus_quota")
            except Exception as e:
                print(f"bonus_quota skip or already exists")
                
            conn.commit()
            print("DATABASE SCHEMA UPDATED SUCCESSFULLY")
    except Exception as e:
        print(f"SCHEMA UPDATE FAILED: {str(e)}")

if __name__ == "__main__":
    sync_db()
