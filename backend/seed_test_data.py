from database import SessionLocal
from models.user_model import User
from models.job_model import TrackedJob

def seed():
    db = SessionLocal()
    user = db.query(User).filter(User.id == 'dev-user-123').first()
    if not user:
        user = User(id='dev-user-123', email='test@example.com', generations_limit=100)
        db.add(user)
        db.commit()
    
    job = db.query(TrackedJob).filter(TrackedJob.id == 1).first()
    if not job:
        job = TrackedJob(id=1, user_id='dev-user-123', job_title='Software Engineer', job_description='Testing job description')
        db.add(job)
        db.commit()
    print('User and Job seeded')
    db.close()

if __name__ == "__main__":
    seed()
