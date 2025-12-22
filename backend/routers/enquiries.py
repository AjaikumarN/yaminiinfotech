from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import schemas
import crud
import models
import auth
from database import get_db

router = APIRouter(prefix="/api/enquiries", tags=["Enquiries"])

@router.post("/", response_model=schemas.Enquiry)
def create_enquiry(
    enquiry: schemas.EnquiryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Create a new enquiry"""
    return crud.create_enquiry(db=db, enquiry=enquiry, created_by=current_user.full_name)

@router.get("/", response_model=List[schemas.Enquiry])
def get_enquiries(
    skip: int = 0,
    limit: int = 100,
    assigned_to: int = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get enquiries - Reception sees all, Salesman sees only assigned ones"""
    if current_user.role == models.UserRole.SALESMAN:
        # Salesmen can only see enquiries assigned to them
        if assigned_to and assigned_to != current_user.id:
            raise HTTPException(status_code=403, detail="Cannot view other salesmen's enquiries")
        return crud.get_enquiries_by_salesman(db, salesman_id=current_user.id)
    elif current_user.role in [models.UserRole.RECEPTION, models.UserRole.ADMIN]:
        # Reception and admin can see all enquiries
        if assigned_to:
            return crud.get_enquiries_by_salesman(db, salesman_id=assigned_to)
        return crud.get_enquiries(db, skip=skip, limit=limit)
    else:
        raise HTTPException(status_code=403, detail="Permission denied")

@router.put("/{enquiry_id}", response_model=schemas.Enquiry)
def update_enquiry(
    enquiry_id: int,
    enquiry: schemas.EnquiryUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_permission("manage_reception"))
):
    """Update enquiry (Reception only)"""
    updated = crud.update_enquiry(db, enquiry_id=enquiry_id, enquiry=enquiry)
    if not updated:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    return updated

@router.delete("/{enquiry_id}")
def delete_enquiry(
    enquiry_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_permission("manage_reception"))
):
    """Delete enquiry (Reception only)"""
    enquiry = db.query(models.Enquiry).filter(models.Enquiry.id == enquiry_id).first()
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    
    db.delete(enquiry)
    db.commit()
    return {"message": "Enquiry deleted successfully"}

# Follow-up endpoints
@router.post("/followups", response_model=schemas.FollowUp)
def create_followup(
    followup: schemas.FollowUpCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Create a new follow-up (Salesman only)"""
    if current_user.role != models.UserRole.SALESMAN:
        raise HTTPException(status_code=403, detail="Only salesmen can create follow-ups")
    
    # Verify enquiry is assigned to this salesman
    enquiry = db.query(models.Enquiry).filter(models.Enquiry.id == followup.enquiry_id).first()
    if not enquiry or enquiry.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="You can only create follow-ups for your assigned enquiries")
    
    return crud.create_followup(db=db, followup=followup, salesman_id=current_user.id)

@router.get("/followups", response_model=List[schemas.FollowUp])
def get_my_followups(
    status: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get my follow-ups (Salesman only)"""
    if current_user.role != models.UserRole.SALESMAN:
        raise HTTPException(status_code=403, detail="Only salesmen can view follow-ups")
    
    return crud.get_followups_by_salesman(db=db, salesman_id=current_user.id, status=status)

@router.put("/followups/{followup_id}", response_model=schemas.FollowUp)
def update_followup(
    followup_id: int,
    followup: schemas.FollowUpUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Update follow-up status (Salesman only)"""
    if current_user.role != models.UserRole.SALESMAN:
        raise HTTPException(status_code=403, detail="Only salesmen can update follow-ups")
    
    # Verify this followup belongs to the salesman
    db_followup = db.query(models.SalesFollowUp).filter(models.SalesFollowUp.id == followup_id).first()
    if not db_followup or db_followup.salesman_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only update your own follow-ups")
    
    updated = crud.update_followup(db=db, followup_id=followup_id, followup=followup)
    if not updated:
        raise HTTPException(status_code=404, detail="Follow-up not found")
    return updated
