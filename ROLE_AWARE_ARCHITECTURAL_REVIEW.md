# 🏗️ Role-Aware ERP Architectural Review & Refactoring Plan

**Project**: Yamini Infotech ERP System  
**Date**: December 21, 2025  
**Version**: 2.0 (Production-Ready)  
**Focus**: Role-based access control (RBAC) preservation + Intent standardization

---

## 📊 STEP 1: ROLE DISCOVERY & PERMISSIONS MATRIX

### Discovered Roles (from code analysis)

#### Role Definitions (from `models.UserRole` enum)
```python
ADMIN = "admin"
RECEPTION = "reception"
SALESMAN = "salesman"
SERVICE_ENGINEER = "service_engineer"
OFFICE_STAFF = "office_staff"
CUSTOMER = "customer"
```

---

### ROLE PERMISSIONS MATRIX (Current Implementation)

| Permission Code | Admin | Office Staff | Reception | Salesman | Service Eng | Customer |
|----------------|-------|--------------|-----------|----------|-------------|----------|
| **PRODUCTS** |
| ADD_PRODUCT | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| EDIT_PRODUCT | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| VIEW_PRODUCT | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| DELETE_PRODUCT | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| VIEW_INTERNAL_DATA | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| UPDATE_STOCK | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **ENQUIRIES** |
| VIEW_ENQUIRIES | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| UPDATE_ENQUIRIES | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **USERS & ROLES** |
| MANAGE_USERS | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| MANAGE_ROLES | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **MIF (Confidential)** |
| VIEW_MIF | ✅ | ✅ (logged) | ❌ | ❌ | ❌ | ❌ |
| **REPORTS** |
| VIEW_REPORTS | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| VIEW_FINANCIALS | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

### ROLE-BASED UI ACCESS (from ProtectedRoute analysis)

#### Admin
**Accessible Routes:**
- ALL routes (admin privilege)
- `/admin` - Admin dashboard
- `/admin/dashboard` - AdminDashboard component
- Can access all other role routes

**UI Capabilities:**
- Create/edit/delete products (with internal pricing visibility)
- Manage employees, users, roles
- View/update all enquiries
- Access MIF (Machine Installation File) - confidential data
- View all financial reports
- Manage reception, services, complaints

**Restricted:**
- None (full access)

---

#### Office Staff
**Accessible Routes:**
- `/office-staff` - OfficeStaff component
- `/office-staff/dashboard` - OfficeStaffDashboard component
- `/products/add` - AddProduct form
- `/products/edit/:productId` - Edit products

**UI Capabilities:**
- Add/edit products (including internal data: purchase cost, vendor, stock)
- View product internal data
- Update stock quantities
- View all enquiries (but cannot update status/assign)
- Access MIF with audit logging
- View reports (no financials)

**Restricted:**
- Cannot delete products
- Cannot update enquiry status or assign to salesman
- Cannot view financial reports
- Cannot manage users/employees

---

#### Reception
**Accessible Routes:**
- `/reception` - Receipt component
- `/reception/dashboard` - ReceptionDashboard component

**UI Capabilities:**
- View all enquiries
- Update enquiry status (NEW → ASSIGNED → CONTACTED → CONVERTED → CLOSED)
- Assign enquiries to salesman
- Create/view/update complaints
- Manage bookings
- View customer information
- View product catalog (public data only)

**Restricted:**
- NO MIF access
- Cannot add/edit/delete products
- Cannot view internal product data (cost, vendor, stock)
- Cannot view reports
- Cannot manage employees

---

#### Salesman
**Accessible Routes:**
- `/employee/salesman` - SalesService component
- `/salesman/dashboard` - SalesmanDashboard component

**UI Capabilities:**
- View assigned enquiries (filtered by assigned_to = current user)
- Update follow-up status on assigned enquiries
- Create sales calls
- Create shop visits
- View product catalog (public data only)
- View their own performance metrics

**Restricted:**
- Cannot view ALL enquiries (only assigned to them)
- NO MIF access
- Cannot add/edit products
- Cannot view internal product data
- Cannot assign enquiries to others
- Cannot view other salesmen's data

---

#### Service Engineer
**Accessible Routes:**
- `/employee/service-engineer` - ServiceEngineerDashboard component

**UI Capabilities:**
- View assigned complaints (filtered by assigned_engineer_id = current user)
- Update complaint status (ASSIGNED → ON_THE_WAY → IN_PROGRESS → COMPLETED)
- View customer machine information
- View product catalog (for reference)
- Mark attendance

**Restricted:**
- Cannot view ALL complaints (only assigned)
- NO MIF access
- Cannot add/edit products
- Cannot view enquiries
- Cannot view reports

---

#### Customer
**Accessible Routes:**
- `/customer` - Customer dashboard
- `/products` - Public product catalog
- `/products/:id` - Product details
- `/enquiry/:productId` - Submit product enquiry

**UI Capabilities:**
- View public product catalog
- Submit product enquiries
- View own enquiries/complaints
- Track complaint status
- View own AMC status

**Restricted:**
- Cannot view internal product data (cost, vendor, stock)
- Cannot view other customers' data
- NO MIF access
- Cannot access any dashboards
- Cannot view enquiries/complaints of others

---

## � PUBLIC CUSTOMER PORTAL & INTERNAL STAFF ACCESS MODEL

### Design Principle

**The main website is built primarily for CUSTOMERS and PUBLIC USERS.**  
**Internal staff access the ERP only via a secure login.**

This ensures:
- ✅ Clean customer UX
- ✅ No accidental exposure of ERP features
- ✅ Strong security boundaries
- ✅ Industry-standard ERP + website separation (single domain)

---

### 🌍 Public Website Scope (No Login Required)

**Accessible to everyone:**

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Home | Landing page with featured products, services, testimonials |
| `/products` | ProductListing | Complete product catalog with filters |
| `/products/:id` | ProductDetail | Individual product specifications, images, pricing |
| `/services` | Services | Service offerings (Installation, AMC, Repairs) |
| `/contact-us` | ContactEnquiryForm | Contact + Enquiry form (unified) |
| `/about` | AboutUs | Company information, team, branches |
| `/blog` | Blog | Articles, updates, industry news |

**Capabilities:**
- View products & services (public data only)
- Submit enquiries / quote requests
- Request service calls
- Contact the company
- Read blogs & updates

**📌 Important: Customers do NOT need to create accounts or log in.**

**Customer identity is captured automatically via:**
- Enquiry form (name, phone, email, address)
- Service request form (customer details + machine info)
- Phone / Email / Address validation

---

### 🔐 Internal Staff Login (Right-Side Login Button)

**Header Design (Public View):**
```
--------------------------------------------------
LOGO   Products   Services   Contact   Blog   🔐 Login
--------------------------------------------------
```

**Login Configuration:**
- **Route**: `/login`
- **Component**: `Login.jsx`
- **Visible**: Always visible on public site header
- **Purpose**: ONLY for internal staff access

**Who Uses Login:**

| Can Login | Cannot Login |
|-----------|--------------|
| ✅ Admin | ❌ Customers |
| ✅ Reception | ❌ Public Users |
| ✅ Office Staff | |
| ✅ Salesman | |
| ✅ Service Engineer | |

---

### 🔁 Post-Login Role-Based Redirection

**After successful authentication, users are redirected based on role:**

| Role | Redirect Route | Dashboard Component |
|------|----------------|---------------------|
| Admin | `/dashboard/admin` | AdminDashboard.jsx |
| Office Staff | `/dashboard/office-staff` | OfficeStaffDashboard.jsx |
| Reception | `/dashboard/reception` | ReceptionDashboard.jsx |
| Salesman | `/dashboard/salesman` | SalesmanDashboard.jsx |
| Service Engineer | `/dashboard/service-engineer` | ServiceEngineerDashboard.jsx |

**Implementation (from INTENT #6):**
```javascript
// utils/roleRoutes.js
export const ROLE_ROUTES = {
  admin: '/dashboard/admin',
  office_staff: '/dashboard/office-staff',
  reception: '/dashboard/reception',
  salesman: '/dashboard/salesman',
  service_engineer: '/dashboard/service-engineer'
}

export const getDashboardRoute = (role) => {
  return ROLE_ROUTES[role] || '/dashboard'
}

// Login.jsx
const handleLoginSuccess = (user) => {
  const dashboardRoute = getDashboardRoute(user.role)
  navigate(dashboardRoute)
}
```

**Benefits:**
- ✅ No hardcoded navigation
- ✅ Single source of truth
- ✅ Easy to add new roles
- ✅ Centralized maintenance

---

### 🧱 UI Mode Switching (CRITICAL IMPLEMENTATION)

**Before Login (Public Mode):**

```jsx
// App.jsx - Public Mode
<BrowserRouter>
  <Header showPublicNav={true} showStaffNav={false} />
  {/* NO Sidebar */}
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/products" element={<ProductListing />} />
    <Route path="/products/:id" element={<ProductDetail />} />
    <Route path="/services" element={<Services />} />
    <Route path="/contact-us" element={<ContactEnquiryForm />} />
    <Route path="/about" element={<AboutUs />} />
    <Route path="/login" element={<Login />} />
  </Routes>
  <Footer />
</BrowserRouter>
```

**After Login (Internal Mode):**

```jsx
// App.jsx - Internal Mode
<BrowserRouter>
  <Header showPublicNav={false} showStaffNav={true} />
  <Sidebar role={user.role} /> {/* ERP Sidebar */}
  <NotificationBell /> {/* Notification icon */}
  <Routes>
    <Route path="/dashboard/*" element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    } />
    {/* All internal routes */}
  </Routes>
</BrowserRouter>
```

**UI State Management:**
```javascript
// AuthContext.jsx
const [uiMode, setUiMode] = useState('public') // or 'internal'

useEffect(() => {
  if (isAuthenticated && user.role !== 'customer') {
    setUiMode('internal')
  } else {
    setUiMode('public')
  }
}, [isAuthenticated, user])
```

**Conditional Rendering:**
```jsx
// Header.jsx
export default function Header() {
  const { uiMode } = useAuth()
  
  return (
    <header>
      {uiMode === 'public' ? (
        <PublicNav />
      ) : (
        <StaffNav />
      )}
    </header>
  )
}
```

---

### 🔒 Access Control Guarantees

**Customers (Public Users):**

| Access Level | Details |
|--------------|---------|
| ❌ Cannot access | `/dashboard/*` routes |
| ❌ Cannot access | `/admin`, `/reception`, `/employee/*` |
| ❌ Cannot see | Internal data (MIF, pricing, vendor, stock) |
| ❌ Cannot see | Other customers' enquiries/complaints |
| ✅ Can access | Public product catalog |
| ✅ Can submit | Enquiries, service requests |
| ✅ Can view | Own enquiry/service status (via phone/OTP) |

**Staff (Internal Users):**

| Access Level | Details |
|--------------|---------|
| ❌ Cannot access | Data outside their role permissions |
| ❌ Cannot access | Roles other than their own (enforced by ProtectedRoute) |
| ✅ Must login | Via `/login` with valid credentials |
| ✅ Backend enforces | All RBAC checks (frontend only assists UX) |
| ✅ Session tracked | User sessions, audit trail, activity timeout |

**Security Layers:**

```
Layer 1: Frontend ProtectedRoute (UX convenience)
         ↓
Layer 2: Backend API permission check (require_permission)
         ↓
Layer 3: Database role_permissions validation
         ↓
Layer 4: Row-level filtering (assigned_to, created_by)
```

---

### 🧠 Customer Identity Strategy (NO CUSTOMER LOGIN)

**Why No Customer Login?**

| Benefit | Impact |
|---------|--------|
| ✅ Low friction | Higher enquiry conversion rates |
| ✅ Better lead capture | No "create account" barrier |
| ✅ Less password management | Reduced support overhead |
| ✅ Simpler UX | Better for small/medium B2B businesses |
| ✅ Industry standard | Many B2B ERPs work this way |

**How Customers Are Tracked:**

**Auto-created customer record on:**
1. Enquiry submission → Creates/updates `customers` table record
2. Service request → Links to existing customer or creates new
3. Phone call (Reception manually creates)

**Linked via:**
- Primary key: Phone number (unique identifier)
- Secondary: Email
- Validation: OTP verification (future enhancement)

**Status tracking via:**
- Phone + OTP (future implementation)
- Enquiry ID / Ticket ID
- Email confirmation links

**Customer Record Structure:**
```sql
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(15) UNIQUE NOT NULL, -- Primary identifier
  email VARCHAR(255),
  address TEXT,
  company_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(50), -- 'website', 'reception', 'admin'
  verification_status ENUM('unverified', 'phone_verified', 'email_verified')
)
```

---

### 🧩 Alignment with Intent-Based Architecture

**This model perfectly aligns with earlier intents:**

| Intent | Public Customer Access | Internal Staff Access |
|--------|------------------------|----------------------|
| **Enquiry** | ✅ Create enquiry (no login) | View all / View assigned / Update / Assign |
| **Service Request** | ✅ Create request (no login) | Assign engineers / Update status / View assigned |
| **Products** | ✅ View catalog (public data) | Manage products / Edit internal data / Update stock |
| **Notifications** | ❌ No access | Role-based notifications |
| **Dashboards** | ❌ No access | Role-specific dashboards |
| **Reports** | ❌ No access | Admin & Office Staff only |
| **MIF** | ❌ No access | Admin & Office Staff (logged) |

**👉 Same data, same APIs, different access levels enforced by RBAC**

---

### ✅ Benefits of This Approach

| Benefit | Description |
|---------|-------------|
| ✔ **Clean customer experience** | No confusion about login/account creation |
| ✔ **Secure ERP access** | Staff-only login with session tracking |
| ✔ **No customer confusion** | Clear separation between public site and ERP |
| ✔ **No RBAC leakage** | Backend enforces all permissions |
| ✔ **Easy client explanation** | "Website is public, staff login for ERP" |
| ✔ **Scalable architecture** | Easy to add AI chatbot, CRM, WhatsApp later |
| ✔ **Industry standard** | Matches real-world ERP implementations |
| ✔ **Better lead capture** | Zero friction for customer enquiries |
| ✔ **Lower support overhead** | No password resets for customers |

---

### 🗣️ Client-Friendly Explanation

**You can explain it simply as:**

> "The website is public for customers to view products and submit enquiries. Our staff use a secure login from the same site to access internal ERP features like managing enquiries, assigning engineers, and tracking inventory."

**That's all most clients need to hear.**

---

### 🔧 Implementation Checklist

**Phase 1: Public Website (Already Exists)**
- ✅ Home page with featured products
- ✅ Product catalog (public data)
- ✅ Product detail pages
- ⚠️ Contact page (needs unification with EnquiryForm - see INTENT #1)
- ⚠️ Services page (needs creation)
- ⚠️ Blog (optional - future)

**Phase 2: UI Mode Switching (NEEDS IMPLEMENTATION)**
- ❌ Add `uiMode` state to AuthContext
- ❌ Create `PublicNav` and `StaffNav` components
- ❌ Add conditional header rendering
- ❌ Hide sidebar/notifications in public mode
- ❌ Show sidebar/notifications in internal mode

**Phase 3: Customer Identity (Partial Implementation)**
- ✅ Customers table exists
- ⚠️ Auto-create customer on enquiry submission (needs enhancement)
- ❌ Phone number uniqueness validation
- ❌ OTP verification (future)
- ❌ Email verification (future)

**Phase 4: Access Control Enforcement (CRITICAL - See INTENT #1, #2)**
- ❌ Fix enquiry RBAC (backend filtering)
- ❌ Fix service request RBAC (backend filtering)
- ✅ Product management RBAC (implemented)
- ✅ ProtectedRoute wrapper (implemented)

**Phase 5: Login Flow Enhancement (Partial)**
- ✅ Role-based redirect after login (exists but hardcoded)
- ⚠️ Centralized `getDashboardRoute()` helper (see INTENT #6)
- ❌ Session management (see INTENT #5)
- ❌ Activity timeout (see INTENT #5)

---

### 🏁 Integration with Existing Intents

This section **enhances and clarifies** the following existing intents:

- **INTENT #1 (Enquiry)**: Public customers submit enquiries without login
- **INTENT #2 (Service Request)**: Public customers request service without login
- **INTENT #5 (Authentication)**: Staff-only login with session management
- **INTENT #6 (Dashboard Routing)**: Role-based redirect using `getDashboardRoute()`

**No conflicts, only clarifications and improvements.**

---

## �🎯 STEP 2 & 3: BUSINESS INTENTS - ROLE-AWARE ANALYSIS

---

### 🎯 INTENT #1: Customer Enquiry / Quote Request / Contact

#### **Roles Involved**
- **Admin**: Can view ALL enquiries, update status, assign to salesman, create manual enquiry
- **Office Staff**: Can view ALL enquiries (read-only in current implementation)
- **Reception**: Can view ALL enquiries, update status, assign to salesman
- **Salesman**: Can view ONLY assigned enquiries, update follow-up notes
- **Service Engineer**: NO enquiry access
- **Customer**: Can CREATE enquiry (public form), view OWN enquiries

---

#### **Current Implementation**

**UI Entry Points:**
1. `EnquiryForm.jsx` (Route: `/enquiry/:productId`)
   - **Who can access**: Customer (public), or logged-in users
   - **What it does**: Product-specific enquiry submission
   - **API**: `POST /api/enquiries`
   
2. `Contact.jsx` (Route: `/contact`)
   - **Who can access**: Everyone (public)
   - **What it does**: Displays branch info ONLY (no form!)
   - **API**: None
   
3. ProductDetail "Enquire Now" button
   - **Who can access**: Everyone
   - **Redirects to**: `/enquiry/:productId`

**Backend APIs:**
1. `POST /api/enquiries` - Create enquiry
   - **Permission**: `require_permission("manage_reception")` for full access
   - **Public**: Partially accessible for customer enquiries
   
2. `GET /api/enquiries` - List enquiries
   - **Permission**: `require_permission("manage_reception")`
   - **Role filter**: Admin/Reception see ALL, Salesman sees assigned only
   
3. `PUT /api/enquiries/{id}` - Update enquiry
   - **Permission**: `require_permission("manage_reception")`

**Database Tables:**
- `enquiries` table
  - Fields: customer_name, phone, email, product_id, status, assigned_to, priority, source
  - **DUPLICATE FIELD ISSUE**: Has BOTH `product_interest` (string) AND `product_id` (FK)

---

#### **Problems Identified**

**Duplication:**
- Contact page shows branches but has NO enquiry form
- EnquiryForm is the only way to submit enquiries
- Product-specific enquiry vs general enquiry use SAME form with different UX

**Inconsistency:**
- Office Staff can VIEW enquiries but cannot UPDATE (permission gap)
- Salesman dashboard filters enquiries by `assigned_to`, but API doesn't enforce this filter at backend level
- Customer enquiries go to "NEW" status, but no auto-assignment logic

**Security / RBAC Risk:**
- **CRITICAL**: Backend `GET /api/enquiries` has `require_permission("manage_reception")` but does NOT filter by assigned_to for salesman role
- If salesman directly calls `/api/enquiries`, they would see ALL enquiries (bypassing UI filter)
- No backend validation to prevent salesman from updating enquiries they're not assigned to

**Data Quality:**
- Redundant `product_interest` field when `product_id` exists
- No tracking of enquiry source (which page/button generated it)

---

#### **Standardized Flow (Role-Aware)**

**Frontend:**
- **Single Component**: `ContactEnquiryForm.jsx`
  - Route: `/contact-us?productId=X&source=Y`
  - Available to: Everyone (public + logged-in)
  - If productId exists: Auto-fill product name
  - If customer logged in: Auto-fill customer details
  - Displays branch info as sidebar

**Backend:**
- **Single API**: `POST /api/enquiries` (enhanced)
  - Public access for customer enquiries
  - Auto-assignment logic:
    - Product enquiries → Assign to available salesman (round-robin)
    - Service/AMC enquiries → Assign to reception queue
  - Source tracking: `website`, `product_page`, `contact_page`, `home_cta`

- **Enhanced GET API**: `GET /api/enquiries`
  - Admin/Reception: See ALL enquiries
  - Office Staff: See ALL enquiries (read-only)
  - Salesman: **Backend filters** by `assigned_to = current_user_id` (security!)
  - Customer: See only `created_by = current_user_id`

- **Enhanced PUT API**: `PUT /api/enquiries/{id}`
  - Admin/Reception: Can update any enquiry
  - Salesman: Can ONLY update if `assigned_to = current_user_id` (backend check!)
  - Others: Forbidden

**Database:**
- DROP redundant `product_interest` column
- ADD `source` enum column
- ADD `enquiry_type` enum (PRODUCT, SERVICE, AMC, GENERAL)

**Role Permissions (Preserved):**
```
Admin: 
  - View: ALL enquiries
  - Create: Manual enquiry + assign to any salesman
  - Update: ALL enquiries (status, assignment, notes)
  - Delete: ALL enquiries

Office Staff:
  - View: ALL enquiries
  - Create: No (not their role)
  - Update: No (read-only access)
  - Delete: No

Reception:
  - View: ALL enquiries
  - Create: Manual enquiry on behalf of customer
  - Update: ALL enquiries (assign to salesman, update status)
  - Delete: No

Salesman:
  - View: ONLY assigned enquiries (backend enforced)
  - Create: No
  - Update: ONLY assigned enquiries (follow-up notes, priority)
  - Delete: No

Customer:
  - View: ONLY own enquiries
  - Create: Yes (via public form)
  - Update: No
  - Delete: No
```

---

#### **Refactoring Actions**

**Phase 1: Backend Security Fix (CRITICAL - Must do first)**
1. ✅ Fix `GET /api/enquiries` to add role-based filtering:
   ```python
   @router.get("/")
   def get_enquiries(
       db: Session = Depends(get_db),
       current_user: User = Depends(get_current_user)
   ):
       if current_user.role == UserRole.SALESMAN:
           # Backend filter: only assigned enquiries
           return db.query(Enquiry).filter(
               Enquiry.assigned_to == current_user.id
           ).all()
       elif current_user.role == UserRole.CUSTOMER:
           # Backend filter: only own enquiries
           return db.query(Enquiry).filter(
               Enquiry.created_by == current_user.username
           ).all()
       elif current_user.role in [UserRole.ADMIN, UserRole.RECEPTION, UserRole.OFFICE_STAFF]:
           # View all
           return db.query(Enquiry).all()
       else:
           raise HTTPException(403, "Forbidden")
   ```

2. ✅ Fix `PUT /api/enquiries/{id}` to add ownership check:
   ```python
   @router.put("/{id}")
   def update_enquiry(
       id: int,
       enquiry: EnquiryUpdate,
       db: Session = Depends(get_db),
       current_user: User = Depends(get_current_user)
   ):
       existing = db.query(Enquiry).filter(Enquiry.id == id).first()
       if not existing:
           raise HTTPException(404, "Not found")
       
       # Security: Salesman can only update assigned enquiries
       if current_user.role == UserRole.SALESMAN:
           if existing.assigned_to != current_user.id:
               raise HTTPException(403, "Not assigned to you")
       
       # Admin/Reception can update any
       if current_user.role not in [UserRole.ADMIN, UserRole.RECEPTION, UserRole.SALESMAN]:
           raise HTTPException(403, "Forbidden")
       
       # Update logic...
   ```

**Phase 2: Database Cleanup**
1. ✅ Migration script:
   ```sql
   -- Remove redundant field
   ALTER TABLE enquiries DROP COLUMN IF EXISTS product_interest;
   
   -- Add source tracking
   ALTER TABLE enquiries ADD COLUMN source VARCHAR(50) DEFAULT 'website';
   
   -- Add enquiry type
   ALTER TABLE enquiries ADD COLUMN enquiry_type VARCHAR(50) DEFAULT 'PRODUCT';
   ```

**Phase 3: Frontend Unification**
1. ✅ Create `ContactEnquiryForm.jsx` (combines Contact + EnquiryForm)
2. ✅ Remove old `Contact.jsx` and `EnquiryForm.jsx`
3. ✅ Update all navigation links to use `/contact-us?productId=X&source=Y`

**Files to Remove (after migration):**
- ❌ `frontend/src/components/Contact.jsx`
- ❌ `frontend/src/components/EnquiryForm.jsx`

**Files to Update:**
- ✅ `backend/routers/enquiries.py` - Add role-based filtering
- ✅ `backend/schemas.py` - Add source, enquiry_type fields
- ✅ `frontend/src/components/ProductDetail.jsx` - Update enquiry button URL
- ✅ `frontend/src/components/Home.jsx` - Update "Get Quote" link

---

#### **Priority**
**Phase 1 (Security Fix): URGENT - Before any production use**  
**Phase 2 & 3 (Unification): High Priority - Next sprint**

---

### 🎯 INTENT #2: Service Request / Complaint / Booking

#### **Roles Involved**
- **Admin**: View ALL service requests, assign engineers, override SLA
- **Reception**: Create service requests on behalf of customers, assign engineers
- **Service Engineer**: View ONLY assigned service requests, update status
- **Customer**: Create service requests (own machines), view status
- **Salesman/Office Staff**: No access (not their domain)

---

#### **Current Implementation**

**UI Entry Points:**
1. No public "Request Service" form (MISSING!)
2. Reception creates complaints manually
3. Service Engineer sees assigned complaints in dashboard

**Backend APIs:**
1. `POST /api/complaints` - Create complaint
   - **Permission**: `get_current_user` (any authenticated user)
   - **No role check!** Any user can create complaint
   
2. `GET /api/complaints` - List complaints
   - **Permission**: `get_current_user`
   - **No role-based filtering!** Anyone can see all complaints
   
3. `GET /api/complaints/my-complaints` - Service Engineer specific
   - **Permission**: Requires role = SERVICE_ENGINEER
   - **Filters**: By assigned_engineer_id
   
4. `POST /api/bookings` - Create booking
   - **Permission**: `get_current_user`
   - Separate table, separate workflow!

**Database Tables:**
1. `complaints` table
   - Fields: ticket_no, customer_name, phone, machine_model, fault_description, status, assigned_to, sla_time
   
2. `bookings` table
   - Fields: booking_id, customer_id, service_type, machine_model, preferred_date, urgency, status
   
**PROBLEM**: Two tables for SAME business intent!

---

#### **Problems Identified**

**Duplication:**
- **Complaints** and **Bookings** both handle service requests
- Different status enums: Complaint (Assigned/On the way/Completed/Delayed) vs Booking (Pending/Confirmed/Completed)
- SLA tracking only in Complaints, not Bookings

**Inconsistency:**
- No public form for customers to request service
- Service Engineer dashboard uses `complaints`, ignores `bookings`
- No unified service request reporting

**Security / RBAC Risk:**
- **CRITICAL**: `GET /api/complaints` has NO role-based filtering
  - Salesman, Customer, Office Staff can call this API and see ALL complaints (security breach!)
- **CRITICAL**: `GET /api/bookings` also has no filtering
- Service Engineer can potentially update complaints not assigned to them

**Workflow Gaps:**
- No auto-assignment of service requests to engineers
- No SLA calculation logic
- No customer notification on engineer assignment

---

#### **Standardized Flow (Role-Aware)**

**Frontend:**
- **New Component**: `ServiceRequestForm.jsx`
  - Route: `/service-request`
  - Available to: Customer (public), Reception (internal), Admin
  - If customer logged in: Auto-fill from MIF records (machine list)
  - Urgency selector: Normal/Urgent/Emergency

**Backend:**
- **New Unified API**: `POST /api/service-requests`
  - Customer: Can create for own machines
  - Reception/Admin: Can create for any customer
  - Auto-calculate SLA based on urgency
  - Auto-assign to available engineer (workload balancing)
  
- **Enhanced GET**: `GET /api/service-requests`
  - Admin/Reception: ALL requests
  - Service Engineer: ONLY assigned (backend enforced!)
  - Customer: ONLY own requests (backend enforced!)
  - Office Staff/Salesman: Forbidden

**Database:**
- **New Table**: `service_requests` (unified)
  - Merges complaints + bookings data
  - Comprehensive SLA tracking
  - Customer rating/feedback support

**Migration Plan:**
1. Create `service_requests` table
2. Migrate data from `complaints` → `service_requests`
3. Migrate data from `bookings` → `service_requests`
4. Update Service Engineer dashboard to use new API
5. Drop old `complaints` and `bookings` tables

**Role Permissions (Preserved):**
```
Admin:
  - View: ALL service requests
  - Create: For any customer
  - Update: ALL (assign engineer, override SLA, cancel)
  - Delete: ALL

Reception:
  - View: ALL service requests
  - Create: For any customer (walk-in, phone)
  - Update: Assign engineer, update status
  - Delete: No

Service Engineer:
  - View: ONLY assigned requests (backend enforced)
  - Create: No
  - Update: ONLY assigned requests (status, resolution notes)
  - Delete: No

Customer:
  - View: ONLY own requests (backend enforced)
  - Create: For own machines
  - Update: No (can only add feedback/rating after completion)
  - Delete: No (can cancel = status update)
```

---

#### **Refactoring Actions**

**Phase 1: Create New Unified System**
1. ✅ Create `service_requests` table migration
2. ✅ Create `backend/routers/service_requests.py` with RBAC
3. ✅ Create `ServiceRequestForm.jsx` component
4. ✅ Add SLA calculation logic
5. ✅ Add auto-assignment algorithm

**Phase 2: Data Migration**
1. ✅ Script: Migrate `complaints` → `service_requests`
2. ✅ Script: Migrate `bookings` → `service_requests`
3. ✅ Test data integrity

**Phase 3: Update Dashboards**
1. ✅ Service Engineer dashboard: Use `/api/service-requests` (filtered)
2. ✅ Reception dashboard: Use `/api/service-requests` (all)
3. ✅ Customer portal: Show service request history

**Phase 4: Remove Old Systems**
1. ❌ DROP TABLE `complaints`
2. ❌ DROP TABLE `bookings`
3. ❌ DELETE `backend/routers/complaints.py`
4. ❌ DELETE `backend/routers/bookings.py`

**Files to Remove:**
- ❌ `backend/routers/complaints.py`
- ❌ `backend/routers/bookings.py`

**Files to Create:**
- ✅ `backend/routers/service_requests.py`
- ✅ `frontend/src/components/ServiceRequestForm.jsx`

**Files to Update:**
- ✅ `frontend/src/components/ServiceEngineerDashboard.jsx`
- ✅ `frontend/src/components/ReceptionDashboard.jsx`
- ✅ `backend/models.py` - Add ServiceRequest model

---

#### **Priority**
**Phase 1: HIGH - Security issue must be fixed**  
**Phase 2-4: MEDIUM - Can be done incrementally**

---

### 🎯 INTENT #3: Product Management (Duplicate Routers)

#### **Roles Involved**
- **Admin**: Full CRUD on products, including internal data (cost, vendor, stock)
- **Office Staff**: Add/edit products, view/update internal data
- **Reception/Salesman/Service Engineer**: View products (public data only)
- **Customer**: View products (public data only)

---

#### **Current Implementation**

**UI Entry Points:**
1. `AddProduct.jsx` (Route: `/products/add`)
   - **Who can access**: Admin, Office Staff (via ProtectedRoute)
   - **Sections**: 9-section comprehensive form
   - **Permission check**: Uses `GET /api/products/permissions/check`
   - **Internal data**: Visible only to Admin/Office Staff

2. Product listing/viewing (public)

**Backend APIs:**

**⚠️ CRITICAL ISSUE: DUPLICATE ROUTERS**

1. **Old Router**: `backend/routers/products.py`
   - Endpoint: `POST /api/products/`
   - Permission: `require_permission("manage_products")`
   - Schema: Old `ProductCreate`
   
2. **New Router**: `backend/routers/product_management.py`
   - Endpoint: `POST /api/products/` (SAME PREFIX!)
   - Permission: Role-based (checks role_permissions table)
   - Schema: Enhanced `ProductCreate` with internal data

**Problem**: Both routers registered in `main.py`, last one wins!

**Database:**
- `products` table (enhanced with new columns)
- `product_images` table (multiple images)
- `product_internal` table (confidential data)
- `role_permissions` table (permission codes)

---

#### **Problems Identified**

**Duplication:**
- **TWO product routers** with same `/api/products` prefix
- Router collision: Only one endpoint is active at runtime
- Old router bypasses new permission system

**Inconsistency:**
- Old products created without warranty, AMC, internal data
- Different permission models: old uses `manage_products`, new uses role-based

**Security / RBAC Risk:**
- If old router loads first, new RBAC is bypassed!
- Products created via old endpoint missing critical business fields
- Internal pricing data may leak if permission check fails

---

#### **Standardized Flow (Role-Aware)**

**Solution: REMOVE OLD ROUTER COMPLETELY**

**Backend:**
- **ONLY**: `backend/routers/product_management.py`
- All endpoints with proper RBAC:
  - POST `/api/products/` - Create (Admin/Office Staff)
  - PUT `/api/products/{id}` - Update (Admin/Office Staff)
  - DELETE `/api/products/{id}` - Delete (Admin only)
  - GET `/api/products/` - List (Public)
  - GET `/api/products/{id}` - Detail (Public)
  - GET `/api/products/{id}/internal` - Internal data (Admin/Office Staff only)
  - POST `/api/products/{id}/images` - Upload images (Admin/Office Staff)
  - GET `/api/products/permissions/check` - User permissions

**Frontend:**
- **ONLY**: `AddProduct.jsx` (comprehensive form)
- Permission-aware UI:
  - Internal data section visible only if user has `VIEW_INTERNAL_DATA` permission
  - Delete button visible only to Admin
  - Stock update visible only to Admin/Office Staff

**Role Permissions (Preserved):**
```
Admin:
  - View: ALL products + internal data (cost, vendor, stock)
  - Create: Yes (full form including internal data)
  - Update: Yes (all fields)
  - Delete: Yes

Office Staff:
  - View: ALL products + internal data
  - Create: Yes (full form including internal data)
  - Update: Yes (all fields)
  - Delete: No

Reception/Salesman/Service Engineer:
  - View: Products (public data: name, price, description, specs)
  - Create: No
  - Update: No
  - Delete: No
  - Internal data: Hidden

Customer:
  - View: Products (public data only)
  - Create: No
  - Update: No
  - Delete: No
  - Internal data: Hidden
```

---

#### **Refactoring Actions**

**Phase 1: Remove Duplicate Router (IMMEDIATE)**
1. ✅ Edit `backend/main.py`:
   ```python
   # REMOVE this line:
   # app.include_router(products.router)
   
   # KEEP only:
   app.include_router(product_management.router)
   ```

2. ✅ DELETE file: `backend/routers/products.py`

3. ✅ Verify: Test product creation via `/api/products/` to ensure new router is active

**Phase 2: Data Validation**
1. ✅ Run query to check products missing new fields (warranty, AMC, etc.)
2. ✅ Backfill data for existing products

**Phase 3: Frontend Cleanup**
1. ✅ Ensure all product forms use `AddProduct.jsx`
2. ✅ Remove any references to old product creation flows

**Files to Remove:**
- ❌ `backend/routers/products.py` (IMMEDIATE)

**Files to Update:**
- ✅ `backend/main.py` (remove old router registration)

---

#### **Priority**
**Phase 1: CRITICAL - IMMEDIATE ACTION REQUIRED**  
Router collision can cause unpredictable behavior in production.

---

### 🎯 INTENT #4: Notification / Alert / Reminder System

#### **Roles Involved**
- **Admin**: Receive ALL notifications (SLA, AMC, follow-ups, system)
- **Office Staff**: Receive stock alerts, product-related notifications
- **Reception**: Receive enquiry notifications, AMC expiry reminders
- **Salesman**: Receive assigned enquiry follow-up reminders
- **Service Engineer**: Receive SLA warnings, assigned complaint notifications
- **Customer**: Receive AMC expiry, service completion notifications

---

#### **Current Implementation**

**UI Entry Points:**
1. Header bell icon (NotificationContext)
   - Shows unread count
   - Dropdown panel with recent notifications
   
2. Admin dashboard "Reminders" section
   - Shows AMC expiry, Service due

**Backend:**

**⚠️ FRAGMENTATION: 4 SEPARATE SYSTEMS**

1. **Notifications Table** (`models.Notification`)
   - For: In-app notifications
   - API: `POST /api/notifications`
   - Display: Bell icon dropdown
   
2. **Reminders Table** (`models.Reminder`)
   - For: AMC expiry, Service due, Follow-ups
   - API: None (scheduler-driven)
   - Display: Admin dashboard table
   
3. **ReminderSchedule Table** (`models.ReminderSchedule`)
   - For: Recurring reminder scheduling
   - API: None (background job)
   
4. **SLA Warnings** (in Complaint model)
   - Fields: `sla_warning_sent`, `sla_breach_notified`
   - For: Service SLA tracking
   - Display: Service Engineer dashboard

**Database:**
- 4 separate tables for notifications!

---

#### **Problems Identified**

**Duplication:**
- 4 different systems for "notify user about X"
- Overlapping functionality (Reminders vs ReminderSchedule)
- SLA warnings should be notifications, not complaint fields

**Inconsistency:**
- No unified notification center
- Notifications appear in different places based on type
- No notification history (can't see dismissed notifications)

**Security / RBAC Risk:**
- No role-based notification filtering
- Salesman might see admin-only notifications if not filtered
- No audit trail of who received which notification

**User Experience:**
- Users miss important alerts (scattered across dashboards)
- No user preferences (can't turn off certain notification types)
- No notification priority sorting

---

#### **Standardized Flow (Role-Aware)**

**Backend:**
- **Unified Table**: `notifications` (enhanced)
  - Supports: In-app, Email, SMS, WhatsApp channels
  - Supports: One-time and recurring notifications
  - Supports: Role-based and user-based targeting
  - Supports: Priority levels (LOW, NORMAL, HIGH, URGENT)

- **Notification Service**: `services/notification_service.py`
  - Centralized notification creation
  - Multi-channel delivery
  - Scheduling logic
  - Role filtering

**Frontend:**
- **Unified NotificationCenter**: Enhanced bell icon
  - Shows role-appropriate notifications
  - Filter by module, priority
  - Mark as read/dismiss
  - Click to navigate to related record

**Role Permissions (Different notification types per role):**
```
Admin:
  - Receives: ALL notification types
    - SLA warnings (all engineers)
    - AMC expiry (all customers)
    - Stock alerts
    - Enquiry assignments
    - System notifications
  - Can: Dismiss, mark read, view history

Office Staff:
  - Receives:
    - Stock alerts (low inventory)
    - Product-related notifications
    - System notifications (affecting their work)
  - Can: Dismiss, mark read, view history

Reception:
  - Receives:
    - New enquiry notifications
    - AMC expiry reminders (to call customers)
    - Customer complaint notifications
  - Can: Dismiss, mark read, view history

Salesman:
  - Receives:
    - Assigned enquiry notifications
    - Follow-up reminders (only for assigned enquiries)
    - HOT enquiry alerts (assigned to them)
  - Cannot see: Other salesmen's notifications

Service Engineer:
  - Receives:
    - Assigned complaint notifications
    - SLA warnings (only for assigned complaints)
    - Customer feedback requests
  - Cannot see: Other engineers' notifications

Customer:
  - Receives:
    - AMC expiry notifications
    - Service completion notifications
    - Enquiry status updates
  - Cannot see: Internal notifications
```

---

#### **Refactoring Actions**

**Phase 1: Enhance Notifications Table**
1. ✅ Migration: Add channels, schedule_type, role, priority fields
2. ✅ Backfill existing notifications

**Phase 2: Create Notification Service**
1. ✅ Create `backend/services/notification_service.py`
2. ✅ Implement role-based filtering
3. ✅ Implement multi-channel delivery (start with in-app)

**Phase 3: Migrate Existing Systems**
1. ✅ Migrate `reminders` data to `notifications`
2. ✅ Migrate `reminder_schedules` to recurring notifications
3. ✅ Replace SLA warning flags with notification creation

**Phase 4: Update All Notification Creators**
1. ✅ Replace direct DB inserts with `notification_service.send()`
2. ✅ Update scheduler to use notification service
3. ✅ Update API endpoints

**Phase 5: Enhanced Frontend**
1. ✅ Update NotificationCenter component
2. ✅ Add role-based filtering
3. ✅ Add notification history page

**Phase 6: Cleanup**
1. ❌ DROP TABLE `reminders`
2. ❌ DROP TABLE `reminder_schedules`
3. ✅ Remove SLA flag fields from `complaints`/`service_requests`

**Files to Create:**
- ✅ `backend/services/notification_service.py`
- ✅ `frontend/src/components/NotificationCenter.jsx` (enhanced)

**Files to Update:**
- ✅ `backend/models.py` - Enhance Notification model
- ✅ `backend/scheduler.py` - Use notification service
- ✅ `frontend/src/components/Header.jsx` - Updated bell icon

**Files to Remove:**
- None (tables dropped after migration)

---

#### **Priority**
**Phase 1-2: HIGH - Foundational improvement**  
**Phase 3-6: MEDIUM - Incremental migration**

---

### 🎯 INTENT #5: User Authentication & Session Management

#### **Roles Involved**
- ALL roles need secure authentication
- Each role has different post-login redirect

---

#### **Current Implementation**

**Frontend:**
- `AuthContext.jsx`: Manages user state, localStorage
- `Login.jsx`: Login form with role-based redirect
- `ProtectedRoute.jsx`: Role checking wrapper

**Backend:**
- `auth.py`: JWT token creation, password hashing
- `POST /api/auth/login`: Returns token + user object

**Current Flow:**
1. User logs in → Get JWT token
2. Token stored in localStorage
3. Token sent in Authorization header for API calls
4. ProtectedRoute checks role for page access

---

#### **Problems Identified**

**Security Gaps:**
- **No token refresh**: Token expires after 24h, hard logout
- **No session tracking**: Same user can login from unlimited devices
- **No activity timeout**: User stays logged in forever if tab open
- **No audit trail**: Can't track login history, suspicious activity
- **No IP validation**: Token can be used from any location

**UX Issues:**
- Sudden logout without warning
- No "Remember Me" option
- No "Forgot Password" flow
- Can't logout from other devices

**RBAC Issues:**
- Login redirects hardcoded per role (maintenance nightmare)
- No centralized role-route mapping

---

#### **Standardized Flow (Role-Aware)**

**Backend:**
- **New Table**: `user_sessions`
  - Tracks: session_token, refresh_token, device_info, IP, last_activity
  - Supports: Multi-device management
  - SLA: Auto-expire after inactivity

- **Enhanced Endpoints**:
  - POST `/api/auth/login` - Returns access + refresh tokens
  - POST `/api/auth/refresh` - Get new access token
  - POST `/api/auth/logout` - Invalidate session
  - GET `/api/auth/sessions` - List user's active sessions
  - DELETE `/api/auth/sessions/{id}` - Logout from specific device

**Frontend:**
- **Enhanced AuthContext**:
  - Auto-refresh token before expiry
  - Activity timeout detection (30 min warning, 35 min logout)
  - Session restoration on page reload

**Role-Specific Features:**
```
All Roles:
  - Auto token refresh
  - Activity timeout
  - Multi-device session management
  - Login audit logging

Admin Only:
  - View all active sessions (all users)
  - Force logout users
  - View login audit trail (all users)

Individual Users:
  - View own sessions
  - Logout from specific devices
  - View own login history
```

---

#### **Refactoring Actions**

**Phase 1: Session Table**
1. ✅ Create `user_sessions` table
2. ✅ Update login to create session record
3. ✅ Add session cleanup job (delete expired)

**Phase 2: Token Refresh**
1. ✅ Add `POST /api/auth/refresh` endpoint
2. ✅ Update AuthContext with auto-refresh logic
3. ✅ Add refresh token rotation

**Phase 3: Activity Timeout**
1. ✅ Add activity tracking in AuthContext
2. ✅ Show warning modal at 30 min idle
3. ✅ Auto-logout at 35 min idle

**Phase 4: Session Management UI**
1. ✅ Add "Active Sessions" page
2. ✅ Add "Logout All Devices" button
3. ✅ Add device info display (browser, OS)

**Files to Create:**
- ✅ `frontend/src/components/SessionManagement.jsx`

**Files to Update:**
- ✅ `backend/auth.py` - Add session management
- ✅ `backend/routers/auth_routes.py` - New endpoints
- ✅ `frontend/src/contexts/AuthContext.jsx` - Auto-refresh logic
- ✅ `backend/models.py` - Add UserSession model

---

#### **Priority**
**Phase 1-2: HIGH - Security improvement**  
**Phase 3-4: MEDIUM - UX enhancement**

---

### 🎯 INTENT #6: Dashboard Role Routing

#### **Roles Involved**
- ALL roles have dashboards
- Each role has different route pattern (inconsistent)

---

#### **Current Implementation**

**Route Inconsistencies:**
- Admin: `/admin` → Admin.jsx AND `/admin/dashboard` → AdminDashboard.jsx (DUPLICATE!)
- Office Staff: `/office-staff` → OfficeStaff.jsx AND `/office-staff/dashboard` → OfficeStaffDashboard.jsx (DUPLICATE!)
- Reception: `/reception` → Receipt.jsx AND `/reception/dashboard` → ReceptionDashboard.jsx (DUPLICATE!)
- Salesman: `/employee/salesman` → SalesService.jsx AND `/salesman/dashboard` → SalesmanDashboard.jsx (DUPLICATE!)
- Service Engineer: `/employee/service-engineer` → ServiceEngineerDashboard.jsx
- Customer: `/customer` → Customer.jsx

**Login Redirect Logic (Hardcoded in Login.jsx):**
```jsx
if (role === 'admin') navigate('/admin')
if (role === 'reception') navigate('/reception/dashboard')
if (role === 'salesman') navigate('/employee/salesman')
// ... etc
```

---

#### **Problems Identified**

**Duplication:**
- **Multiple dashboard components per role** (Admin.jsx vs AdminDashboard.jsx)
- Same dashboard rendered at 2 different routes

**Inconsistency:**
- No URL pattern consistency
- `/admin` vs `/reception/dashboard` vs `/employee/salesman`

**Maintenance:**
- Hardcoded navigation in 10+ files
- Changing one route = update many files
- No single source of truth

**RBAC:**
- No dynamic routing (can't add roles without code changes)

---

#### **Standardized Flow (Role-Aware)**

**Solution: Unified Dashboard Routing**

**Step 1: Role-Route Config** (`utils/roleRoutes.js`)
```javascript
export const ROLE_ROUTES = {
  admin: '/dashboard/admin',
  office_staff: '/dashboard/office-staff',
  reception: '/dashboard/reception',
  salesman: '/dashboard/salesman',
  service_engineer: '/dashboard/service-engineer',
  customer: '/dashboard/customer'
}

export const getDashboardRoute = (role) => {
  return ROLE_ROUTES[role] || '/dashboard'
}
```

**Step 2: Unified Dashboard Component**
```jsx
// components/Dashboard.jsx
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
  
  const DashboardComponent = dashboards[user.role]
  return <DashboardComponent />
}
```

**Step 3: App Routes**
```jsx
<Routes>
  <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  
  {/* Legacy redirects */}
  <Route path="/admin" element={<Navigate to="/dashboard/admin" />} />
  <Route path="/reception" element={<Navigate to="/dashboard/reception" />} />
</Routes>
```

**Role-Specific Access:**
```
All roles access: /dashboard
Frontend renders role-appropriate dashboard component
No permission bypass possible (ProtectedRoute wrapper)
```

---

#### **Refactoring Actions**

**Phase 1: Create Role Routes Config**
1. ✅ Create `frontend/src/utils/roleRoutes.js`
2. ✅ Export ROLE_ROUTES mapping

**Phase 2: Merge Duplicate Dashboards**
1. ✅ Keep AdminDashboard.jsx, delete Admin.jsx
2. ✅ Keep ReceptionDashboard.jsx, delete Receipt.jsx
3. ✅ Keep OfficeStaffDashboard.jsx, delete OfficeStaff.jsx
4. ✅ Keep SalesmanDashboard.jsx, delete SalesService.jsx
5. ✅ Rename Customer.jsx → CustomerDashboard.jsx

**Phase 3: Create Unified Dashboard**
1. ✅ Create `components/Dashboard.jsx` wrapper
2. ✅ Move dashboard components to `components/dashboards/` folder

**Phase 4: Update Routes**
1. ✅ Replace individual routes with `/dashboard/*`
2. ✅ Add legacy redirects
3. ✅ Update Login.jsx to use `getDashboardRoute()`

**Phase 5: Global Search & Replace**
1. ✅ Find all `navigate('/admin')` → Replace with `navigate(getDashboardRoute('admin'))`
2. ✅ Find all hardcoded role routes → Replace with helper

**Files to Remove:**
- ❌ `frontend/src/components/Admin.jsx`
- ❌ `frontend/src/components/Receipt.jsx`
- ❌ `frontend/src/components/OfficeStaff.jsx`
- ❌ `frontend/src/components/SalesService.jsx`

**Files to Create:**
- ✅ `frontend/src/utils/roleRoutes.js`
- ✅ `frontend/src/components/Dashboard.jsx`

**Files to Update:**
- ✅ `frontend/src/App.jsx` - Simplified routes
- ✅ `frontend/src/components/Login.jsx` - Use helper
- ✅ `frontend/src/components/Header.jsx` - Use helper

---

#### **Priority**
**Phase 1-4: MEDIUM - Code quality improvement**  
**Phase 5: LOW - Incremental cleanup**

---

### 🎯 INTENT #7: Product Actions (View / Enquire / Call)

#### **Roles Involved**
- **All roles + public**: View products, enquire
- **Customer**: Additional wishlist, compare features (future)

---

#### **Current Implementation**

**ProductDetail Page Buttons:**
1. "📞 Enquire Now" → Navigates to `/enquiry/:productId`
2. "📱 Call Us" → `tel:+911234567890` (hardcoded!)

**Problems:**
- Too many action buttons (user confusion)
- Hardcoded phone number (should be branch-based)
- No analytics tracking
- No "Share" or "Request Demo" options (common B2B needs)

---

#### **Standardized Flow (Role-Aware)**

**Primary CTA:**
- "Get Quote" button → Opens unified contact form

**Secondary CTAs (Dropdown):**
- Request Call Back
- Email Brochure
- Schedule Demo
- WhatsApp Us
- Share Product
- EMI Calculator (if price exists)

**Role-Specific Actions:**
```
All Users (Including Public):
  - Get Quote (opens contact form)
  - Call (shows branch selector if multiple locations)
  - Share product

Logged-in Customer Only:
  - Add to Wishlist
  - Compare Products
  - View purchase history

Admin/Office Staff Only:
  - Edit Product (quick link from detail page)
  - View Internal Data (cost, vendor)
  - Update Stock
```

---

#### **Refactoring Actions**

**Phase 1: Unified Product Actions Component**
1. ✅ Create `ProductActions.jsx` reusable component
2. ✅ Implement primary CTA + dropdown menu
3. ✅ Add analytics tracking (Google Analytics events)

**Phase 2: Update Product Pages**
1. ✅ Replace hardcoded buttons in ProductDetail.jsx
2. ✅ Replace buttons in ProductListing.jsx
3. ✅ Replace buttons in Home.jsx featured products

**Phase 3: Implement Secondary Actions**
1. ✅ "Request Call Back" → Creates enquiry with type="callback"
2. ✅ "Email Brochure" → Sends product PDF to user email
3. ✅ "Share" → Native share API + social media links

**Files to Create:**
- ✅ `frontend/src/components/ProductActions.jsx`

**Files to Update:**
- ✅ `frontend/src/components/ProductDetail.jsx`
- ✅ `frontend/src/components/ProductListing.jsx`
- ✅ `frontend/src/components/Home.jsx`

---

#### **Priority**
**Phase 1-2: LOW - UX enhancement**  
**Phase 3: LOW - Feature addition**

---

## 📊 STEP 6: CONSOLIDATED PRIORITY MATRIX

### 🔴 CRITICAL (Do Before ANY Production Use)

1. **INTENT #3: Remove Duplicate Product Router**
   - **Risk**: Router collision, unpredictable behavior
   - **Action**: Delete `backend/routers/products.py` IMMEDIATELY
   - **Effort**: 5 minutes
   - **Impact**: Prevents production failures

2. **INTENT #1: Fix Enquiry RBAC Security**
   - **Risk**: Salesman can view ALL enquiries, not just assigned
   - **Action**: Add backend role-based filtering to GET endpoint
   - **Effort**: 30 minutes
   - **Impact**: Prevents data breach

3. **INTENT #2: Fix Service Request RBAC Security**
   - **Risk**: Any user can view ALL complaints/bookings
   - **Action**: Add backend role-based filtering
   - **Effort**: 1 hour
   - **Impact**: Prevents data breach

4. **PUBLIC PORTAL: Implement UI Mode Switching**
   - **Risk**: ERP features exposed to public users, poor UX
   - **Action**: Add `uiMode` state, conditional header/sidebar rendering
   - **Effort**: 2 hours
5. **INTENT #2: Unify Service Request System**
   - **Risk**: Data fragmentation, reporting gaps
   - **Action**: Merge complaints + bookings into service_requests
   - **Effort**: 1 week (with migration)
   - **Impact**: Unified workflow, better SLA tracking

6. **INTENT #1: Unify Enquiry System**
   - **Risk**: Lost leads, inconsistent UX
   - **Action**: Merge Contact + EnquiryForm into ContactEnquiryForm (public-facing)
   - **Effort**: 2 days
   - **Impact**: Better lead capture, consistent UX, supports public customer enquiries

7. **INTENT #5: Add Session Management**
   - **Risk**: Security gaps, poor UX
   - **Action**: Add user_sessions table, token refresh
   - **Effort**: 3 days
   - **Impact**: Secure authentication, better UX

8. **PUBLIC PORTAL: Customer Identity & OTP Verification**
   - **Risk**: Duplicate customer records, no verification
   - **Action**: Phone uniqueness validation, OTP system for status tracking
   - **Effort**: 3 days
   - **Impact**: Better customer data quality, secure status trackingUX

6. **INTENT #5: Add Session Management**
   - **Risk**: Security gaps, poor UX
   - **Action**: Add user_sessions table, token refresh
   - **Effort**: 3 days
9. **INTENT #6: Standardize Dashboard Routing**
   - **Risk**: Maintenance overhead, URL inconsistency
   - **Action**: Unified dashboard routing with `getDashboardRoute()` helper
   - **Effort**: 2 days
   - **Impact**: Cleaner codebase, easier maintenance, supports public/internal mode switching

10. **INTENT #4: Unify Notification System**
   - **Risk**: Scattered notifications, missed alerts
   - **Action**: Merge 4 notification systems into one (staff-only, no public notifications)
   - **Effort**: 1 week
   - **Impact**: Better user awareness, unified UX

11. **PUBLIC PORTAL: Create Services Page**
   - **Risk**: Missing public-facing service information
   - **Action**: Create Services.jsx with Installation, AMC, Repair offerings
   - **Effort**: 1 day
   - **Impact**: Better customer awareness of service offeringsnce

8. **INTENT #4: Unify Notification System**
   - **Risk**: Scattered notifications, missed alerts
   - **Action**: Merge 4 notification systems into one
   - **Effort**: 1 week
12. **INTENT #7: Unified Product Actions**
   - **Risk**: Minor UX confusion
   - **Action**: Standardize product CTAs (public-facing)
   - **Effort**: 1 day
   - **Impact**: Cleaner UI, better analytics

13. **PUBLIC PORTAL: Blog/Articles System**
   - **Risk**: No content marketing presence
   - **Action**: Create Blog.jsx with article management (Admin creates, public views)
   - **Effort**: 3 days
   - **Impact**: SEO, customer engagement, thought leadership

14. **PUBLIC PORTAL: Customer Self-Service Status Tracking**
   - **Risk**: Customers call reception for status updates
   - **Action**: Phone + OTP verification for enquiry/service status tracking
   - **Effort**: 2 days
   - **Impact**: Reduced reception workload, better customer experience

9. **INTENT #7: Unified Product Actions**
   - **Risk**: Minor UX confusion
   - **Action**: Standardize product CTAs

# 4. Implement UI mode switching (2 hours)
# Add uiMode state to AuthContext
# Create PublicNav and StaffNav components
# Add conditional rendering to Header.jsx and App.jsx
   - **Effort**: 1 day
   - **Impact**: Cleaner UI, better analytics

---

## 🎯 FINAL RECOMMENDATIONSEnquiryForm - public-facing)
- Add session management (user_sessions table)
- Customer identity enhancement (phone uniqueness, OTP verification
### Immediate Actions (This Week)
```bash (with getDashboardRoute helper)
- Unify notification system (staff-only)
- Create Services page (public-facing)
- Enhance product actions (public CTAs)ct router (5 min)
rm backend/routers/products.py
# Edit backend/main.py: Remove products.router line

# 2. Fix enquiry RBAC (30 min)
# Edit backend/routers/enquiries.py: Add role-based filtering

# 3. Fix service request RBAC (1 hour)
# Edit backend/routers/complaints.py and bookings.py: Add filtering
```

### Sprint 1 (Next 2 Weeks)
- Unify service request system (complaints + bookings merge)
- Blog/Articles system
- Customer self-service status tracking (Phone + OTP)
- Email verification for customers
- WhatsApp integration for notifications
- AI chatbot for customer supporter_sessions table)

### Sprint 2 (Weeks 3-4)
- Standardize dashboard routing
- Unify notification system

### Post-Launch
- Unified product actions
- Additional UX enhancements

---

- ✅ Clear public/internal access separation
- ✅ No customer login = reduced attack surface
- ✅ Staff-only ERP access with multi-layer permission checks
## ✅ BENEFITS SUMMARY

### Security Improvements
- ✅ Fixed RBAC gaps (enquiry, service request filtering)
- ✅ Added session tracking and audit trail
- ✅ Removed router collision risk

- ✅ Zero-friction customer enquiries (no login required)
- ✅ Clear public website vs internal ERP separation
- ✅ Role-based UI mode switching for staff
### Code Qualityzero-friction public enquiries)
- ✅ Improved SLA tracking (unified service requests)
- ✅ Better analytics and reporting
- ✅ Higher conversion rates (no signup barrier)
- ✅ Reduced support overhead (no customer password management)
- ✅ Scalable for future AI, CRM, WhatsApp integrationsh intent
- ✅ Easier maintenance and testing

### User Experience
- ✅ Consistent workflows across system
- ✅ Better notification management
- ✅ Cleaner, predictable navigation

### Business Impact
- ✅ Better lead capture (unified enquiry)
- ✅ Improved SLA tracking (unified service requests)
- ✅ Better analytics and reporting

---

**Document Status**: Production-Ready  
**Review Status**: Pending Team Review  
**Implementation**: Ready to Start

**Next Step**: Prioritize critical security fixes before any production deployment.
