from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import models
import schemas
from database import get_db

# Security configuration
SECRET_KEY = "yamini_infotech_secret_key_2025"  # In production, use environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

# Configure bcrypt to work with newer bcrypt versions
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12,
    bcrypt__ident="2b"
)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Bcrypt has a 72-byte limit
    if len(plain_password.encode('utf-8')) > 72:
        plain_password = plain_password[:72]
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    # Bcrypt has a 72-byte limit on passwords
    if len(password.encode('utf-8')) > 72:
        password = password[:72]
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def authenticate_user(db: Session, username: str, password: str):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
    
    return user

def check_permission(user: models.User, permission: str) -> bool:
    """Check if user has specific permission"""
    
    permissions = {
        models.UserRole.ADMIN: {
            "access_mif": True,
            "view_all_customers": True,
            "manage_employees": True,
            "manage_reception": True,
            "view_reports": True,
            "manage_products": True,
            "manage_services": True,
            "view_financials": True,
        },
        models.UserRole.OFFICE_STAFF: {
            "access_mif": True,  # Limited, logged
            "view_all_customers": True,
            "manage_employees": False,
            "manage_reception": False,
            "view_reports": True,
            "manage_products": True,
            "manage_services": True,
            "view_financials": False,
        },
        models.UserRole.RECEPTION: {
            "access_mif": False,
            "view_all_customers": True,
            "manage_employees": False,
            "manage_reception": True,
            "view_reports": False,
            "manage_products": False,
            "manage_services": False,
            "view_financials": False,
        },
        models.UserRole.SALESMAN: {
            "access_mif": False,
            "view_all_customers": False,
            "manage_employees": False,
            "manage_reception": False,
            "view_reports": False,
            "manage_products": False,
            "manage_services": False,
            "view_financials": False,
        },
        models.UserRole.SERVICE_ENGINEER: {
            "access_mif": False,
            "view_all_customers": False,
            "manage_employees": False,
            "manage_reception": False,
            "view_reports": False,
            "manage_products": False,
            "manage_services": False,
            "view_financials": False,
        },
        models.UserRole.CUSTOMER: {
            "access_mif": False,
            "view_all_customers": False,
            "manage_employees": False,
            "manage_reception": False,
            "view_reports": False,
            "manage_products": False,
            "manage_services": False,
            "view_financials": False,
        },
    }
    
    role_permissions = permissions.get(user.role, {})
    return role_permissions.get(permission, False)

def require_permission(permission: str):
    """Decorator to require specific permission"""
    def permission_checker(current_user: models.User = Depends(get_current_user)):
        if not check_permission(current_user, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied. Required: {permission}"
            )
        return current_user
    return permission_checker

def require_mif_access(current_user: models.User = Depends(get_current_user)):
    """Require MIF access permission"""
    if not check_permission(current_user, "access_mif"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="MIF access denied. Only Admin and Office Staff can access MIF data."
        )
    return current_user
