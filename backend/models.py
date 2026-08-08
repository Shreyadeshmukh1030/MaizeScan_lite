from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Organization(Base):
    __tablename__ = "organizations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    location = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    users = relationship("User", back_populates="organization")
    batches = relationship("Batch", back_populates="organization")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String, default="Farmer") # Farmer, Lab Tech, Auditor, Admin
    is_active = Column(Boolean, default=True)
    
    org_id = Column(Integer, ForeignKey("organizations.id"))
    organization = relationship("Organization", back_populates="users")
    batches = relationship("Batch", back_populates="owner")

class Batch(Base):
    __tablename__ = "batches"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(String, unique=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Ownership
    owner_id = Column(Integer, ForeignKey("users.id"))
    org_id = Column(Integer, ForeignKey("organizations.id"))
    
    owner = relationship("User", back_populates="batches")
    organization = relationship("Organization", back_populates="batches")
    
    # Counts
    total_count = Column(Integer, default=0)
    excellent_count = Column(Integer, default=0)
    good_count = Column(Integer, default=0)
    average_count = Column(Integer, default=0)
    bad_count = Column(Integer, default=0)
    worst_count = Column(Integer, default=0)
    
    # Percentages
    excellent_percentage = Column(Float, default=0.0)
    good_percentage = Column(Float, default=0.0)
    average_percentage = Column(Float, default=0.0)
    bad_percentage = Column(Float, default=0.0)
    worst_percentage = Column(Float, default=0.0)
    
    # Grading Result
    final_grade = Column(String)
    recommendation = Column(String)
    
    # Geospatial Metadata
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    moisture_content = Column(Float, default=12.5) # Default certified moisture
    seed_variety = Column(String, default="Standard Yellow")
