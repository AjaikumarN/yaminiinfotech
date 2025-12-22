# 🌐 PUBLIC CUSTOMER PORTAL & 🔐 INTERNAL STAFF ACCESS MODEL

## Design Principle

The main website is built primarily for **CUSTOMERS** and **PUBLIC USERS**.  
Internal staff access the ERP only via a secure login.

This ensures:
- ✅ Clean customer UX
- ✅ No accidental exposure of ERP features
- ✅ Strong security boundaries
- ✅ Industry-standard ERP + website separation (single domain)

---

## 🌐 PUBLIC WEBSITE SCOPE (No Login Required)

### Accessible to Everyone:

| Route | Description |
|-------|-------------|
| `/` | Home (Landing page) |
| `/products` | Product catalog |
| `/products/:id` | Product details |
| `/services` | Services offered |
| `/contact` | Contact + Enquiry form |
| `/about` | About us |
| `/blog` | Articles & updates |
| `/enquiry/:productId` | Product enquiry form |

### Capabilities:
- ✅ View products & services
- ✅ Submit enquiries / quote requests
- ✅ Request service
- ✅ Contact the company
- ✅ Read blogs

### 📌 Important Notes:
- **Customers do NOT need to create accounts or log in**
- Customer identity is captured automatically via:
  - Enquiry form
  - Service request form
  - Phone / Email / Address

---

## 🔐 INTERNAL STAFF LOGIN

### Header Design (Public View)
```
--------------------------------------------------
LOGO   Products   Services   Contact   Blog   🔐 Staff Login
--------------------------------------------------
```

### Login Route
- **Path:** `/login`
- **Purpose:** Internal staff access only
- **Note:** Customers should NOT use this login

### Who Uses Login?
- ✅ Admin
- ✅ Reception
- ✅ Office Staff
- ✅ Salesman
- ✅ Service Engineer
- ❌ Customers

---

## 🔁 POST-LOGIN ROLE-BASED REDIRECTION

After successful authentication, users are redirected based on role:

| Role | Redirect Route |
|------|----------------|
| Admin | `/admin/dashboard` |
| Office Staff | `/office/dashboard` |
| Reception | `/reception/dashboard` |
| Salesman | `/salesman/dashboard` |
| Service Engineer | `/engineer/dashboard` |

### Implementation
Uses centralized helper function:
```javascript
import { getDashboardRoute } from '../utils/dashboardRoutes.js'

const redirectPath = getDashboardRoute(user.role)
```

This avoids:
- ❌ Hardcoded navigation
- ❌ Role-routing bugs
- ❌ Maintenance issues

---

## 🧱 UI MODE SWITCHING

### Before Login (Public Mode)
- ✅ Public navbar visible
- ❌ No sidebar
- ❌ No dashboards
- ❌ No notifications
- ❌ No internal routes accessible
- ✅ Shows: Search, Cart, Staff Login button

### After Login (Internal Mode)
- ❌ Public navbar hidden
- ✅ ERP sidebar enabled (staff menu)
- ✅ Notifications enabled
- ✅ Role-specific dashboard rendered
- ✅ ProtectedRoute enforced
- ✅ Shows: Notifications, User menu, Logout

---

## 🔒 ACCESS CONTROL GUARANTEES

### Customers:
- ❌ Cannot access `/dashboard/*`
- ❌ Cannot access `/admin`, `/reception`, `/employee/*`
- ❌ Cannot see internal data (MIF, pricing, stock)
- ✅ Can submit enquiries without login
- ✅ Can view products without login

### Staff:
- ❌ Cannot access public admin data without login
- ❌ Cannot access roles other than their own
- ✅ Backend enforces all RBAC (frontend only assists UX)
- ✅ All actions are logged (audit trail)

---

## 🧠 CUSTOMER IDENTITY STRATEGY (NO CUSTOMER LOGIN)

### Why No Customer Login?
1. **Low friction** - Better conversion rates
2. **Better lead capture** - Reduce abandonment
3. **Less password management** - Fewer support tickets
4. **Simpler UX** - Better for small/medium businesses

### How Customers Are Tracked
**Auto-created customer record on:**
- First enquiry submission
- First service request

**Linked via:**
- Phone number (primary identifier)
- Email address

**Status tracking via:**
- Phone + OTP (future enhancement)
- Enquiry / Ticket ID

---

## 🧩 ALIGNMENT WITH INTENT-BASED ARCHITECTURE

This model perfectly aligns with our design intents:

| Intent | Public Access | Staff Access |
|--------|---------------|--------------|
| Enquiry | Create | View / Assign / Update |
| Service Request | Create | Assign / Work / Close |
| Products | View | Manage (Admin / Office) |
| Notifications | No | Yes |
| Dashboards | No | Yes |
| MIF Records | No | Admin / Office Staff Only |

**Same data, same APIs, different access levels**

---

## ✅ BENEFITS OF THIS APPROACH

1. ✔ **Clean customer experience** - No confusion about login
2. ✔ **Secure ERP access** - Clear separation of concerns
3. ✔ **No customer confusion** - "Staff Login" is self-explanatory
4. ✔ **No RBAC leakage** - Customers can't accidentally see staff features
5. ✔ **Easy to explain to client** - Simple mental model
6. ✔ **Scales well** - Ready for AI, CRM, WhatsApp integration later

---

## 🗣️ CLIENT-FRIENDLY EXPLANATION

> "The website is public for customers to browse products and submit enquiries.  
> Our staff use a secure 'Staff Login' button from the same site to access internal ERP features.  
> Customers never need to create accounts or remember passwords."

---

## 📁 Key Files

### Frontend
- **`/src/utils/dashboardRoutes.js`** - Centralized routing logic
- **`/src/components/Login.jsx`** - Staff login component
- **`/src/components/Header.jsx`** - Public/Staff mode switching
- **`/src/contexts/AuthContext.jsx`** - Authentication & permissions
- **`/src/App.jsx`** - Route definitions

### Backend
- **`/backend/auth.py`** - Authentication logic
- **`/backend/routers/auth_routes.py`** - Login endpoints
- **`/backend/routers/enquiries.py`** - Public enquiry submission
- **`/backend/models.py`** - User roles & permissions

---

## 🎯 Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Public Product Catalog | ✅ Implemented | No login required |
| Enquiry Submission | ✅ Implemented | Auto-creates customer |
| Staff Login | ✅ Implemented | Role-based access |
| Dashboard Routing | ✅ Implemented | Centralized helper |
| UI Mode Switching | ✅ Implemented | Header adapts to auth state |
| RBAC Enforcement | ✅ Implemented | Backend + Frontend |
| Customer No-Login Flow | ✅ Implemented | Phone/email based |
| Audit Logging | ✅ Implemented | All staff actions logged |

---

## 🔮 Future Enhancements

1. **Customer Portal (Optional)**
   - OTP-based login with phone number
   - Track enquiry status
   - View service history
   - No password required

2. **WhatsApp Integration**
   - Customer enquiries via WhatsApp
   - Status updates via WhatsApp
   - OTP delivery via WhatsApp

3. **AI Chatbot**
   - Product recommendations
   - Instant enquiry creation
   - FAQ assistance

---

## 🏁 FINAL NOTE

This architecture:
- ✅ Fits naturally into the existing system
- ✅ Strengthens security decisions
- ✅ Matches real-world ERP implementations
- ✅ Provides excellent UX for both customers and staff

**You're doing this the right way.**
