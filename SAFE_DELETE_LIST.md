# 🗑️ SAFE DELETE LIST (Manual Approval Required)

**Date:** December 28, 2025
**Project:** Yamini Infotech ERP System
**Status:** Awaiting Approval

---

## ✅ TIER 1: GUARANTEED SAFE (Can Delete Now)

### Runtime Logs (Auto-regenerated)
| File | Size | Reason | Risk |
|------|------|--------|------|
| `backend/uvicorn.out` | ~varies | Runtime log | ZERO |
| `backend/uvicorn.err` | ~varies | Error log | ZERO |
| `frontend/vite.out` | ~varies | Build log | ZERO |
| `frontend/vite.err` | ~varies | Build error log | ZERO |

**Total Impact:** Negligible  
**Regeneration:** Automatic on next run  
**Approval Status:** ✅ **PRE-APPROVED** (standard practice)

---

## ⚠️ TIER 2: LIKELY SAFE (Archive First)

### Old/Deprecated Components
| File | Replacement | Imported By | Risk |
|------|-------------|-------------|------|
| `frontend/src/admin/pages/Dashboard_old.jsx` | `Dashboard.jsx` (?) | ❓ Needs check | LOW |

**Action Required:**
1. Search for imports: `Dashboard_old`
2. If no imports → Safe to delete
3. Recommended: Archive to `/archive/old-components/`

---

## 🟡 TIER 3: ARCHIVE RECOMMENDED (Keep for Recovery)

### One-Time Scripts (May need for DB recovery/debugging)

#### Migration Scripts:
```
backend/add_complaint_fields.py
backend/migrate_admin_security.py
backend/migrate_salesman_enhancements.py
backend/run_attendance_migration.py
```
**Purpose:** Database schema updates (already applied)  
**Risk:** MEDIUM - May need to reference logic  
**Recommendation:** MOVE to `/scripts/migrations/completed/`

#### Debug/Utility Scripts:
```
backend/check_attendance.py
backend/check_service_data.py
backend/clear_attendance.py
backend/debug_password.py
backend/inspect_bcrypt.py
backend/update_service_data.py
backend/test_admin_complete.py
```
**Purpose:** Dev/testing utilities  
**Risk:** LOW-MEDIUM - Useful for debugging  
**Recommendation:** MOVE to `/scripts/utils/`

---

## 🔴 TIER 4: INVESTIGATE BEFORE ACTION

### Suspicious Files:

#### 1. `backend/package-lock.json`
```
Location: backend/package-lock.json
Type: Node.js dependency lock
Expected: Backend is Python (should not need this)
```
**Possible Reasons:**
- Frontend tool used in backend directory
- Mistake/leftover file
- Some Node-based tool integration

**Action:** Check if referenced by any script  
**If unused → DELETE**

#### 2. `backend/admin_test_results.json`
```
Type: Test output
Purpose: Likely one-time test results
```
**Action:** Check if needed for CI/CD  
**If not → MOVE to /tests/results/**

---

## 📦 TIER 5: ORGANIZE (No Deletion)

### Move to Proper Locations:

#### Backend Services (Already Good, Optional Refine):
```
backend/notification_service.py → backend/services/
backend/scheduler.py → backend/services/
backend/sla_utils.py → backend/services/
backend/audit_logger.py → backend/services/
```
**Risk:** ZERO if imports updated  
**Benefit:** Better organization

#### Init Scripts:
```
backend/init_db.py → scripts/setup/
backend/setup.sh → scripts/setup/
```

---

## 🚨 SECURITY ALERT

### High-Risk Files:
```
⚠️ LOGIN_CREDENTIALS.md
```
**Issue:** Contains sensitive credentials in root  
**Risk:** HIGH if in version control  
**Immediate Actions:**
1. Check if in `.gitignore`
2. If committed → Remove from history
3. Move to `.env` or secrets manager
4. Update references

---

## 📊 ESTIMATED SPACE SAVINGS

| Category | Files | Est. Size | Notes |
|----------|-------|-----------|-------|
| Log files | 4 | ~1-5 MB | Regenerates |
| Old components | 1 | ~50 KB | Archive first |
| Scripts (archive) | 11 | ~100 KB | Move, don't delete |
| Suspicious files | 2 | ~5 KB | Investigate |
| **Total** | **18** | **~5-10 MB** | Minimal impact |

**Note:** Major space in node_modules (200MB) and .venv (117MB) - these are REQUIRED

---

## ✅ APPROVAL CHECKLIST

Before executing any deletion:

- [ ] Verified file is not imported anywhere
- [ ] Checked git history (if needed later)
- [ ] Created archive copy if uncertain
- [ ] Updated documentation references
- [ ] Tested app after changes
- [ ] No broken imports
- [ ] Backend starts successfully
- [ ] Frontend builds successfully

---

## 🎯 RECOMMENDED FIRST ACTIONS

### Safest Operations (Do First):

1. **Delete Runtime Logs** ✅
   ```bash
   rm backend/uvicorn.out backend/uvicorn.err
   rm frontend/vite.out frontend/vite.err
   ```

2. **Create Archive Structure**
   ```bash
   mkdir -p archive/old-components
   mkdir -p scripts/{migrations,utils,setup}
   mkdir -p docs/{admin,modules,guides}
   ```

3. **Move Scripts (Safe)**
   ```bash
   mv backend/*migration*.py scripts/migrations/
   mv backend/check_*.py backend/clear_*.py backend/debug_*.py scripts/utils/
   mv backend/init_db.py backend/setup.sh scripts/setup/
   ```

4. **Organize Docs**
   ```bash
   mv ADMIN_*.md docs/admin/
   mv SERVICE_ENGINEER_*.md docs/modules/
   mv QUICK_START*.md docs/guides/
   ```

---

## 🚦 STATUS TRACKING

- [x] Analysis Complete
- [x] Plan Created
- [ ] Tier 1 Approved (log files)
- [ ] Tier 2 Verified (old components)
- [ ] Tier 3 Moved (scripts)
- [ ] Tier 4 Investigated (suspicious files)
- [ ] Tier 5 Reorganized (docs)
- [ ] Verification Tests Passed
- [ ] Final Documentation Updated

---

**Awaiting Your Approval to Proceed** ✋
