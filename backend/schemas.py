from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "Farmer"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: int
    is_active: bool
    org_id: Optional[int] = None

    class Config:
        from_attributes = True

# Batch Schemas
class BatchBase(BaseModel):
    batch_id: str
    total_count: int
    excellent_count: int
    good_count: int
    average_count: int
    bad_count: int
    worst_count: int
    excellent_percentage: float
    good_percentage: float
    average_percentage: float
    bad_percentage: float
    worst_percentage: float
    final_grade: str
    recommendation: str
    
    # Metadata
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    moisture_content: float = 12.5
    seed_variety: str = "Standard Yellow"

class BatchCreate(BatchBase):
    owner_id: Optional[int] = None
    org_id: Optional[int] = None

class Batch(BatchBase):
    id: int
    timestamp: datetime
    owner_id: Optional[int] = None
    org_id: Optional[int] = None

    class Config:
        from_attributes = True

class DetectionResult(BaseModel):
    label: str
    confidence: float
    box: List[float]
