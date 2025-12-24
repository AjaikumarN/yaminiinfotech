"""
Attendance Management Router
Handles employee attendance check-in/check-out and status tracking
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from datetime import datetime, date, timedelta
from typing import List, Optional
import models
import schemas
import crud
from auth import get_current_user, get_db

router = APIRouter(prefix="/api/attendance", tags=["attendance"])


@router.post("/check-in", response_model=schemas.Attendance)
def check_in(
    attendance_data: schemas.AttendanceCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check in for the day
    Only one check-in per day is allowed
    """
    now = datetime.now()
    today = now.date()
    
    # Check if already checked in today
    existing_attendance = db.query(models.Attendance).filter(
        and_(
            models.Attendance.employee_id == current_user.id,
            func.date(models.Attendance.date) == today
        )
    ).first()
    
    if existing_attendance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already checked in today"
        )
    
    # Create attendance record
    db_attendance = models.Attendance(
        employee_id=current_user.id,
        date=now,
        time=now.strftime("%H:%M:%S"),
        location=attendance_data.location,
        latitude=attendance_data.latitude,
        longitude=attendance_data.longitude,
        photo_path=attendance_data.photo_path,
        status="Present"
    )
    
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    
    return db_attendance


@router.get("/today", response_model=Optional[schemas.Attendance])
def get_today_attendance(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get today's attendance record for current user
    Returns None if not checked in
    """
    today = date.today()
    
    attendance = db.query(models.Attendance).filter(
        and_(
            models.Attendance.employee_id == current_user.id,
            func.date(models.Attendance.date) == today
        )
    ).first()
    
    return attendance


@router.get("/status")
def get_attendance_status(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check if user has checked in today
    Returns: { checked_in: boolean, attendance: object or null }
    """
    today = datetime.now().date()
    
    attendance = db.query(models.Attendance).filter(
        and_(
            models.Attendance.employee_id == current_user.id,
            func.date(models.Attendance.date) == today
        )
    ).first()
    
    return {
        "checked_in": attendance is not None,
        "attendance": attendance
    }


@router.get("/my-history", response_model=List[schemas.Attendance])
def get_my_attendance_history(
    days: int = 30,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get attendance history for current user
    """
    start_date = datetime.utcnow() - timedelta(days=days)
    
    attendance_records = db.query(models.Attendance).filter(
        and_(
            models.Attendance.employee_id == current_user.id,
            models.Attendance.date >= start_date
        )
    ).order_by(models.Attendance.date.desc()).all()
    
    return attendance_records


@router.get("/employee/{employee_id}", response_model=List[schemas.Attendance])
def get_employee_attendance(
    employee_id: int,
    days: int = 30,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get attendance history for specific employee
    Admin/Reception only
    """
    if current_user.role not in [models.UserRole.ADMIN, models.UserRole.RECEPTION]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view other employees' attendance"
        )
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    attendance_records = db.query(models.Attendance).filter(
        and_(
            models.Attendance.employee_id == employee_id,
            models.Attendance.date >= start_date
        )
    ).order_by(models.Attendance.date.desc()).all()
    
    return attendance_records


@router.get("/all/today", response_model=List[dict])
def get_all_today_attendance(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get today's attendance for all employees
    Admin/Reception only
    """
    if current_user.role not in [models.UserRole.ADMIN, models.UserRole.RECEPTION]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view all attendance"
        )
    
    today = date.today()
    
    # Get all active employees
    employees = db.query(models.User).filter(
        models.User.is_active == True,
        models.User.role.in_([
            models.UserRole.SALESMAN,
            models.UserRole.SERVICE_ENGINEER,
            models.UserRole.OFFICE_STAFF
        ])
    ).all()
    
    attendance_data = []
    for employee in employees:
        attendance = db.query(models.Attendance).filter(
            and_(
                models.Attendance.employee_id == employee.id,
                func.date(models.Attendance.date) == today
            )
        ).first()
        
        attendance_data.append({
            "employee_id": employee.id,
            "employee_name": employee.full_name,
            "role": employee.role,
            "checked_in": attendance is not None,
            "attendance": attendance
        })
    
    return attendance_data
