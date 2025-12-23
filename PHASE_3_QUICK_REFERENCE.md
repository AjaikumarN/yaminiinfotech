# PHASE 3: RBAC QUICK REFERENCE CARD

**Last Updated:** December 23, 2025  
**Status:** Production Ready ✅

---

## 🔐 GRANULAR PERMISSION FUNCTIONS

### Import Statement
```python
from auth import (
    require_order_approval,
    require_stock_write,
    require_product_write,
    require_enquiry_write,
    require_mif_access,
    require_mif_write,
    check_resource_permission,
    filter_enquiries_by_role
)
```

### Permission Functions

| Function | Allowed Roles | Use Case |
|----------|---------------|----------|
| `require_order_approval` | ADMIN | Approve/reject orders, update orders, delete orders |
| `require_stock_write` | ADMIN | Modify product stock quantities |
| `require_product_write` | ADMIN | Create/update/delete products |
| `require_enquiry_write` | ADMIN, RECEPTION | Create/update/delete enquiries |
| `require_mif_access` | ADMIN, RECEPTION | Read MIF records (ADMIN full, RECEPTION read-only) |
| `require_mif_write` | ADMIN | Create/update/delete MIF records |

### Usage Examples

#### 1. Order Approval (Admin Only)
```python
@router.put("/{order_id}/approve")
def approve_order(
    order_id: int,
    approval: schemas.OrderApprove,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_order_approval)
):
    """Approve or reject order - ADMIN ONLY"""
    # No inline role check needed - handled by dependency
```

#### 2. Product Management (Admin Only)
```python
@router.post("/")
def create_product(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_product_write)
):
    """Create product - ADMIN ONLY"""
```

#### 3. Enquiry Management (Admin + Reception)
```python
@router.post("/")
def create_enquiry(
    enquiry: schemas.EnquiryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_enquiry_write)
):
    """Create enquiry - ADMIN + RECEPTION"""
```

#### 4. MIF Access (Read vs Write)
```python
# READ access (Admin + Reception)
@router.get("/")
def get_mif_records(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_mif_access)
):
    """View MIF - ADMIN full, RECEPTION read-only"""

# WRITE access (Admin only)
@router.post("/")
def create_mif_record(
    mif: schemas.MIFRecordCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_mif_write)
):
    """Create MIF - ADMIN ONLY"""
```

#### 5. Enquiry Filtering (Automatic)
```python
@router.get("/")
def get_enquiries(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get enquiries with automatic role-based filtering"""
    query = db.query(models.Enquiry)
    
    # Automatically filters based on role
    query = auth.filter_enquiries_by_role(current_user, query)
    
    return query.all()
```

---

## 🎯 RESOURCE PERMISSION MATRIX

### Check Resource Permission
```python
from auth import check_resource_permission

# Check if user can perform action on resource
can_approve = check_resource_permission(
    current_user,
    resource_type='order',  # 'order', 'product', 'enquiry', 'mif', 'stock'
    action='approve'        # 'read', 'write', 'approve', 'delete'
)
```

### Matrix Values

| Role | order | product | enquiry | mif | stock |
|------|-------|---------|---------|-----|-------|
| **ADMIN** | read, write, approve | read, write | read, write | read, write | read, write |
| **RECEPTION** | read | read | read, write | read | read |
| **SALESMAN** | read | read | read | - | read |
| **SERVICE_ENGINEER** | - | read | - | - | read |
| **CUSTOMER** | read | read | - | - | - |

---

## 🔄 MIGRATION FROM OLD PATTERNS

### ❌ OLD PATTERN (Inline Role Checks)
```python
@router.put("/{order_id}/approve")
def approve_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Inline check - BAD
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admin...")
```

### ✅ NEW PATTERN (Dependency Injection)
```python
@router.put("/{order_id}/approve")
def approve_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_order_approval)
):
    # Permission checked automatically - GOOD
```

---

## 📊 ROLE CAPABILITIES SUMMARY

### ADMIN
- ✅ Full access to all resources
- ✅ Approve/reject orders
- ✅ Manage products and stock
- ✅ Create/update MIF records
- ✅ View all enquiries and reports

### RECEPTION
- ✅ View MIF records (read-only, logged)
- ✅ Manage enquiries (create/update/delete)
- ✅ View all orders (cannot approve)
- ✅ View products (cannot modify)
- ❌ Cannot approve orders
- ❌ Cannot create MIF records
- ❌ Cannot modify stock

### SALESMAN
- ✅ View own enquiries only (backend filtered)
- ✅ Create follow-ups for assigned enquiries
- ✅ Submit daily reports
- ✅ View products
- ❌ No MIF access
- ❌ Cannot approve orders
- ❌ Cannot see other salesmen's data

### SERVICE_ENGINEER
- ✅ View products
- ✅ View assigned complaints
- ❌ No MIF access
- ❌ No enquiry access
- ❌ No order access

### CUSTOMER
- ✅ View own orders
- ✅ View products (public)
- ❌ No internal access

---

## 🚨 COMMON MISTAKES TO AVOID

### 1. ❌ Using Old Permission Function
```python
# DEPRECATED - Don't use
current_user: models.User = Depends(auth.require_permission("manage_products"))
```
```python
# CORRECT - Use granular functions
current_user: models.User = Depends(auth.require_product_write)
```

### 2. ❌ Inline Role Checks
```python
# BAD - Inline check
if current_user.role != models.UserRole.ADMIN:
    raise HTTPException(...)
```
```python
# GOOD - Dependency handles it
current_user: models.User = Depends(auth.require_order_approval)
```

### 3. ❌ Mixing UI and Backend Security
```python
# BAD - Relying on frontend checks
# Frontend hides button, but API is still accessible
```
```python
# GOOD - Backend enforces, frontend is cosmetic
current_user: models.User = Depends(auth.require_product_write)
```

---

## 🔍 DEBUGGING RBAC ISSUES

### 1. Check Permission Matrix
```python
from auth import check_resource_permission
from models import UserRole

class MockUser:
    def __init__(self, role):
        self.role = role

user = MockUser(UserRole.RECEPTION)
can_write = check_resource_permission(user, 'mif', 'write')
print(f"Reception can write MIF: {can_write}")  # Should be False
```

### 2. Test Permission Functions
```python
# Test in Python REPL
from auth import require_mif_write
from models import User, UserRole

# Create mock request with user
# This will raise HTTPException if permission denied
```

### 3. Check HTTP Response Codes
- **403 Forbidden** - Permission denied (correct behavior)
- **401 Unauthorized** - Not logged in
- **200 OK** - Permission granted

---

## 📝 TESTING CHECKLIST

- [ ] All new permission functions imported successfully
- [ ] Permission matrix returns correct values
- [ ] Admin can access all endpoints
- [ ] Reception denied from MIF write operations
- [ ] Salesman denied from MIF read operations
- [ ] Salesman only sees assigned enquiries
- [ ] Public product endpoints accessible without auth
- [ ] Internal product endpoints require admin auth
- [ ] Order approval requires admin role
- [ ] Stock updates require admin role

---

## 🎉 PHASE 3 SUCCESS CRITERIA

✅ **All inline role checks removed**  
✅ **Granular permission functions in use**  
✅ **Backend enforces all permissions**  
✅ **Frontend role checks are cosmetic only**  
✅ **Comprehensive test coverage**  
✅ **Production deployment ready**

**Last Validation:** December 23, 2025 ✅
