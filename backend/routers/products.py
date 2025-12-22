from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import schemas
import crud
import models
import auth
from database import get_db

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.post("/")
def create_product(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_permission("manage_products"))
):
    """Create a new product (Admin/Office Staff only)"""
    return crud.create_product(db=db, product=product)

@router.get("/")
def get_products(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all products (Public)"""
    return crud.get_products(db, skip=skip, limit=limit)

@router.get("/{product_id}")
def get_product_by_id(
    product_id: int,
    db: Session = Depends(get_db)
):
    """Get product by ID (Public)"""
    product = crud.get_product_by_id(db, product_id=product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/services")
def create_service(
    service: schemas.ServiceCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_permission("manage_services"))
):
    """Create a new service (Admin/Office Staff only)"""
    return crud.create_service(db=db, service=service)

@router.get("/services")
def get_services(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all services (Public)"""
    return crud.get_services(db, skip=skip, limit=limit)
