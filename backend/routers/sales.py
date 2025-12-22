from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta, date
import schemas
import crud
import models
import auth
from database import get_db
import os
import shutil
from pathlib import Path

router = APIRouter(prefix="/api/sales", tags=["Sales"])

@router.get("/")
def get_all_sales(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get all sales records (for office staff and admin)"""
    # Return empty list for now - implement based on your sales table structure
    return []

@router.post("/calls")
def create_sales_call(
    call: schemas.SalesCallCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Create a sales call record"""
    if current_user.role != models.UserRole.SALESMAN:
        raise HTTPException(status_code=403, detail="Only salesmen can create calls")
    
    return crud.create_sales_call(db=db, call=call, salesman_id=current_user.id)

@router.post("/visits")
def create_shop_visit(
    visit: schemas.ShopVisitCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Create a shop visit record"""
    if current_user.role != models.UserRole.SALESMAN:
        raise HTTPException(status_code=403, detail="Only salesmen can create visits")
    
    return crud.create_shop_visit(db=db, visit=visit, salesman_id=current_user.id)

@router.get("/my-calls")
def get_my_calls(
    today_only: bool = False,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get calls for current salesman"""
    if current_user.role != models.UserRole.SALESMAN:
        raise HTTPException(status_code=403, detail="Only salesmen can access this")
    
    date = None
    if today_only:
        date = datetime.utcnow().replace(hour=0, minute=0, second=0)
    
    return crud.get_sales_calls_by_salesman(db, salesman_id=current_user.id, date=date)

@router.get("/my-visits")
def get_my_visits(
    limit: int = 30,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get visits for current salesman"""
    if current_user.role != models.UserRole.SALESMAN:
        raise HTTPException(status_code=403, detail="Only salesmen can access this")
    
async def mark_attendance(
    time: str = Form(...),
    location: str = Form(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    status: str = Form("Present"),
    photo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Mark attendance with photo upload"""
    
    # Create uploads directory if it doesn't exist
    upload_dir = Path("uploads/attendance")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_extension = os.path.splitext(photo.filename)[1]
    filename = f"{current_user.id}_{timestamp}{file_extension}"
    file_path = upload_dir / filename
    
    # Save uploaded file
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(photo.file, buffer)
    
    # Create attendance record
    attendance_data = schemas.AttendanceCreate(
        time=time,
        location=location,
        latitude=latitude,
        longitude=longitude,
        status=status,
        photo_path=str(file_path)
    )
    
    return crud.create_attendance(db=db, attendance=attendance_data, employee_id=current_user.id)

@router.get("/my-attendance")
def get_my_attendance(
    today_only: bool = False,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get attendance records for current user"""
    date = None
    if today_only:
        date = datetime.utcnow()
    
    return crud.get_attendance_by_employee(db, employee_id=current_user.id, date=date)

# ENHANCED SALESMAN FEATURES

@router.get("/salesman/analytics/summary", response_model=schemas.SalesmanAnalytics)
def get_salesman_analytics_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get analytics summary for current salesman"""
    
    if current_user.role != models.UserRole.SALESMAN:
        raise HTTPException(status_code=403, detail="Only salesmen can access this")
    
    # Assigned enquiries
    assigned_enquiries = db.query(models.Enquiry).filter(
        models.Enquiry.assigned_to == current_user.id
    ).count()
    
    # Pending followups (today or overdue)
    pending_followups = db.query(models.SalesFollowUp).filter(
        models.SalesFollowUp.salesman_id == current_user.id,
        models.SalesFollowUp.status == "Pending",
        models.SalesFollowUp.followup_date <= datetime.utcnow() + timedelta(days=1)
    ).count()
    
    # Converted enquiries
    converted_enquiries = db.query(models.Enquiry).filter(
        models.Enquiry.assigned_to == current_user.id,
        models.Enquiry.status == "CONVERTED"
    ).count()
    
    # Revenue this month (from approved orders)
    today = date.today()
    first_day = today.replace(day=1)
    
    revenue_this_month = db.query(func.sum(models.Order.total_amount)).join(
        models.Enquiry, models.Order.enquiry_id == models.Enquiry.id
    ).filter(
        models.Enquiry.assigned_to == current_user.id,
        models.Order.status == "APPROVED",
        models.Order.created_at >= first_day
    ).scalar() or 0
    
    # Missed followups
    missed_followups = db.query(models.SalesFollowUp).filter(
        models.SalesFollowUp.salesman_id == current_user.id,
        models.SalesFollowUp.status == "Pending",
        models.SalesFollowUp.followup_date < datetime.utcnow()
    ).count()
    
    # Orders pending approval
    orders_pending = db.query(models.Order).filter(
        models.Order.salesman_id == current_user.id,
        models.Order.status == "PENDING"
    ).count()
    
    # Conversion rate
    conversion_rate = (converted_enquiries / assigned_enquiries * 100) if assigned_enquiries > 0 else 0
    
    # Average closing days
    converted = db.query(models.Enquiry).filter(
        models.Enquiry.assigned_to == current_user.id,
        models.Enquiry.status == "CONVERTED"
    ).all()
    
    avg_closing_days = 0
    if converted:
        total_days = sum([(e.last_follow_up or e.created_at) - e.created_at for e in converted], timedelta()).days
        avg_closing_days = total_days / len(converted) if len(converted) > 0 else 0
    
    return {
        "assigned_enquiries": assigned_enquiries,
        "pending_followups": pending_followups,
        "converted_enquiries": converted_enquiries,
        "revenue_this_month": revenue_this_month,
        "missed_followups": missed_followups,
        "orders_pending_approval": orders_pending,
        "conversion_rate": round(conversion_rate, 2),
        "avg_closing_days": round(avg_closing_days, 2)
    }

@router.get("/salesman/enquiries")
def get_salesman_enquiries(
    status: str = None,
    priority: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get enquiries assigned to current salesman"""
    
    if current_user.role != models.UserRole.SALESMAN:
        raise HTTPException(status_code=403, detail="Only salesmen can access this")
    
    query = db.query(models.Enquiry).filter(models.Enquiry.assigned_to == current_user.id)
    
    if status:
        query = query.filter(models.Enquiry.status == status)
    if priority:
        query = query.filter(models.Enquiry.priority == priority)
    
    return query.order_by(models.Enquiry.created_at.desc()).all()

@router.put("/salesman/enquiries/{enquiry_id}")
def update_salesman_enquiry(
    enquiry_id: int,
    enquiry_update: schemas.EnquiryUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Update enquiry - Salesman can update their own enquiries"""
    
    if current_user.role != models.UserRole.SALESMAN:
        raise HTTPException(status_code=403, detail="Only salesmen can update enquiries")
    
    enquiry = db.query(models.Enquiry).filter(models.Enquiry.id == enquiry_id).first()
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    
    if enquiry.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="You can only update your own enquiries")
    
    # Update allowed fields
    if enquiry_update.status is not None:
        enquiry.status = enquiry_update.status
        if enquiry_update.status in ["CONVERTED", "LOST"]:
            enquiry.last_follow_up = datetime.utcnow()
    
    if enquiry_update.priority is not None:
        enquiry.priority = enquiry_update.priority
    
    if enquiry_update.next_follow_up is not None:
        enquiry.next_follow_up = enquiry_update.next_follow_up
    
    if enquiry_update.notes is not None:
        enquiry.notes = enquiry_update.notes
    
    db.commit()
    db.refresh(enquiry)
    
    return enquiry

@router.get("/salesman/followups/today")
def get_today_followups(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get today's followups for current salesman"""
    
    if current_user.role != models.UserRole.SALESMAN:
        raise HTTPException(status_code=403, detail="Only salesmen can access this")
    
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0)
    today_end = today_start + timedelta(days=1)
    
    return db.query(models.SalesFollowUp).filter(
        models.SalesFollowUp.salesman_id == current_user.id,
        models.SalesFollowUp.status == "Pending",
        models.SalesFollowUp.followup_date >= today_start,
        models.SalesFollowUp.followup_date < today_end
    ).all()

@router.post("/salesman/daily-report", response_model=schemas.SalesDailyReportResponse)
def submit_daily_report(
    report: schemas.SalesDailyReportCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Submit daily report - Salesman only"""
    
    if current_user.role != models.UserRole.SALESMAN:
        raise HTTPException(status_code=403, detail="Only salesmen can submit daily reports")
    
    report_date = report.date.date() if isinstance(report.date, datetime) else report.date
    
    # Check if attendance is marked for today
    attendance = db.query(models.Attendance).filter(
        models.Attendance.employee_id == current_user.id,
        func.date(models.Attendance.date) == report_date
    ).first()
    
    attendance_marked = attendance is not None
    
    # Validation: Attendance must be marked
    if not attendance_marked:
        raise HTTPException(status_code=400, detail="Attendance not marked for this date")
    
    # Validation: Calls + Visits must not be 0
    if report.calls_made + report.visits_made == 0:
        raise HTTPException(status_code=400, detail="No activity recorded. Either calls or visits must be greater than 0")
    
    # Check for duplicate report
    existing_report = db.query(models.SalesDailyReport).filter(
        models.SalesDailyReport.salesman_id == current_user.id,
        models.SalesDailyReport.date == report_date
    ).first()
    
    if existing_report:
        raise HTTPException(status_code=400, detail="Duplicate report. Report already submitted for this date")
    
    # Validation: Revenue must match converted enquiries
    if report.revenue_generated > 0 and report.enquiries_generated == 0 and report.orders_created == 0:
        raise HTTPException(status_code=400, detail="Invalid revenue. Revenue requires enquiries or orders")
    
    # Create report
    db_report = models.SalesDailyReport(
        salesman_id=current_user.id,
        date=report_date,
        calls_made=report.calls_made,
        visits_made=report.visits_made,
        enquiries_generated=report.enquiries_generated,
        followups_completed=report.followups_completed,
        orders_created=report.orders_created,
        revenue_generated=report.revenue_generated,
        remarks=report.remarks,
        submitted=True,
        submitted_at=datetime.utcnow(),
        attendance_marked=attendance_marked
    )
    
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    
    return db_report

@router.get("/salesman/daily-report/{report_date}")
def get_daily_report(
    report_date: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get daily report for specific date"""
    
    if current_user.role != models.UserRole.SALESMAN:
        raise HTTPException(status_code=403, detail="Only salesmen can access this")
    
    date_obj = datetime.fromisoformat(report_date).date()
    
    report = db.query(models.SalesDailyReport).filter(
        models.SalesDailyReport.salesman_id == current_user.id,
        models.SalesDailyReport.date == date_obj
    ).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found for this date")
    
    return report

@router.get("/salesman/funnel", response_model=schemas.SalesFunnelData)
def get_salesman_funnel(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get sales funnel for current salesman"""
    
    if current_user.role != models.UserRole.SALESMAN:
        raise HTTPException(status_code=403, detail="Only salesmen can access this")
    
    query = db.query(models.Enquiry).filter(models.Enquiry.assigned_to == current_user.id)
    
    return {
        "new": query.filter(models.Enquiry.status == "NEW").count(),
        "contacted": query.filter(models.Enquiry.status == "CONTACTED").count(),
        "followup": query.filter(models.Enquiry.status == "FOLLOW_UP").count(),
        "quoted": query.filter(models.Enquiry.status == "QUOTED").count(),
        "converted": query.filter(models.Enquiry.status == "CONVERTED").count(),
        "lost": query.filter(models.Enquiry.status == "LOST").count()
    }

