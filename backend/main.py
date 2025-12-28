from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine
from scheduler import start_scheduler, stop_scheduler
from contextlib import asynccontextmanager

# Import routers
from routers import auth_routes
from routers import users
from routers import customers
from routers import enquiries
from routers import complaints
from routers import service_requests
from routers import service_engineer
from routers import feedback
from routers import attendance
from routers import mif
from routers import sales
from routers import products
from routers import product_management
from routers import notifications
from routers import bookings
from routers import reports
from routers import audit
from routers import orders
from routers import admin_sales
from routers import visitors
from routers import stock_movements
from routers import analytics
from routers import invoices
from routers import settings


# Lifespan context manager for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting Yamini Infotech ERP System...")
    models.Base.metadata.create_all(bind=engine)
    start_scheduler()
    print("Scheduler started - Automated reminders active!")
    yield
    # Shutdown
    print("Shutting down...")
    stop_scheduler()
    print("Scheduler stopped")


app = FastAPI(
    title="Yamini Infotech Business Management System",
    description="Complete business management system with CRM, Sales, Service, and Admin modules",
    version="2.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:3000",
    ],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_routes.router)
app.include_router(users.router)
app.include_router(customers.router)
app.include_router(enquiries.router)
app.include_router(complaints.router)
app.include_router(service_requests.router)
app.include_router(service_engineer.router)
app.include_router(feedback.router)
app.include_router(attendance.router)
app.include_router(mif.router)
app.include_router(sales.router)
app.include_router(orders.router)
app.include_router(admin_sales.router)
app.include_router(products.router)
app.include_router(product_management.router)
app.include_router(notifications.router)
app.include_router(bookings.router)
app.include_router(reports.router)
app.include_router(audit.router)
app.include_router(visitors.router)
app.include_router(stock_movements.router)
app.include_router(analytics.router)
app.include_router(invoices.router)
app.include_router(settings.router)

@app.get("/")
def read_root():
    return {
        "message": "Yamini Infotech API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/api/health")
async def health():
    return {"status": "ok"}

# To run: uvicorn main:app --reload --port 8000
