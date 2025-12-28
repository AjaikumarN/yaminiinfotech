from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from models import UserRole  # OFFICE_STAFF removed - merged into RECEPTION

# User Schemas
class UserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: UserRole
    department: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    department: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None

class UserLogin(BaseModel):
    username: str
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

# Customer Schemas
class CustomerBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    company: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    id: int
    customer_id: str
    status: str
    total_purchases: int
    total_value: float
    amc_status: Optional[str]
    amc_expiry: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Enquiry Schemas
class EnquiryBase(BaseModel):
    customer_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    product_interest: Optional[str] = None
    priority: str = "WARM"
    notes: Optional[str] = None

class EnquiryCreate(EnquiryBase):
    product_id: Optional[int] = None  # Link to product table
    source: Optional[str] = "website"
    description: Optional[str] = None

class EnquiryUpdate(BaseModel):
    priority: Optional[str] = None
    status: Optional[str] = None
    assigned_to: Optional[int] = None
    next_follow_up: Optional[datetime] = None
    notes: Optional[str] = None

class Enquiry(EnquiryBase):
    id: int
    enquiry_id: str
    status: str
    assigned_to: Optional[int]
    product_id: Optional[int] = None
    source: Optional[str] = None
    next_follow_up: Optional[datetime]
    last_follow_up: Optional[datetime]
    created_at: datetime
    created_by: Optional[str] = None
    
    class Config:
        from_attributes = True

# Complaint/Service Request Schemas
class ComplaintBase(BaseModel):
    customer_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    company: Optional[str] = None
    address: Optional[str] = None
    machine_model: Optional[str] = None
    fault_description: str
    priority: str = "NORMAL"  # NORMAL, URGENT, CRITICAL

class ComplaintCreate(ComplaintBase):
    customer_id: Optional[int] = None
    assigned_to: Optional[int] = None

class ComplaintUpdate(BaseModel):
    status: Optional[str] = None  # ASSIGNED, ON_THE_WAY, IN_PROGRESS, ON_HOLD, COMPLETED
    resolution_notes: Optional[str] = None
    parts_replaced: Optional[str] = None
    assigned_to: Optional[int] = None

class ServiceCompleteRequest(BaseModel):
    resolution_notes: str
    parts_replaced: Optional[str] = None

class Complaint(ComplaintBase):
    id: int
    ticket_no: str
    status: str
    assigned_to: Optional[int]
    sla_time: Optional[datetime]
    sla_warning_sent: bool
    sla_breach_sent: bool
    created_at: datetime
    completed_at: Optional[datetime]
    resolution_notes: Optional[str] = None
    parts_replaced: Optional[str] = None
    feedback_url: Optional[str] = None
    feedback_qr: Optional[str] = None
    
    class Config:
        from_attributes = True

# Feedback Schemas
class FeedbackBase(BaseModel):
    rating: int  # 1-5
    comment: Optional[str] = None

class FeedbackCreate(FeedbackBase):
    service_request_id: int
    customer_name: str

class Feedback(FeedbackBase):
    id: int
    service_request_id: int
    customer_name: str
    is_negative: bool
    escalated: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Booking Schemas
class BookingBase(BaseModel):
    service_type: str
    machine_model: Optional[str] = None
    description: str
    preferred_date: datetime
    urgency: str = "normal"

class BookingCreate(BookingBase):
    customer_id: Optional[int] = None

class Booking(BookingBase):
    id: int
    booking_id: str
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# MIF Schemas
class MIFRecordBase(BaseModel):
    customer_name: str
    machine_model: str
    serial_number: str
    installation_date: datetime
    location: str
    machine_value: float
    amc_status: Optional[str]
    amc_expiry: Optional[datetime]

class MIFRecordCreate(MIFRecordBase):
    customer_id: Optional[int] = None

class MIFRecordUpdate(BaseModel):
    customer_name: Optional[str] = None
    machine_model: Optional[str] = None
    serial_number: Optional[str] = None
    installation_date: Optional[datetime] = None
    location: Optional[str] = None
    machine_value: Optional[float] = None
    amc_status: Optional[str] = None
    amc_expiry: Optional[datetime] = None
    last_service: Optional[datetime] = None
    next_service: Optional[datetime] = None
    status: Optional[str] = None

class MIFRecord(MIFRecordBase):
    id: int
    mif_id: str
    last_service: Optional[datetime]
    next_service: Optional[datetime]
    services_done: int
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class MIFAccessLogCreate(BaseModel):
    action: str
    ip_address: Optional[str] = None

# Sales Schemas
class SalesCallCreate(BaseModel):
    customer_name: str
    phone: str
    call_type: str
    outcome: str
    notes: Optional[str] = None

class ShopVisitCreate(BaseModel):
    customer_name: str
    shop_name: Optional[str] = None
    shop_address: Optional[str] = None
    customer_contact: Optional[str] = None
    location: str
    requirements: str
    requirement_details: Optional[str] = None
    product_interest: Optional[str] = None
    expected_closing: Optional[datetime] = None
    follow_up_date: Optional[datetime] = None
    visit_type: str = "New"
    notes: Optional[str] = None

# Attendance Schema
class AttendanceCreate(BaseModel):
    time: str
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    photo_path: Optional[str] = None
    status: str = "Present"

class Attendance(BaseModel):
    id: int
    employee_id: int
    date: datetime
    time: str
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    photo_path: Optional[str] = None
    status: str

    class Config:
        from_attributes = True

# Follow-up Schemas (Single source - merged from FollowUpHistory + EnquiryNote)
class FollowUpCreate(BaseModel):
    enquiry_id: int
    note: str
    note_type: str = "follow_up"  # call, meeting, follow_up, visit, general
    followup_date: datetime
    status: str = "Pending"

class FollowUpUpdate(BaseModel):
    note: Optional[str] = None
    note_type: Optional[str] = None
    status: Optional[str] = None
    completed_at: Optional[datetime] = None

class FollowUp(BaseModel):
    id: int
    enquiry_id: int
    salesman_id: int
    note: str
    note_type: str
    followup_date: datetime
    status: str
    created_at: datetime
    created_by: Optional[int] = None
    
    class Config:
        from_attributes = True

# Daily Report Schemas
class DailyReportCreate(BaseModel):
    report_date: datetime
    calls_made: int = 0
    shops_visited: int = 0
    enquiries_generated: int = 0
    sales_closed: int = 0
    report_notes: Optional[str] = None

class DailyReport(BaseModel):
    id: int
    salesman_id: int
    report_date: datetime
    calls_made: int
    shops_visited: int
    enquiries_generated: int
    sales_closed: int
    report_notes: Optional[str]
    report_submitted: bool
    submission_time: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Product & Service Schemas
class ProductCreate(BaseModel):
    name: str
    category: str
    model: Optional[str] = None
    brand: Optional[str] = None
    price: float
    stock_quantity: int = 0
    description: Optional[str] = None
    features: Optional[str] = None

class ServiceCreate(BaseModel):
    name: str
    service_type: str
    price: float
    duration: str
    description: Optional[str] = None

# Notification Schema
class NotificationCreate(BaseModel):
    user_id: int
    notification_type: str
    title: str
    message: str
    priority: str
    module: str
    action_url: Optional[str] = None

class Notification(BaseModel):
    id: int
    notification_type: str
    title: str
    message: str
    priority: str
    module: str
    action_url: Optional[str]
    read_status: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Order Schemas
class OrderCreate(BaseModel):
    enquiry_id: int
    quantity: int
    expected_delivery_date: Optional[datetime] = None
    discount_percent: float = 0
    notes: Optional[str] = None

class OrderUpdate(BaseModel):
    quantity: Optional[int] = None
    expected_delivery_date: Optional[datetime] = None
    discount_percent: Optional[float] = None
    notes: Optional[str] = None

class OrderApprove(BaseModel):
    approved: bool
    rejection_reason: Optional[str] = None

class Order(BaseModel):
    id: int
    order_id: str
    enquiry_id: int
    salesman_id: int
    customer_id: int
    product_id: int
    customer_name: str
    product_name: str
    quantity: int
    unit_price: float
    discount_percent: float
    discount_amount: float
    total_amount: float
    expected_delivery_date: Optional[datetime]
    notes: Optional[str]
    status: str
    approved_by: Optional[int]
    approved_at: Optional[datetime]
    rejection_reason: Optional[str]
    invoice_number: Optional[str]
    invoice_generated: bool
    stock_deducted: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# DailyReport schemas already defined above - SalesDailyReport removed (duplicate)

# Salesman Analytics Schemas
class SalesmanAnalytics(BaseModel):
    assigned_enquiries: int
    pending_followups: int
    converted_enquiries: int
    revenue_this_month: float
    missed_followups: int
    orders_pending_approval: int
    conversion_rate: float
    avg_closing_days: float

class SalesmanPerformance(BaseModel):
    salesman_id: int
    salesman_name: str
    assigned: int
    converted: int
    conversion_rate: float
    revenue: float
    avg_closing_days: float
    missed_followups: int
    visit_count: int
    lost_count: int

class SalesFunnelData(BaseModel):
    new: int
    contacted: int
    followup: int
    quoted: int
    converted: int
    lost: int

# Service Engineer Daily Report Schemas
class ServiceEngineerDailyReportBase(BaseModel):
    jobs_completed: int
    jobs_pending: int
    issues_faced: Optional[str] = None
    remarks: Optional[str] = None

class ServiceEngineerDailyReportCreate(ServiceEngineerDailyReportBase):
    pass

class ServiceEngineerDailyReport(ServiceEngineerDailyReportBase):
    id: int
    engineer_id: int
    report_date: datetime
    submitted_at: datetime
    
    class Config:
        from_attributes = True

