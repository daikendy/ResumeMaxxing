import string
import random
from sqlalchemy.orm import Session
from database import engine
from sqlalchemy import text
from models.user_model import User

def generate_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

def sync_and_backfill():
    try:
        with Session(engine) as session:
            # 1. Backfill missing referral codes
            users_without_codes = session.query(User).filter(User.referral_code == None).all()
            if users_without_codes:
                print(f"Found {len(users_without_codes)} users without referral codes. Backfilling...")
                for user in users_without_codes:
                    # Ensure uniqueness
                    new_code = generate_code()
                    while session.query(User).filter(User.referral_code == new_code).first():
                        new_code = generate_code()
                    
                    user.referral_code = new_code
                    print(f"  -> Assigned {new_code} for user {user.id}")
                
                session.commit()
                print("BACKFILL COMPLETE: All users now have referral codes.")
            else:
                print("No users need backfilling.")

    except Exception as e:
        print(f"BACKFILL FAILED: {str(e)}")

if __name__ == '__main__':
    sync_and_backfill()
