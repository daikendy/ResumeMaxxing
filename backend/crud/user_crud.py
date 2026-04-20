from sqlalchemy.orm import Session
from models.user_model import User
from schemas.user_schema import UserCreate

# Read
def get_user(db: Session, user_id: str):
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

# Create
def create_user(db: Session, user: UserCreate):
    # We unpack the Pydantic schema and turn it into a SQLAlchemy model
    db_user = User(id=user.id, email=user.email)
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user) # Refreshes to get the auto-generated created_at timestamp
    return db_user

# Delete
def delete_user(db: Session, user_id: str):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
        return True
    return False