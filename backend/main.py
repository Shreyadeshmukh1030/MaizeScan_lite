import os
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from passlib.context import CryptContext
from dotenv import load_dotenv
import numpy as np
import cv2
import io
import models, schemas, database, detection
from database import engine, get_db

# Load env variables from .env file
# Load environment variables from the .env file in the backend directory
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=env_path)

SECRET_KEY = os.getenv("SECRET_KEY", "maizescan-agri-core-security-key-2024")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = 480

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="MaizeScan Agri-Core API")

# Security Configuration
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://maize-scan.vercel.app",
        "https://maize-scan-git-main-shreyadeshmukh1030s-projects.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "online", "message": "MaizeScan Agri-Core API is Live"}

# Robust path for cloud environments
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "seed_model.pt")
detector = detection.SeedDetector(model_path=MODEL_PATH)

# --- AUTH UTILS ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

# --- AUTH ROUTES ---
@app.post("/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Operator email already registered")
    
    hashed_pwd = get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        hashed_password=hashed_pwd,
        full_name=user.full_name,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    print(f"DEBUG: Login attempt for user: {form_data.username}")
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user:
        print(f"DEBUG: User not found: {form_data.username}")
    else:
        print(f"DEBUG: User found, verifying password for: {user.email}")
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        print(f"DEBUG: Login failed for: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or access token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

# --- CORE API ROUTES ---
@app.post("/detect", response_model=List[schemas.DetectionResult])
async def detect_seeds(file: UploadFile = File(...), threshold: float = 0.5):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=400, detail="Invalid frame")
    return detector.detect(img, conf=threshold)

@app.post("/batches", response_model=schemas.Batch)
def create_batch(batch: schemas.BatchCreate, db: Session = Depends(get_db)):
    # Note: In production, we'd add current_user dependency here
    # For now, we allow optional owner_id from the request
    db_batch = models.Batch(**batch.dict())
    db.add(db_batch)
    db.commit()
    db.refresh(db_batch)
    return db_batch

@app.get("/batches", response_model=List[schemas.Batch])
def get_batches(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Batch).order_by(models.Batch.timestamp.desc()).offset(skip).limit(limit).all()

@app.get("/batches/{batch_id}", response_model=schemas.Batch)
def get_batch(batch_id: int, db: Session = Depends(get_db)):
    db_batch = db.query(models.Batch).filter(models.Batch.id == batch_id).first()
    if not db_batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    return db_batch

@app.delete("/batches/{batch_id}")
def delete_batch(batch_id: int, db: Session = Depends(get_db)):
    db_batch = db.query(models.Batch).filter(models.Batch.id == batch_id).first()
    if not db_batch:
        raise HTTPException(status_code=404, detail="Batch audit not found")
    db.delete(db_batch)
    db.commit()
    return {"message": "Audit trace deleted"}

@app.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    batches = db.query(models.Batch).all()
    if not batches:
        return {
            "grade_distribution": [],
            "defect_trend": [],
            "total_batches": 0,
            "avg_defect_rate": 0,
            "total_seeds": 0
        }
    
    # Roadmap Analytics: Grade Distribution
    grade_counts = {}
    total_seeds = 0
    for b in batches:
        grade_counts[b.final_grade] = grade_counts.get(b.final_grade, 0) + 1
        total_seeds += b.total_count
    
    # Roadmap Analytics: Defect Trend line (Last 10 batches)
    defect_trend = [
        {
            "timestamp": b.timestamp.strftime("%H:%M:%S"), 
            "defect_rate": round(b.bad_percentage + b.worst_percentage, 1)
        }
        for b in sorted(batches, key=lambda x: x.timestamp)[-10:]
    ]
    
    return {
        "grade_distribution": [{"name": k, "value": v} for k, v in grade_counts.items()],
        "defect_trend": defect_trend,
        "total_batches": len(batches),
        "total_seeds": total_seeds,
        "avg_defect_rate": round(sum(b.bad_percentage + b.worst_percentage for b in batches) / len(batches), 2)
    }

if __name__ == "__main__":
    import uvicorn
    import os
    # Dynamic port for cloud deployment (Render, Heroku, etc.)
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
