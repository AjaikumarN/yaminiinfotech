from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime
import schemas
import models
import auth
from database import get_db

router = APIRouter(prefix="/api/orders", tags=["Orders"])

def generate_order_id(db: Session) -> str:
    """Generate unique order ID"""
    count = db.query(models.Order).count()
    return f"ORD-{datetime.now().strftime('%Y%m%d')}-{count + 1:04d}"

def generate_invoice_number(db: Session) -> str:
    """Generate unique invoice number"""
    count = db.query(models.Order).filter(models.Order.invoice_generated == True).count()
    return f"INV-{datetime.now().strftime('%Y%m%d')}-{count + 1:04d}"

@router.post("/", response_model=schemas.Order)
def create_order(
    order: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Create order - Salesman only (from CONVERTED enquiry)"""
    
    # Only salesman and admin can create orders
    if current_user.role not in [models.UserRole.SALESMAN, models.UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Only salesmen can create orders")
    
    # Get enquiry
    enquiry = db.query(models.Enquiry).filter(models.Enquiry.id == order.enquiry_id).first()
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    
    # Validation 1: Enquiry must be CONVERTED
    if enquiry.status != "CONVERTED":
        raise HTTPException(status_code=400, detail="Order allowed only after conversion. Enquiry status must be CONVERTED")
    
    # Validation 2: Must be assigned to current salesman (unless admin)
    if current_user.role == models.UserRole.SALESMAN and enquiry.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="Not your enquiry. You can only create orders for your assigned enquiries")
    
    # Validation 3: Check if order already exists for this enquiry
    existing_order = db.query(models.Order).filter(models.Order.enquiry_id == enquiry.id).first()
    if existing_order:
        raise HTTPException(status_code=400, detail="Order already exists for this enquiry")
    
    # Get product details
    if not enquiry.product_id:
        raise HTTPException(status_code=400, detail="Enquiry must have a product assigned")
    
    product = db.query(models.Product).filter(models.Product.id == enquiry.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Get customer
    customer = db.query(models.Customer).filter(models.Customer.id == enquiry.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Calculate amounts
    unit_price = product.price
    discount_amount = (unit_price * order.quantity * order.discount_percent) / 100
    total_amount = (unit_price * order.quantity) - discount_amount
    
    # Create order
    db_order = models.Order(
        order_id=generate_order_id(db),
        enquiry_id=enquiry.id,
        salesman_id=enquiry.assigned_to,
        customer_id=customer.id,
        product_id=product.id,
        customer_name=customer.name,
        product_name=product.name,
        quantity=order.quantity,
        unit_price=unit_price,
        discount_percent=order.discount_percent,
        discount_amount=discount_amount,
        total_amount=total_amount,
        expected_delivery_date=order.expected_delivery_date,
        notes=order.notes,
        status="PENDING"
    )
    
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    return db_order

@router.get("/", response_model=List[schemas.Order])
def get_orders(
    status: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get orders - Role-based access"""
    
    query = db.query(models.Order)
    
    # Salesman can only see their own orders
    if current_user.role == models.UserRole.SALESMAN:
        query = query.filter(models.Order.salesman_id == current_user.id)
    # Admin and Office Staff can see all orders
    elif current_user.role not in [models.UserRole.ADMIN, models.UserRole.OFFICE_STAFF]:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    if status:
        query = query.filter(models.Order.status == status)
    
    return query.order_by(models.Order.created_at.desc()).all()

@router.get("/my-orders", response_model=List[schemas.Order])
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get orders for current salesman"""
    
    if current_user.role != models.UserRole.SALESMAN:
        raise HTTPException(status_code=403, detail="Only salesmen can access this endpoint")
    
    return db.query(models.Order).filter(
        models.Order.salesman_id == current_user.id
    ).order_by(models.Order.created_at.desc()).all()

@router.get("/pending-approval", response_model=List[schemas.Order])
def get_pending_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get pending orders - Admin and Office Staff only"""
    
    if current_user.role not in [models.UserRole.ADMIN, models.UserRole.OFFICE_STAFF]:
        raise HTTPException(status_code=403, detail="Only admin and office staff can view pending orders")
    
    return db.query(models.Order).filter(
        models.Order.status == "PENDING"
    ).order_by(models.Order.created_at.desc()).all()

@router.get("/{order_id}", response_model=schemas.Order)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get specific order"""
    
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Salesman can only see their own orders
    if current_user.role == models.UserRole.SALESMAN and order.salesman_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only view your own orders")
    
    return order

@router.put("/{order_id}/approve", response_model=schemas.Order)
def approve_order(
    order_id: int,
    approval: schemas.OrderApprove,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Approve or reject order - Admin and Office Staff only"""
    
    # Only Admin and Office Staff can approve
    if current_user.role not in [models.UserRole.ADMIN, models.UserRole.OFFICE_STAFF]:
        raise HTTPException(status_code=403, detail="Only admin and office staff can approve orders")
    
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.status != "PENDING":
        raise HTTPException(status_code=400, detail="Order is not pending approval")
    
    if approval.approved:
        # Get product to check stock
        product = db.query(models.Product).filter(models.Product.id == order.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Check stock availability
        if product.stock_quantity < order.quantity:
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient stock. Available: {product.stock_quantity}, Required: {order.quantity}"
            )
        
        # Deduct stock
        product.stock_quantity -= order.quantity
        
        # Generate invoice
        order.invoice_number = generate_invoice_number(db)
        order.invoice_generated = True
        order.stock_deducted = True
        order.status = "APPROVED"
        order.approved_by = current_user.id
        order.approved_at = datetime.utcnow()
        
        # Update customer total purchases
        customer = db.query(models.Customer).filter(models.Customer.id == order.customer_id).first()
        if customer:
            customer.total_purchases += 1
            customer.total_value += order.total_amount
        
    else:
        # Reject order
        order.status = "REJECTED"
        order.approved_by = current_user.id
        order.approved_at = datetime.utcnow()
        order.rejection_reason = approval.rejection_reason
    
    db.commit()
    db.refresh(order)
    
    return order

@router.put("/{order_id}", response_model=schemas.Order)
def update_order(
    order_id: int,
    order_update: schemas.OrderUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Update order - Admin and Office Staff only (before approval)"""
    
    # Only Admin and Office Staff can edit
    if current_user.role not in [models.UserRole.ADMIN, models.UserRole.OFFICE_STAFF]:
        raise HTTPException(status_code=403, detail="Only admin and office staff can edit orders")
    
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Cannot edit approved/rejected orders
    if order.status != "PENDING":
        raise HTTPException(status_code=400, detail="Cannot edit order after approval/rejection")
    
    # Update fields
    if order_update.quantity is not None:
        order.quantity = order_update.quantity
        # Recalculate amounts
        discount_amount = (order.unit_price * order.quantity * order.discount_percent) / 100
        order.discount_amount = discount_amount
        order.total_amount = (order.unit_price * order.quantity) - discount_amount
    
    if order_update.discount_percent is not None:
        order.discount_percent = order_update.discount_percent
        # Recalculate amounts
        discount_amount = (order.unit_price * order.quantity * order.discount_percent) / 100
        order.discount_amount = discount_amount
        order.total_amount = (order.unit_price * order.quantity) - discount_amount
    
    if order_update.expected_delivery_date is not None:
        order.expected_delivery_date = order_update.expected_delivery_date
    
    if order_update.notes is not None:
        order.notes = order_update.notes
    
    db.commit()
    db.refresh(order)
    
    return order

@router.delete("/{order_id}")
def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Delete order - Admin only (only if PENDING)"""
    
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admin can delete orders")
    
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.status != "PENDING":
        raise HTTPException(status_code=400, detail="Cannot delete approved/rejected orders")
    
    db.delete(order)
    db.commit()
    
    return {"message": "Order deleted successfully"}
