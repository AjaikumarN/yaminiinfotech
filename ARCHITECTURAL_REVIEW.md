# 🏗️ ERP System Architectural Review & Refactoring Plan

## Executive Summary
This document identifies **7 critical business intents** that are currently implemented inconsistently across the codebase, causing duplication, confusion, and maintenance overhead.

---

## 🎯 INTENT #1: Customer Enquiry / Quote Request / Contact

### Current Issues

#### A. Multiple Entry Points (3 implementations)
1. **EnquiryForm Component** (`/enquiry/:productId`)
   - Route: `/enquiry/:productId`
   - API: `POST /api/enquiries`
   - Fields: customer_name, phone, email, company_name, address, enquiry_details, preferred_contact_time
   - Purpose: Product-specific enquiries
   - DB Model: `Enquiry` table with `product_id` foreign key

2. **Contact Component** (`/contact`)
   - Route: `/contact`
   - API: **NONE** (just displays branch info)
   - Fields: Static branch information only
   - Purpose: Show contact details
   - DB Model: None

3. **ProductDetail "Enquire Now" Button**
   - Route: Redirects to `/enquiry/:productId`
   - API: Same as EnquiryForm
   - Fields: Same as EnquiryForm
   - Purpose: Same as EnquiryForm (duplicate trigger)

#### B. Inconsistencies
- **Contact page** has NO form submission - just static info
- **EnquiryForm** duplicates the same flow as "Get a Quote"
- **ProductDetail** has both "📞 Enquire Now" AND "📱 Call Us" buttons doing different things
- No unified "Contact Us" flow for general enquiries (non-product specific)
- `Enquiry` model has BOTH `product_interest` (string) AND `product_id` (foreign key) - redundant fields

#### C. Problems
- **UX Confusion**: Users don't know if they should use Contact page or Enquiry form
- **Data Inconsistency**: Same enquiry intent stored differently based on entry point
- **Lost Leads**: Contact page has no submission capability
- **Duplicate Code**: EnquiryForm logic repeated in multiple places
- **Analytics Blind Spots**: Can't track which page generates most enquiries

### Standardized Flow

#### Frontend Design
**Single Unified Component: `ContactEnquiryForm.jsx`**

```jsx
// Props: { productId?: number, source: 'product' | 'contact' | 'home' }
Route: /contact-us?productId=123&source=product
Fallback: /contact-us (general enquiry)

Fields:
- customer_name* (required)
- phone* (required, validated)
- email (optional, validated)
- company_name (optional)
- address (optional)
- product_interest (dropdown: populated from products OR free text)
- enquiry_type* (dropdown: Product Purchase, Service, AMC, General Inquiry)
- message* (required, min 10 chars)
- preferred_contact_time (optional: Morning/Afternoon/Evening)
- source (hidden, auto-filled: website/product_page/contact_page/home_cta)
```

**Entry Points:**
1. `/contact` → Redirects to `/contact-us?source=contact`
2. ProductDetail "Enquire" button → `/contact-us?productId=X&source=product`
3. Home page "Get Quote" CTA → `/contact-us?source=home`
4. Footer "Contact" link → `/contact-us?source=footer`

#### Backend Design
**Single API Endpoint: `POST /api/enquiries`** (already exists, needs enhancement)

```python
# Endpoint: POST /api/enquiries
# File: routers/enquiries.py

Payload:
{
  "customer_name": str,
  "phone": str,
  "email": str | null,
  "company_name": str | null,
  "address": str | null,
  "product_id": int | null,  # If product-specific
  "enquiry_type": str,  # Product Purchase, Service, AMC, General
  "message": str,
  "preferred_contact_time": str | null,
  "source": str,  # website, product_page, contact_page, home_cta
  "priority": str  # Auto-assigned: HOT (product), WARM (service), COLD (general)
}

Response:
{
  "enquiry_id": "ENQ-2025-001",
  "status": "NEW",
  "assigned_to": null,
  "estimated_response_time": "24 hours"
}
```

**Auto-Assignment Logic:**
- Product enquiries with phone → Assign to available Salesman
- Service/AMC enquiries → Assign to Reception
- General enquiries → Reception queue

#### Database Design
**Single Table: `enquiries` (already exists, needs cleanup)**

```sql
-- Remove redundant field:
ALTER TABLE enquiries DROP COLUMN product_interest;

-- Keep only:
- enquiry_id (unique)
- customer_name
- phone
- email
- company_name
- address
- product_id (FK to products, nullable)
- enquiry_type (enum: PRODUCT, SERVICE, AMC, GENERAL)
- message (renamed from enquiry_details)
- preferred_contact_time
- source (enum: WEBSITE, PRODUCT_PAGE, CONTACT_PAGE, HOME_CTA)
- priority (enum: HOT, WARM, COLD)
- status (enum: NEW, ASSIGNED, CONTACTED, CONVERTED, CLOSED)
- assigned_to (FK to users)
- created_at
```

### Refactoring Actions

#### Phase 1: Create Unified Component
1. ✅ Create `ContactEnquiryForm.jsx` with all fields
2. ✅ Add query param handling: `?productId=X&source=Y`
3. ✅ Auto-fill product name if productId exists
4. ✅ Add enquiry_type dropdown
5. ✅ Unified validation & submission

#### Phase 2: Update Routes
1. ✅ Remove `/enquiry/:productId` route
2. ✅ Update `/contact` to render `ContactEnquiryForm` instead of static page
3. ✅ Add branch info as sidebar/header in `ContactEnquiryForm`

#### Phase 3: Update All Entry Points
1. ProductDetail.jsx: Change `navigate(/enquiry/${id})` to `navigate(/contact-us?productId=${id}&source=product)`
2. Home.jsx: Change "Get Quote" to `navigate(/contact-us?source=home)`
3. Footer: Change "Contact" to `navigate(/contact-us?source=footer)`
4. Header: Change "Contact" to `navigate(/contact-us?source=header)`

#### Phase 4: Backend Enhancement
1. ✅ Update `schemas.EnquiryCreate` to add `enquiry_type` and standardize field names
2. ✅ Add auto-assignment logic in `crud.create_enquiry()`
3. ✅ Add source tracking for analytics

#### Phase 5: Database Migration
1. ✅ Run migration to drop `product_interest` column
2. ✅ Add `enquiry_type` enum column
3. ✅ Backfill existing records

#### Phase 6: Remove Old Components
1. ❌ DELETE `EnquiryForm.jsx`
2. ❌ DELETE `Contact.jsx`

### Final Clean Design

**Single Source of Truth:**
- **Frontend**: 1 component (`ContactEnquiryForm.jsx`), 1 route (`/contact-us`)
- **Backend**: 1 endpoint (`POST /api/enquiries`)
- **Database**: 1 table (`enquiries`), no redundant fields
- **Workflow**: All enquiry types flow through the same standardized pipeline

**Benefits:**
- ✅ Consistent UX across all entry points
- ✅ Single codebase to maintain
- ✅ Unified analytics & reporting
- ✅ No lost leads
- ✅ Easier A/B testing
- ✅ Better SEO (single contact URL)

---

## 🎯 INTENT #2: Service Request / Complaint / Booking

### Current Issues

#### A. Three Separate Implementations
1. **Complaint System**
   - Route: No public route
   - API: `POST /api/complaints`
   - Model: `Complaint` table
   - Fields: customer_name, phone, address, machine_model, fault_description, priority, status, assigned_to
   - Purpose: Customer reports machine faults
   - Entry: Internal (Reception/Service Engineer)

2. **Booking System**
   - Route: No public route
   - API: `POST /api/bookings`
   - Model: `Booking` table
   - Fields: customer_id, service_type, machine_model, description, preferred_date, urgency, status
   - Purpose: Schedule service appointments
   - Entry: Internal only

3. **Service in Products Router**
   - Route: No frontend route
   - API: `POST /api/products/services`
   - Model: `Service` table
   - Fields: service_id, name, service_type, price, duration, description
   - Purpose: Service catalog (NOT service requests)
   - Entry: Internal

#### B. Inconsistencies
- **Complaint** and **Booking** serve the SAME business intent but use different tables
- No public-facing "Request Service" form for customers
- ServiceEngineer dashboard shows complaints, not bookings
- Different status enums: Complaint (Assigned/On the way/Completed/Delayed) vs Booking (Pending/Confirmed/Completed)
- Duplicate fields: `machine_model` in both Complaint and Booking
- No SLA tracking for bookings, only complaints

#### C. Problems
- **Data Fragmentation**: Same service request split across 2 tables
- **Inconsistent Workflows**: Reception uses Complaint, but should use Booking
- **Customer Confusion**: No clear way for customers to request service online
- **Reporting Gaps**: Can't get unified service request reports
- **SLA Blind Spots**: Bookings have no SLA tracking

### Standardized Flow

#### Frontend Design
**Single Component: `ServiceRequestForm.jsx`**

```jsx
Route: /service-request?customerId=X&source=customer_portal

Fields:
- customer_name* (auto-filled if logged in)
- phone* (auto-filled if logged in)
- email (optional)
- address* (required for on-site service)
- machine_model* (dropdown from customer's MIF records OR free text)
- serial_number (optional, auto-filled from MIF)
- service_type* (dropdown: Repair, AMC, Installation, Maintenance, Emergency)
- issue_description* (textarea, min 20 chars)
- preferred_date* (date picker, min: today)
- preferred_time_slot (dropdown: Morning 9-12, Afternoon 12-3, Evening 3-6)
- urgency* (radio: Normal, Urgent, Emergency)
- images[] (optional, upload fault images)
- source (hidden: customer_portal, phone_call, walk_in)
```

**Entry Points:**
1. Customer Dashboard → "Request Service" button
2. Home page → "Book Service" CTA
3. Phone call by Reception → Manual entry
4. Walk-in customer → Reception manual entry

#### Backend Design
**Single API Endpoint: `POST /api/service-requests`** (new)

```python
# New file: routers/service_requests.py

Payload:
{
  "customer_id": int | null,  # If customer is logged in
  "customer_name": str,
  "phone": str,
  "email": str | null,
  "address": str,
  "machine_model": str,
  "serial_number": str | null,
  "service_type": str,  # REPAIR, AMC, INSTALLATION, MAINTENANCE, EMERGENCY
  "issue_description": str,
  "preferred_date": datetime,
  "preferred_time_slot": str | null,
  "urgency": str,  # NORMAL, URGENT, EMERGENCY
  "images": list[str],  # URLs of uploaded images
  "source": str  # customer_portal, phone_call, walk_in
}

Response:
{
  "ticket_id": "SRV-2025-001",
  "status": "ASSIGNED",
  "assigned_engineer": "Rajesh Kumar",
  "engineer_phone": "+91 98765 43210",
  "estimated_arrival": "2025-12-22 10:00",
  "sla_deadline": "2025-12-23 18:00"
}

Auto-Logic:
- Calculate SLA based on urgency: 
  - EMERGENCY: 4 hours
  - URGENT: 24 hours
  - NORMAL: 48 hours
- Auto-assign to available Service Engineer based on:
  - Expertise (machine type)
  - Location proximity
  - Current workload
- Send SMS/Email confirmation to customer
- Send notification to assigned engineer
```

#### Database Design
**Single Unified Table: `service_requests`**

```sql
CREATE TABLE service_requests (
  id SERIAL PRIMARY KEY,
  ticket_id VARCHAR(50) UNIQUE NOT NULL,  -- SRV-2025-001
  customer_id INT REFERENCES customers(id),
  customer_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  address TEXT NOT NULL,
  machine_model VARCHAR(255) NOT NULL,
  serial_number VARCHAR(100),
  mif_id INT REFERENCES mif_records(id),  -- Link to MIF if exists
  service_type VARCHAR(50) NOT NULL,  -- REPAIR, AMC, INSTALLATION, MAINTENANCE, EMERGENCY
  issue_description TEXT NOT NULL,
  preferred_date TIMESTAMP NOT NULL,
  preferred_time_slot VARCHAR(50),
  urgency VARCHAR(20) NOT NULL,  -- NORMAL, URGENT, EMERGENCY
  images TEXT[],  -- Array of image URLs
  source VARCHAR(50) NOT NULL,  -- customer_portal, phone_call, walk_in
  
  -- Assignment & Tracking
  status VARCHAR(50) DEFAULT 'NEW',  -- NEW, ASSIGNED, EN_ROUTE, IN_PROGRESS, COMPLETED, CANCELLED
  assigned_engineer_id INT REFERENCES users(id),
  assigned_at TIMESTAMP,
  
  -- SLA Tracking
  sla_deadline TIMESTAMP NOT NULL,
  sla_warning_sent BOOLEAN DEFAULT FALSE,
  sla_breach_notified BOOLEAN DEFAULT FALSE,
  
  -- Completion
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  resolution_notes TEXT,
  customer_rating INT,  -- 1-5 stars
  customer_feedback TEXT,
  
  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(100)
);

-- Indexes
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_assigned ON service_requests(assigned_engineer_id);
CREATE INDEX idx_service_requests_sla ON service_requests(sla_deadline);
CREATE INDEX idx_service_requests_customer ON service_requests(customer_id);
```

### Refactoring Actions

#### Phase 1: Create New Service Request System
1. ✅ Create `service_requests` table migration
2. ✅ Create `routers/service_requests.py` with CRUD endpoints
3. ✅ Create `ServiceRequestForm.jsx` component
4. ✅ Add auto-assignment logic
5. ✅ Add SLA calculation & tracking

#### Phase 2: Migrate Existing Data
1. ✅ Script to migrate `complaints` table data to `service_requests`
2. ✅ Script to migrate `bookings` table data to `service_requests`
3. ✅ Map old status values to new enum
4. ✅ Preserve audit trail

#### Phase 3: Update Dashboards
1. ServiceEngineerDashboard: Change from `complaints` API to `service_requests` API
2. ReceptionDashboard: Change from both `complaints` and `bookings` to unified `service_requests`
3. Admin: Unified service request reports

#### Phase 4: Remove Old Systems
1. ❌ DROP TABLE `complaints`
2. ❌ DROP TABLE `bookings`
3. ❌ DELETE `routers/complaints.py`
4. ❌ DELETE `routers/bookings.py`
5. ✅ Keep `services` table (it's for service CATALOG, not requests)

### Final Clean Design

**Single Source of Truth:**
- **Frontend**: 1 form component, 1 route (`/service-request`)
- **Backend**: 1 router file, 1 table (`service_requests`)
- **Workflow**: All service-related requests (repair, AMC, installation) unified

**Benefits:**
- ✅ No confusion between Complaint vs Booking
- ✅ Unified SLA tracking
- ✅ Better engineer workload distribution
- ✅ Single reporting dashboard
- ✅ Consistent customer experience
- ✅ Easy to add features (e.g., real-time tracking)

---

## 🎯 INTENT #3: Product Management (Duplicate Systems)

### Current Issues

#### A. Two Product Creation Systems
1. **Old Products Router** (`routers/products.py`)
   - Endpoint: `POST /api/products/`
   - Schema: `ProductCreate` (old)
   - Fields: product_id, name, category, model, brand, price, stock_quantity, description, features, usage_type, image_url
   - Permission: `manage_products`
   - Purpose: Basic product CRUD

2. **New Product Management Router** (`routers/product_management.py`)
   - Endpoint: `POST /api/products/` (SAME PREFIX!)
   - Schema: `ProductCreate` (enhanced)
   - Fields: All above + brand, model_number, product_type, warranty_period, installation_support, amc_available, specifications, price_type, internal data
   - Permission: Role-based (Admin/Office Staff)
   - Purpose: Advanced product management with permissions

#### B. Inconsistencies
- **Duplicate API prefix**: Both routers use `/api/products`
- **Schema conflicts**: Two different `ProductCreate` schemas
- **Different permission systems**: Old uses `manage_products`, new uses role-based
- **Inconsistent data**: Old products lack warranty, AMC, internal data
- **Routing collision**: FastAPI loads routers in order, last one wins!

#### C. Problems
- **Router Collision**: Only one `/api/products` endpoint is active (last registered in main.py)
- **Data Integrity**: Products created via old system missing critical fields
- **Permission Bypass**: Old endpoint may bypass new role checks
- **Code Duplication**: Similar logic in two places
- **Confusion**: Developers don't know which router to use

### Standardized Flow

#### Solution: **REMOVE OLD ROUTER COMPLETELY**

The new `product_management.py` router is superior and should be the ONLY product router.

#### Refactoring Actions

1. ✅ **Verify Main.py Router Order**
   ```python
   # In main.py, ensure ONLY product_management is registered:
   app.include_router(product_management.router)
   
   # REMOVE this line:
   # app.include_router(products.router)  ❌ DELETE
   ```

2. ✅ **Delete Old Router**
   ```bash
   rm backend/routers/products.py
   ```

3. ✅ **Update CRUD Functions**
   - Ensure `crud.py` uses the enhanced `ProductCreate` schema
   - Remove any old schema references

4. ✅ **Database Migration**
   - Already done (add_product_management.py added new columns)
   - Verify all products have new fields populated

5. ✅ **Update Frontend**
   - All product creation goes through `AddProduct.jsx` ✅ (already done)
   - Remove any old product forms

### Final Clean Design

**Single Product Router:**
- **File**: `routers/product_management.py`
- **Endpoints**:
  - POST `/api/products/` - Create product
  - PUT `/api/products/{id}` - Update product
  - DELETE `/api/products/{id}` - Delete product
  - GET `/api/products/` - List products (public)
  - GET `/api/products/{id}` - Get product details (public)
  - GET `/api/products/permissions/check` - Check user permissions
  - POST `/api/products/{id}/images` - Upload images
  - GET `/api/products/{id}/internal` - Get confidential data

**Benefits:**
- ✅ No router collision
- ✅ Single permission system
- ✅ Consistent data structure
- ✅ Clear codebase
- ✅ No maintenance confusion

---

## 🎯 INTENT #4: Notification / Alert / Reminder (Fragmented System)

### Current Issues

#### A. Multiple Notification Mechanisms
1. **Notifications Table** (`models.Notification`)
   - Fields: user_id, notification_type, title, message, priority, module, action_url, read_status
   - API: `POST /api/notifications`
   - Display: Header bell icon + NotificationContext
   - Scope: In-app notifications

2. **Reminders Table** (`models.Reminder`)
   - Fields: reminder_type, customer_id, due_date, priority, status, notify_to
   - API: None (scheduler-based)
   - Display: Admin dashboard "Reminders" section
   - Scope: AMC, Service, Follow-up reminders

3. **ReminderSchedule Table** (`models.ReminderSchedule`)
   - Fields: schedule_type, related_id, related_type, next_reminder_date, frequency, last_sent
   - API: None (background job)
   - Display: None (backend only)
   - Scope: Recurring reminder scheduling

4. **SLA Warnings** (in Complaint model)
   - Fields: sla_warning_sent, sla_breach_notified
   - API: None (scheduler-based)
   - Display: ServiceEngineerDashboard
   - Scope: Service SLA tracking

#### B. Inconsistencies
- **4 different systems** for essentially the same intent: "Notify user about something"
- **Reminders** and **ReminderSchedule** overlap in functionality
- **SLA warnings** should be part of notification system
- **No unified notification center** - notifications scattered across dashboards
- **No user preferences** - can't control what notifications to receive
- **No notification history** - can't see past notifications once dismissed

#### C. Problems
- **Code Duplication**: Similar notification logic in 4 places
- **Inconsistent UX**: Notifications appear differently based on type
- **Missed Alerts**: Users might miss critical reminders
- **No Consolidation**: Can't see all notifications in one place
- **Difficult Debugging**: Hard to track if notification was sent

### Standardized Flow

#### Unified Notification System Design

**Single Table: `notifications` (enhanced)**

```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  
  -- Recipient
  user_id INT REFERENCES users(id),  -- NULL for role-based
  role VARCHAR(50),  -- If sending to all users with role
  
  -- Content
  notification_type VARCHAR(50) NOT NULL,  -- ENQUIRY, SERVICE_DUE, AMC_EXPIRY, SLA_WARNING, FOLLOWUP, SYSTEM
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'NORMAL',  -- LOW, NORMAL, HIGH, URGENT
  
  -- Context
  module VARCHAR(50),  -- enquiries, service_requests, mif, customers
  related_id INT,  -- ID of related record
  action_url VARCHAR(255),  -- Deep link to relevant page
  
  -- Delivery
  channels TEXT[],  -- ['in_app', 'email', 'sms', 'whatsapp']
  delivery_status JSONB,  -- {"in_app": "delivered", "email": "sent", "sms": "pending"}
  
  -- Schedule (for recurring notifications)
  schedule_type VARCHAR(50),  -- NULL (one-time), DAILY, WEEKLY, MONTHLY
  next_send_date TIMESTAMP,
  last_sent_date TIMESTAMP,
  recurrence_rule VARCHAR(255),  -- For complex schedules
  active BOOLEAN DEFAULT TRUE,
  
  -- Status
  read_status BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  dismissed BOOLEAN DEFAULT FALSE,
  dismissed_at TIMESTAMP,
  
  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(100),
  expires_at TIMESTAMP  -- Auto-delete after expiry
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id, read_status);
CREATE INDEX idx_notifications_role ON notifications(role, read_status);
CREATE INDEX idx_notifications_module ON notifications(module, related_id);
CREATE INDEX idx_notifications_schedule ON notifications(next_send_date, active);
```

**Single Backend Service: `services/notification_service.py`**

```python
class NotificationService:
    def send_notification(
        self,
        user_id: int | None,
        role: str | None,
        notification_type: str,
        title: str,
        message: str,
        priority: str = "NORMAL",
        module: str | None = None,
        related_id: int | None = None,
        action_url: str | None = None,
        channels: list[str] = ["in_app"],
        schedule_type: str | None = None,
        next_send_date: datetime | None = None
    ):
        # Create notification record
        # Send via selected channels
        # Schedule recurring if needed
        
    def send_sla_warning(self, service_request_id: int):
        # Unified SLA warning notification
        
    def send_amc_expiry_reminder(self, customer_id: int):
        # Unified AMC reminder
        
    def send_followup_reminder(self, enquiry_id: int):
        # Unified follow-up reminder
```

**Single Frontend Component: `NotificationCenter.jsx`**

```jsx
Features:
- Bell icon with unread count badge
- Dropdown panel showing recent notifications
- "View All" link to full notification history page
- Filter by: All, Unread, Module, Priority
- Mark as read/unread
- Dismiss notification
- Click notification → Navigate to action_url
- Real-time updates via WebSocket (future)
```

### Refactoring Actions

#### Phase 1: Enhance Notifications Table
1. ✅ Run migration to add new fields (channels, schedule_type, etc.)
2. ✅ Backfill existing notifications

#### Phase 2: Create Notification Service
1. ✅ Create `services/notification_service.py`
2. ✅ Implement multi-channel delivery (in-app, email, SMS)
3. ✅ Implement scheduling logic

#### Phase 3: Migrate Reminders
1. ✅ Script to migrate `reminders` table to `notifications`
2. ✅ Script to migrate `reminder_schedules` table to `notifications`
3. ✅ Update scheduler to use notification_service

#### Phase 4: Migrate SLA Warnings
1. ✅ Remove sla_warning_sent, sla_breach_notified from service_requests
2. ✅ Use notification_service.send_sla_warning() instead

#### Phase 5: Update All Notification Senders
1. Replace direct DB inserts with notification_service calls
2. Update scheduler tasks
3. Update API endpoints that create notifications

#### Phase 6: Remove Old Tables
1. ❌ DROP TABLE `reminders`
2. ❌ DROP TABLE `reminder_schedules`

### Final Clean Design

**Single Notification System:**
- **Database**: 1 table (`notifications`)
- **Service**: 1 notification service with multi-channel support
- **Frontend**: 1 NotificationCenter component
- **Workflow**: All notifications (SLA, AMC, follow-up, system) unified

**Benefits:**
- ✅ Consistent notification delivery
- ✅ User preference controls
- ✅ Unified notification history
- ✅ Easy to add new channels (WhatsApp, Push)
- ✅ Better analytics (notification effectiveness)

---

## 🎯 INTENT #5: User Authentication & Session Management

### Current Issues

#### A. Multiple Auth Patterns
1. **Frontend Auth Context** (`AuthContext.jsx`)
   - Storage: localStorage
   - Fields: user object, token
   - Methods: login, logout, canAccessMIF
   - Exported as: `useAuth()` hook

2. **Backend Auth** (`auth.py`)
   - Methods: get_current_user, require_permission, create_access_token
   - Token: JWT
   - Password hashing: bcrypt

3. **Login Component** (`Login.jsx`)
   - API: `POST /api/auth/login`
   - Redirects: Role-based (admin, reception, salesman, etc.)
   - No "Remember Me" option
   - No "Forgot Password" flow

4. **ProtectedRoute Component**
   - Checks: allowedRoles
   - Fallback: Redirects to /login
   - No session timeout handling

#### B. Inconsistencies
- **No centralized session management**: Each component checks localStorage directly
- **No token refresh**: Token expires, user forcibly logged out
- **No activity timeout**: User stays logged in forever
- **No concurrent session handling**: Same user can login from multiple devices
- **No login audit trail**: Can't track who logged in when
- **Hardcoded redirects**: Login success redirects hardcoded per role

#### C. Problems
- **Security Risk**: No session expiry, no IP tracking
- **Poor UX**: Sudden logouts without warning
- **No Analytics**: Can't track login patterns
- **No Security Alerts**: Can't detect suspicious login activity

### Standardized Flow

#### Enhanced Auth System

**Backend: Add Session Table**

```sql
CREATE TABLE user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(500) UNIQUE NOT NULL,  -- JWT
  refresh_token VARCHAR(500) UNIQUE NOT NULL,
  ip_address VARCHAR(50),
  user_agent TEXT,
  device_info JSONB,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  logout_reason VARCHAR(100),  -- manual, timeout, forced, suspicious
  logged_out_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_sessions_user ON user_sessions(user_id, is_active);
CREATE INDEX idx_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_sessions_expiry ON user_sessions(expires_at, is_active);
```

**Backend: Enhanced Auth Endpoints**

```python
# routers/auth_routes.py

POST /api/auth/login
Response:
{
  "access_token": "...",
  "refresh_token": "...",
  "expires_in": 3600,  # seconds
  "user": {...}
}

POST /api/auth/refresh
Body: { "refresh_token": "..." }
Response: { "access_token": "...", "expires_in": 3600 }

POST /api/auth/logout
Body: { "session_token": "..." }
Response: { "message": "Logged out successfully" }

GET /api/auth/sessions
Response: [ { "device": "Chrome on Windows", "last_activity": "...", "is_current": true } ]

DELETE /api/auth/sessions/{session_id}
Purpose: Logout from specific device

POST /api/auth/forgot-password
Body: { "email": "..." }
Response: { "message": "Reset link sent" }

POST /api/auth/reset-password
Body: { "token": "...", "new_password": "..." }
Response: { "message": "Password reset successful" }
```

**Frontend: Enhanced AuthContext**

```jsx
// AuthContext.jsx

Features:
- Auto token refresh before expiry
- Activity timeout detection (30 min idle → warning, 35 min → logout)
- Session restoration on page reload
- Logout all devices
- Remember me (7-day token vs 1-hour token)
- Login audit logging

Methods:
- login(username, password, rememberMe)
- logout(logoutAllDevices)
- refreshToken()
- checkSessionValidity()
- handleActivityTimeout()
```

### Refactoring Actions

1. ✅ Create `user_sessions` table migration
2. ✅ Update `POST /api/auth/login` to create session record
3. ✅ Add `POST /api/auth/refresh` endpoint
4. ✅ Add session cleanup job (delete expired sessions daily)
5. ✅ Update AuthContext with auto-refresh logic
6. ✅ Add activity timeout detection
7. ✅ Add "Forgot Password" flow
8. ✅ Add session management page in user settings

### Final Clean Design

**Benefits:**
- ✅ Secure session management
- ✅ Auto token refresh (seamless UX)
- ✅ Activity timeout protection
- ✅ Multi-device session tracking
- ✅ Password reset capability
- ✅ Login audit trail

---

## 🎯 INTENT #6: Dashboard Role Routing (Inconsistent Redirects)

### Current Issues

#### A. Scattered Redirect Logic

1. **Login Component** (Line ~80)
   ```jsx
   // Hardcoded role-based redirects
   if (role === 'admin') navigate('/admin')
   if (role === 'reception') navigate('/reception/dashboard')
   if (role === 'salesman') navigate('/employee/salesman')
   if (role === 'service_engineer') navigate('/employee/service-engineer')
   if (role === 'office_staff') navigate('/office-staff/dashboard')
   if (role === 'customer') navigate('/customer')
   ```

2. **ProtectedRoute Fallback**
   ```jsx
   <Navigate to="/login" state={{ from: location }} replace />
   ```

3. **Multiple Dashboard Routes**
   - `/admin` → Admin.jsx
   - `/admin/dashboard` → AdminDashboard.jsx (DUPLICATE!)
   - `/reception` → Receipt.jsx
   - `/reception/dashboard` → ReceptionDashboard.jsx (DUPLICATE!)
   - `/office-staff` → OfficeStaff.jsx
   - `/office-staff/dashboard` → OfficeStaffDashboard.jsx (DUPLICATE!)
   - `/employee/salesman` → SalesService.jsx
   - `/salesman/dashboard` → SalesmanDashboard.jsx (DUPLICATE!)
   - `/employee/service-engineer` → ServiceEngineerDashboard.jsx
   - `/customer` → Customer.jsx

#### B. Inconsistencies
- **Multiple dashboard components per role**: Admin has Admin.jsx AND AdminDashboard.jsx
- **Inconsistent URL patterns**: `/admin` vs `/reception/dashboard` vs `/employee/salesman`
- **Hardcoded navigation**: Every component knows about every role's route
- **No default route**: Logging in as unknown role → error

#### C. Problems
- **Maintenance Nightmare**: Changing one route requires updates in 10+ files
- **Duplicate Components**: Admin.jsx and AdminDashboard.jsx do the same thing
- **URL Inconsistency**: Bad UX, bad SEO
- **No Dynamic Routing**: Can't add new roles without code changes

### Standardized Flow

#### Unified Dashboard Routing System

**Step 1: Define Role-Route Mapping (Single Source of Truth)**

```javascript
// utils/roleRoutes.js

export const ROLE_ROUTES = {
  admin: '/dashboard/admin',
  office_staff: '/dashboard/office-staff',
  reception: '/dashboard/reception',
  salesman: '/dashboard/salesman',
  service_engineer: '/dashboard/service-engineer',
  customer: '/dashboard/customer'
}

export const getDashboardRoute = (role) => {
  return ROLE_ROUTES[role] || '/dashboard'  // Default fallback
}

export const getRoleFromRoute = (path) => {
  return Object.keys(ROLE_ROUTES).find(role => ROLE_ROUTES[role] === path)
}
```

**Step 2: Unified Dashboard Component**

```jsx
// components/Dashboard.jsx

import { useAuth } from '../contexts/AuthContext'
import AdminDashboard from './dashboards/AdminDashboard'
import OfficeStaffDashboard from './dashboards/OfficeStaffDashboard'
import ReceptionDashboard from './dashboards/ReceptionDashboard'
import SalesmanDashboard from './dashboards/SalesmanDashboard'
import ServiceEngineerDashboard from './dashboards/ServiceEngineerDashboard'
import CustomerDashboard from './dashboards/CustomerDashboard'

export default function Dashboard() {
  const { user } = useAuth()
  
  const dashboards = {
    admin: AdminDashboard,
    office_staff: OfficeStaffDashboard,
    reception: ReceptionDashboard,
    salesman: SalesmanDashboard,
    service_engineer: ServiceEngineerDashboard,
    customer: CustomerDashboard
  }
  
  const DashboardComponent = dashboards[user.role] || CustomerDashboard
  
  return <DashboardComponent />
}
```

**Step 3: Simplified App Routes**

```jsx
// App.jsx

import { getDashboardRoute } from './utils/roleRoutes'

<Routes>
  {/* Public */}
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  
  {/* Unified Dashboard - ONE route */}
  <Route 
    path="/dashboard/*" 
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    } 
  />
  
  {/* Legacy redirects (for bookmarks) */}
  <Route path="/admin" element={<Navigate to="/dashboard/admin" replace />} />
  <Route path="/reception" element={<Navigate to="/dashboard/reception" replace />} />
  {/* ... other legacy redirects ... */}
</Routes>
```

**Step 4: Updated Login Component**

```jsx
// Login.jsx

import { getDashboardRoute } from '../utils/roleRoutes'

const handleLogin = async () => {
  // ... login logic ...
  const dashboardRoute = getDashboardRoute(userData.role)
  navigate(dashboardRoute)
}
```

### Refactoring Actions

#### Phase 1: Create Role Routes Config
1. ✅ Create `utils/roleRoutes.js`
2. ✅ Define ROLE_ROUTES mapping
3. ✅ Export helper functions

#### Phase 2: Consolidate Duplicate Dashboards
1. ✅ Merge Admin.jsx + AdminDashboard.jsx → AdminDashboard.jsx
2. ✅ Merge Receipt.jsx + ReceptionDashboard.jsx → ReceptionDashboard.jsx
3. ✅ Merge OfficeStaff.jsx + OfficeStaffDashboard.jsx → OfficeStaffDashboard.jsx
4. ✅ Merge SalesService.jsx + SalesmanDashboard.jsx → SalesmanDashboard.jsx
5. ✅ Rename Customer.jsx → CustomerDashboard.jsx (consistency)

#### Phase 3: Create Unified Dashboard Wrapper
1. ✅ Create `components/Dashboard.jsx`
2. ✅ Move all dashboard imports to dashboards/ subfolder
3. ✅ Implement role-based component rendering

#### Phase 4: Update App Routes
1. ✅ Replace all individual dashboard routes with `/dashboard/*`
2. ✅ Add legacy redirects for backward compatibility
3. ✅ Remove old routes

#### Phase 5: Update All Navigation References
1. ✅ Update Login.jsx to use `getDashboardRoute()`
2. ✅ Update Header.jsx to use role routes
3. ✅ Update ProtectedRoute redirect logic
4. ✅ Search codebase for `navigate('/admin')` etc. and replace

#### Phase 6: Delete Duplicate Files
1. ❌ DELETE Admin.jsx (keep AdminDashboard.jsx)
2. ❌ DELETE Receipt.jsx (keep ReceptionDashboard.jsx)
3. ❌ DELETE OfficeStaff.jsx (keep OfficeStaffDashboard.jsx)
4. ❌ DELETE SalesService.jsx (keep SalesmanDashboard.jsx)

### Final Clean Design

**Unified Dashboard URLs:**
- `/dashboard/admin`
- `/dashboard/office-staff`
- `/dashboard/reception`
- `/dashboard/salesman`
- `/dashboard/service-engineer`
- `/dashboard/customer`

**Benefits:**
- ✅ Consistent URL structure
- ✅ No duplicate components
- ✅ Single source of truth for routing
- ✅ Easy to add new roles (just update roleRoutes.js)
- ✅ Centralized navigation logic
- ✅ Better SEO
- ✅ Easier testing

---

## 🎯 INTENT #7: Product Actions (View / Enquire / Call - Fragmented UX)

### Current Issues

#### A. Multiple Action Buttons on Product Detail

1. **ProductDetail.jsx** (Line ~148)
   ```jsx
   <button onClick={() => navigate(`/enquiry/${product.id}`)}>
     📞 Enquire Now
   </button>
   <button onClick={() => window.location.href = 'tel:+911234567890'}>
     📱 Call Us
   </button>
   ```

2. **Home.jsx Featured Products**
   ```jsx
   <button onClick={() => navigate(`/products/${product.id}`)}>
     View Details
   </button>
   ```

3. **ProductListing.jsx**
   - Shows product cards with "View Details" button
   - No "Enquire" or "Call" directly from listing

#### B. Inconsistencies
- **ProductDetail** has both Enquire and Call buttons (redundant)
- **No "Add to Wishlist"** or "Compare" features (standard e-commerce patterns)
- **No "Share" button** for social sharing
- **No "Request Demo"** button (common for B2B products like printers)
- **Call button** has hardcoded phone number (should use branch-based routing)
- **No analytics tracking** on button clicks

#### C. Problems
- **Decision Paralysis**: Too many action buttons confuse users
- **Missed Leads**: No way to capture "soft interest" (wishlist, demo request)
- **Poor Mobile UX**: Multiple buttons crowd small screens
- **No Social Proof**: Can't share products with colleagues for approval
- **Analytics Gaps**: Can't track which CTA performs best

### Standardized Flow

#### Unified Product CTA System

**Primary CTA: "Get Quote" (Always Visible)**
- Action: Opens contact form with product pre-filled
- Priority: Primary button (bold color)
- Analytics: Track "quote_requested" event

**Secondary CTAs: Context Menu**
```jsx
<DropdownMenu>
  <MenuItem icon="📞" onClick={handleCallRequest}>
    Request Call Back
  </MenuItem>
  <MenuItem icon="📧" onClick={handleEmailBrochure}>
    Email Brochure
  </MenuItem>
  <MenuItem icon="🎬" onClick={handleRequestDemo}>
    Schedule Demo
  </MenuItem>
  <MenuItem icon="💬" onClick={handleWhatsApp}>
    WhatsApp Us
  </MenuItem>
  <MenuItem icon="🔗" onClick={handleShare}>
    Share Product
  </MenuItem>
  <MenuItem icon="💰" onClick={handleEMICalculator}>
    EMI Calculator
  </MenuItem>
</DropdownMenu>
```

**Tertiary CTAs: Icon Buttons (Top Right)**
```jsx
<IconButton icon="🔖" onClick={handleWishlist} />
<IconButton icon="⚖️" onClick={handleCompare} />
<IconButton icon="📤" onClick={handleShare} />
```

### Refactoring Actions

1. ✅ Create `ProductActions.jsx` component
2. ✅ Implement dropdown menu with all secondary actions
3. ✅ Add analytics tracking to all CTAs
4. ✅ Implement "Request Call Back" flow (creates enquiry with type="callback")
5. ✅ Add "Email Brochure" feature
6. ✅ Add "Schedule Demo" flow
7. ✅ Replace hardcoded buttons in ProductDetail, Home, ProductListing

### Final Clean Design

**Simplified Product Actions:**
- **1 primary CTA**: "Get Quote" (always visible)
- **1 dropdown menu**: All other actions (clean UI)
- **3 icon buttons**: Quick actions (wishlist, compare, share)
- **Consistent across**: ProductDetail, ProductListing, Home

**Benefits:**
- ✅ Clean, uncluttered UI
- ✅ Mobile-friendly
- ✅ More conversion options
- ✅ Better analytics
- ✅ Social sharing capability

---

## 📊 Summary of All Refactoring Actions

### Critical (Do First)
1. ✅ **Remove duplicate Product router** (products.py) - IMMEDIATE
2. ✅ **Unify Enquiry system** - Merge Contact + EnquiryForm
3. ✅ **Consolidate Service Requests** - Merge Complaints + Bookings
4. ✅ **Fix Dashboard Routing** - Remove duplicate dashboards

### High Priority
5. ✅ **Unify Notification System** - Merge 4 notification tables
6. ✅ **Enhance Auth System** - Add session management, token refresh
7. ✅ **Standardize Product Actions** - Unified CTA system

### Files to DELETE (After Migration)
```bash
# Duplicate/Old Files
rm frontend/src/components/Contact.jsx
rm frontend/src/components/EnquiryForm.jsx
rm frontend/src/components/Admin.jsx
rm frontend/src/components/Receipt.jsx
rm frontend/src/components/OfficeStaff.jsx
rm frontend/src/components/SalesService.jsx
rm backend/routers/products.py
rm backend/routers/complaints.py
rm backend/routers/bookings.py
```

### Database Migrations
```sql
-- Drop after data migration
DROP TABLE IF EXISTS complaints;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS reminders;
DROP TABLE IF EXISTS reminder_schedules;

-- Remove redundant columns
ALTER TABLE enquiries DROP COLUMN IF EXISTS product_interest;
```

### Estimated Impact
- **Code Reduction**: ~2,500 lines removed
- **Files Deleted**: 9 components, 3 routers
- **Tables Consolidated**: 6 → 3
- **Routes Simplified**: 15+ → 7
- **Maintenance Effort**: Reduced by 60%

---

## 🎯 Next Steps

1. **Review this document** with the team
2. **Prioritize intents** based on business impact
3. **Create feature branch** for each refactoring
4. **Write tests** before starting (to prevent regressions)
5. **Execute phase by phase** (don't refactor everything at once)
6. **Update documentation** after each phase
7. **Train team** on new standardized flows

---

## ✅ Benefits of This Refactoring

### For Users
- ✅ Consistent, predictable UX
- ✅ Faster page loads (less code)
- ✅ Fewer bugs
- ✅ Better mobile experience

### For Developers
- ✅ Single source of truth
- ✅ Easier onboarding
- ✅ Faster feature development
- ✅ Less context switching

### For Business
- ✅ Better analytics
- ✅ Easier A/B testing
- ✅ Lower maintenance costs
- ✅ Faster time to market

---

**Generated**: December 21, 2025  
**Last Updated**: December 21, 2025  
**Version**: 1.0
