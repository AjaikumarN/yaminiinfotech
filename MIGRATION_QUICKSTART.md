# 🎯 QUICK START GUIDE - Refactored ERP System

## 🚀 Immediate Next Steps

### 1️⃣ **Backup Your Database (CRITICAL)**
```bash
# PostgreSQL
pg_dump -U postgres -h localhost erp_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup created
ls -lh backup_*.sql
```

### 2️⃣ **Run Migration Script**
```bash
cd backend
python migrate_role_consolidation.py

# The script will:
# - Ask for backup confirmation
# - Convert OFFICE_STAFF → RECEPTION
# - Merge duplicate tables
# - Verify migration success
```

### 3️⃣ **Restart Services**
```bash
# Terminal 1: Backend
cd backend
uvicorn main:app --reload --port 8000

# Terminal 2: Frontend  
cd frontend
npm run dev
```

### 4️⃣ **Test Critical Features**

**Admin Login:**
- ✓ Approve pending orders
- ✓ Update stock quantity
- ✓ Create/update MIF records
- ✓ View all dashboards

**Reception Login:**
- ✓ Create & assign enquiries
- ✓ View MIF (read-only)
- ✓ Monitor sales performance
- ❌ Cannot approve orders
- ❌ Cannot update stock
- ❌ Cannot create MIF

**Salesman Login:**
- ✓ See assigned enquiries only
- ✓ Create follow-ups
- ✓ Submit daily report
- ✓ Create orders (after conversion)
- ❌ Cannot see all enquiries
- ❌ Cannot approve orders

---

## 📊 What Changed?

### **REMOVED (Duplicates)**
- ❌ OFFICE_STAFF role → merged into RECEPTION
- ❌ daily_reports table → use sales_daily_reports
- ❌ follow_up_history table → use sales_followups
- ❌ enquiry_notes table → merged into sales_followups
- ❌ OfficeStaffDashboard.jsx → use ReceptionDashboard
- ❌ OfficeStaff.jsx → use ReceptionDashboard

### **UPDATED (Security)**
- ✅ MIF: Admin write, Reception read-only
- ✅ Orders: Admin approve only
- ✅ Stock: Admin update only
- ✅ Products: Admin manage only
- ✅ Enquiries: Salesman sees assigned only

### **STANDARDIZED (Workflows)**
- ✅ Single daily report table
- ✅ Single follow-up tracking table
- ✅ Unified permission system
- ✅ Consistent role checks

---

## 🔐 New Permission Matrix

| Action | Admin | Reception | Salesman |
|--------|-------|-----------|----------|
| Approve Orders | ✅ | ❌ | ❌ |
| Update Stock | ✅ | ❌ | ❌ |
| Create MIF | ✅ | ❌ | ❌ |
| View MIF | ✅ | ✅ (logged) | ❌ |
| Create Invoice | ✅ | ❌ | ❌ |
| View All Enquiries | ✅ | ✅ | ❌ |
| Assign Enquiries | ✅ | ✅ | ❌ |

---

## ⚠️ Important Notes

1. **OFFICE_STAFF users** will automatically become **RECEPTION** after migration
2. **Existing dashboards** for office staff will redirect to reception dashboard
3. **All data preserved** - no data loss during migration
4. **Rollback available** - can restore from backup if needed

---

## 📞 If Something Goes Wrong

**Migration Failed?**
- Database automatically rolled back
- Check error message in migration output
- Restore from backup if needed: `psql -U postgres erp_db < backup_file.sql`

**Permission Errors After Migration?**
- Check user role: `SELECT username, role FROM users;`
- Ensure no OFFICE_STAFF remains
- Verify RECEPTION users have correct permissions

**Frontend Errors?**
- Clear browser cache
- Check browser console for errors
- Verify backend is running on port 8000

---

## ✅ Success Checklist

After migration, verify:

- [ ] All OFFICE_STAFF users converted to RECEPTION
- [ ] No duplicate tables exist
- [ ] Admin can approve orders
- [ ] Reception cannot approve orders
- [ ] Reception can view MIF (read-only)
- [ ] Reception cannot create MIF
- [ ] Salesman sees only assigned enquiries
- [ ] Stock updates require admin login
- [ ] All dashboards load correctly

---

## 📚 Full Documentation

See `REFACTORING_COMPLETE.md` for:
- Complete architecture details
- API endpoint map
- Database schema
- Security enforcement rules
- Notification routing
- Business workflow validation

---

**Ready to proceed?** Backup your database and run the migration script! 🚀
