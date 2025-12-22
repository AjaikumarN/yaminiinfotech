from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List
import schemas
import crud
import models
import auth
from database import get_db

router = APIRouter(prefix="/api/mif", tags=["MIF (Confidential)"])

@router.post("/", response_model=schemas.MIFRecord)
def create_mif_record(
    mif: schemas.MIFRecordCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_mif_access)
):
    """Create MIF record (Admin/Office Staff only)"""
    return crud.create_mif_record(db=db, mif=mif)

@router.get("/", response_model=List[schemas.MIFRecord])
def get_mif_records(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_mif_access)
):
    """Get all MIF records (Admin/Office Staff only - ACCESS LOGGED)"""
    ip_address = request.client.host
    return crud.get_mif_records(
        db, 
        user_id=current_user.id,
        ip_address=ip_address,
        skip=skip, 
        limit=limit
    )

@router.get("/access-logs")
def get_mif_access_logs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_permission("manage_employees"))
):
    """Get MIF access logs (Admin only)"""
    return crud.get_mif_access_logs(db, skip=skip, limit=limit)
