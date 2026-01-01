"""
Verified Attendance Model
Stores biometric and GPS verification metadata
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, JSON
from database import Base
from datetime import datetime

class VerifiedAttendance(Base):
    __tablename__ = "verified_attendance"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, index=True)
    
    # Time (Server-synced)
    check_in_time = Column(DateTime, default=datetime.utcnow)
    check_out_time = Column(DateTime, nullable=True)
    
    # Face Verification Data
    face_image_path = Column(String)  # Stored securely
    face_confidence = Column(Float)  # 0-100% match confidence
    face_verified = Column(Boolean, default=False)
    
    # Location Data (Rooftop Precision)
    latitude = Column(Float)
    longitude = Column(Float)
    address = Column(Text)  # Detailed: "5/77 e1, JJ Nagar, Reddiyarpatti"
    formatted_address = Column(Text)  # Full formatted address
    location_accuracy = Column(Float)  # Meters
    location_type = Column(String)  # ROOFTOP, RANGE_INTERPOLATED, etc.
    place_id = Column(String)  # Google Place ID
    location_verified = Column(Boolean, default=False)
    
    # Verification Metadata
    verification_method = Column(String, default="BIOMETRIC_GPS")
    verification_status = Column(String, default="VERIFIED")  # VERIFIED, FAILED, PENDING
    
    # Device & Security
    device_info = Column(Text)
    ip_address = Column(String, nullable=True)
    mock_location_detected = Column(Boolean, default=False)
    
    # Additional Data
    notes = Column(Text, nullable=True)
    verification_data = Column(JSON, nullable=True)  # Additional metadata
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
