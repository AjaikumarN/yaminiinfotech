"""
Automated Scheduler for ERP System
Handles:
1. Enquiry Follow-up Reminders (HOT/WARM/COLD)
2. Daily Report Submission Tracking
3. Service SLA Warning System
4. Monthly AMC Reminder Automation

PHASE 4: Uses centralized NotificationService
"""

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, date
from database import SessionLocal
from models import (
    Enquiry, DailyReport, Complaint, MIFRecord, 
    Notification, ReminderSchedule, User, UserRole
)
from notification_service import NotificationService
import logging

logger = logging.getLogger(__name__)

# Initialize scheduler
scheduler = BackgroundScheduler()


def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        return db
    finally:
        pass


def create_notification(db: Session, user_id: int, title: str, message: str, 
                       notification_type: str, priority: str = "medium", 
                       module: str = None, action_url: str = None):
    """Helper function to create notifications"""
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
        priority=priority,
        module=module,
        action_url=action_url,
        created_at=datetime.utcnow()
    )
    db.add(notification)
    db.commit()


# ============================================
# 1. ENQUIRY FOLLOW-UP REMINDER SYSTEM
# ============================================

def check_enquiry_follow_ups():
    """
    Check HOT/WARM/COLD enquiries and create reminders
    HOT → weekly reminder
    WARM → monthly reminder
    COLD → future follow-up
    """
    db = get_db()
    try:
        today = datetime.utcnow().date()
        
        # Get all active enquiries
        enquiries = db.query(Enquiry).filter(
            Enquiry.status.in_(["NEW", "IN_PROGRESS", "FOLLOW_UP"]),
            Enquiry.assigned_to.isnot(None)
        ).all()
        
        for enquiry in enquiries:
            # Calculate next reminder based on priority
            if enquiry.priority == "HOT":
                frequency = 7  # 7 days (weekly)
                reminder_type = "HOT_ENQUIRY"
            elif enquiry.priority == "WARM":
                frequency = 30  # 30 days (monthly)
                reminder_type = "WARM_ENQUIRY"
            else:  # COLD
                frequency = 90  # 90 days (future)
                reminder_type = "COLD_ENQUIRY"
            
            # Check if reminder is due
            if enquiry.next_follow_up and enquiry.next_follow_up.date() <= today:
                # Create notification for assigned salesman
                create_notification(
                    db=db,
                    user_id=enquiry.assigned_to,
                    title=f"🔔 {enquiry.priority} Enquiry Follow-up Due",
                    message=f"Follow-up required for {enquiry.customer_name} - {enquiry.product_interest}",
                    notification_type="FOLLOW_UP_REMINDER",
                    priority="high" if enquiry.priority == "HOT" else "medium",
                    module="Enquiry",
                    action_url=f"/enquiry/{enquiry.id}"
                )
                
                # Update next follow-up date
                enquiry.next_follow_up = datetime.utcnow() + timedelta(days=frequency)
                enquiry.reminder_sent_date = datetime.utcnow()
                
                logger.info(f"Reminder sent for {enquiry.priority} enquiry: {enquiry.enquiry_id}")
        
        db.commit()
        logger.info(f"✅ Follow-up reminders checked at {datetime.utcnow()}")
        
    except Exception as e:
        logger.error(f"❌ Error in enquiry follow-up check: {str(e)}")
        db.rollback()
    finally:
        db.close()


# ============================================
# 2. SALESMAN ACCOUNTABILITY - DAILY REPORTS
# ============================================

def check_daily_reports():
    """
    Check if salesmen submitted daily reports
    If NOT → Send notification to reception
    Runs every day at 7 PM
    """
    db = get_db()
    try:
        today = date.today()
        
        # Get all active salesmen
        salesmen = db.query(User).filter(
            User.role == UserRole.SALESMAN,
            User.is_active == True
        ).all()
        
        # Get reception users to notify
        reception_users = db.query(User).filter(
            User.role == UserRole.RECEPTION,
            User.is_active == True
        ).all()
        
        missing_reports = []
        
        for salesman in salesmen:
            # Check if daily report exists
            report = db.query(DailyReport).filter(
                DailyReport.salesman_id == salesman.id,
                DailyReport.date == yesterday
            ).first()
            
            if not report:
                missing_reports.append(salesman)
                
                # PHASE 4: Use NotificationService
                NotificationService.notify_daily_report_missing(
                    db=db,
                    salesman=salesman,
                    date=yesterday
                )
                
                # Notify reception staff
                for reception in reception_users:
                    NotificationService.create_notification(
                        db=db,
                        user_id=reception.id,
                        title="⚠️ Missing Daily Report",
                        message=f"Salesman {salesman.full_name or salesman.username} has not submitted yesterday's report",
                        notification_type="MISSED_REPORT",
                        priority="high",
                        module="Daily Reports",
                        action_url="/reports/daily"
                    )
                
                logger.warning(f"Missing report from salesman: {salesman.username}")
        
        if missing_reports:
            logger.info(f"⚠️ {len(missing_reports)} salesmen missing daily reports")
        else:
            logger.info("✅ All salesmen submitted daily reports")
        
        db.commit()
        
    except Exception as e:
        logger.error(f"❌ Error in daily report check: {str(e)}")
        db.rollback()
    finally:
        db.close()


# ============================================
# 3. SERVICE SLA WARNING SYSTEM
# ============================================

def check_service_sla():
    """
    Check for service SLA breaches
    If late → Alert admin + office staff
    Runs every hour
    """
    db = get_db()
    try:
        now = datetime.utcnow()
        
        # Get complaints approaching or past SLA
        complaints = db.query(Complaint).filter(
            Complaint.status.in_(["Assigned", "On the way"]),
            Complaint.sla_time.isnot(None)
        ).all()
        
        # Get admin and office staff for notifications
        admins = db.query(User).filter(User.role == UserRole.ADMIN, User.is_active == True).all()
        office_staff = db.query(User).filter(User.role == UserRole.OFFICE_STAFF, User.is_active == True).all()
        
        for complaint in complaints:
            time_remaining = complaint.sla_time - now
            hours_remaining = time_remaining.total_seconds() / 3600
            
            # SLA BREACH - Already late
            if hours_remaining < 0 and not complaint.sla_breach_notified:
                hours_late = abs(hours_remaining)
                
                # Notify admin and office staff
                for user in admins + office_staff:
                    create_notification(
                        db=db,
                        user_id=user.id,
                        title="🚨 SLA BREACH - Service Delayed!",
                        message=f"Ticket {complaint.ticket_no} is {hours_late:.1f}h late! Customer: {complaint.customer_name}",
                        notification_type="SERVICE_DELAY",
                        priority="critical",
                        module="Complaint",
                        action_url=f"/complaint/{complaint.id}"
                    )
                
                # Notify assigned engineer
                if complaint.assigned_to:
                    create_notification(
                        db=db,
                        user_id=complaint.assigned_to,
                        title="🚨 SLA BREACH - Urgent Action Required!",
                        message=f"Your assigned ticket {complaint.ticket_no} has exceeded SLA by {hours_late:.1f}h",
                        notification_type="SERVICE_DELAY",
                        priority="critical",
                        module="Complaint",
                        action_url=f"/complaint/{complaint.id}"
                    )
                
                complaint.sla_breach_notified = True
                complaint.status = "Delayed"
                logger.error(f"🚨 SLA BREACH: {complaint.ticket_no} - {hours_late:.1f}h late")
            
            # SLA WARNING - 2 hours remaining
            elif 0 < hours_remaining < 2 and not complaint.sla_warning_sent:
                for user in admins + office_staff:
                    create_notification(
                        db=db,
                        user_id=user.id,
                        title="⚠️ SLA Warning - Service Due Soon",
                        message=f"Ticket {complaint.ticket_no} SLA expires in {hours_remaining:.1f}h - {complaint.customer_name}",
                        notification_type="SERVICE_WARNING",
                        priority="high",
                        module="Complaint",
                        action_url=f"/complaint/{complaint.id}"
                    )
                
                if complaint.assigned_to:
                    create_notification(
                        db=db,
                        user_id=complaint.assigned_to,
                        title="⚠️ SLA Warning - Action Required",
                        message=f"Ticket {complaint.ticket_no} SLA expires in {hours_remaining:.1f}h",
                        notification_type="SERVICE_WARNING",
                        priority="high",
                        module="Complaint",
                        action_url=f"/complaint/{complaint.id}"
                    )
                
                complaint.sla_warning_sent = True
                logger.warning(f"⚠️ SLA WARNING: {complaint.ticket_no} - {hours_remaining:.1f}h remaining")
        
        db.commit()
        logger.info(f"✅ SLA checks completed at {datetime.utcnow()}")
        
    except Exception as e:
        logger.error(f"❌ Error in SLA check: {str(e)}")
        db.rollback()
    finally:
        db.close()


# ============================================
# 4. MONTHLY AMC REMINDER AUTOMATION
# ============================================

def check_amc_expiry():
    """
    Check for AMC expiring in 30/15/7 days
    Send monthly reminders
    Runs on 1st of every month
    """
    db = get_db()
    try:
        today = datetime.utcnow()
        
        # Check for AMC expiring in next 30 days
        expiry_dates = [
            (30, "30 days"),
            (15, "15 days"),
            (7, "7 days"),
            (1, "TOMORROW")
        ]
        
        # Get reception and office staff for notifications
        reception_users = db.query(User).filter(
            User.role == UserRole.RECEPTION,
            User.is_active == True
        ).all()
        
        office_staff = db.query(User).filter(
            User.role == UserRole.OFFICE_STAFF,
            User.is_active == True
        ).all()
        
        for days, label in expiry_dates:
            target_date = today + timedelta(days=days)
            
            # Find MIF records with AMC expiring
            mif_records = db.query(MIFRecord).filter(
                MIFRecord.amc_expiry.isnot(None),
                MIFRecord.amc_expiry >= today,
                MIFRecord.amc_expiry <= target_date,
                MIFRecord.status == "Active"
            ).all()
            
            for mif in mif_records:
                # Check if reminder already sent for this period
                last_reminder = mif.amc_reminder_sent_date
                if last_reminder and (today - last_reminder).days < days:
                    continue  # Already sent reminder for this period
                
                priority = "critical" if days <= 7 else "high"
                
                # Notify reception and office staff
                for user in reception_users + office_staff:
                    create_notification(
                        db=db,
                        user_id=user.id,
                        title=f"🔔 AMC Expiring in {label}",
                        message=f"Customer: {mif.customer_name} | Machine: {mif.machine_model} (S/N: {mif.serial_number})",
                        notification_type="AMC_EXPIRY",
                        priority=priority,
                        module="MIF",
                        action_url=f"/mif/{mif.id}"
                    )
                
                # Update reminder sent date
                mif.amc_reminder_sent_date = today
                
                logger.info(f"📧 AMC reminder sent: {mif.customer_name} - expires in {label}")
        
        db.commit()
        logger.info(f"✅ AMC expiry checks completed at {datetime.utcnow()}")
        
    except Exception as e:
        logger.error(f"❌ Error in AMC check: {str(e)}")
        db.rollback()
    finally:
        db.close()


# ============================================
# SCHEDULER CONFIGURATION
# ============================================

def start_scheduler():
    """Start the background scheduler"""
    
    # 1. Check enquiry follow-ups every hour
    scheduler.add_job(
        check_enquiry_follow_ups,
        CronTrigger(minute=0),  # Every hour at minute 0
        id='enquiry_followups',
        name='Check Enquiry Follow-ups',
        replace_existing=True
    )
    
    # 2. Check daily reports at 7 PM every day
    scheduler.add_job(
        check_daily_reports,
        CronTrigger(hour=19, minute=0),  # 7:00 PM daily
        id='daily_reports',
        name='Check Daily Report Submissions',
        replace_existing=True
    )
    
    # 3. Check service SLA every hour
    scheduler.add_job(
        check_service_sla,
        CronTrigger(minute=30),  # Every hour at minute 30
        id='service_sla',
        name='Check Service SLA',
        replace_existing=True
    )
    
    # 4. Check AMC expiry on 1st of every month at 9 AM
    scheduler.add_job(
        check_amc_expiry,
        CronTrigger(day=1, hour=9, minute=0),  # 1st of month, 9:00 AM
        id='amc_expiry',
        name='Check AMC Expiry',
        replace_existing=True
    )
    
    scheduler.start()
    logger.info("🚀 Scheduler started successfully!")
    logger.info("📋 Active jobs:")
    logger.info("  - Enquiry Follow-ups: Every hour")
    logger.info("  - Daily Reports Check: 7 PM daily")
    logger.info("  - Service SLA Check: Every hour")
    logger.info("  - AMC Expiry Check: 1st of month, 9 AM")


def stop_scheduler():
    """Stop the background scheduler"""
    scheduler.shutdown()
    logger.info("⏸️ Scheduler stopped")
