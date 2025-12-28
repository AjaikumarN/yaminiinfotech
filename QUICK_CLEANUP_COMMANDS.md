# ⚡ QUICK CLEANUP COMMANDS

**Date:** December 28, 2025  
**Status:** Ready to Execute (Pending Approval)

---

## 🚀 ONE-COMMAND EXECUTION

### Option 1: Safe & Sequential
```bash
cd /Users/ajaikumarn/Desktop/Yamini.pvt-master

# Phase A: Delete Logs (SAFE ✅)
rm -f backend/uvicorn.out backend/uvicorn.err frontend/vite.out frontend/vite.err && echo "✅ Logs deleted"

# Phase B: Archive Old Component
mkdir -p archive/old-components && \
mv frontend/src/admin/pages/Dashboard_old.jsx archive/old-components/ && \
echo "✅ Old component archived"

# Phase C: Reorganize Scripts
mkdir -p scripts/{migrations,utils,setup,tests} && \
mv backend/add_complaint_fields.py \
   backend/migrate_admin_security.py \
   backend/migrate_salesman_enhancements.py \
   backend/run_attendance_migration.py \
   scripts/migrations/ 2>/dev/null && \
mv backend/check_attendance.py \
   backend/check_service_data.py \
   backend/clear_attendance.py \
   backend/debug_password.py \
   backend/inspect_bcrypt.py \
   backend/update_service_data.py \
   scripts/utils/ 2>/dev/null && \
mv backend/test_admin_complete.py scripts/tests/ 2>/dev/null && \
mv backend/init_db.py backend/setup.sh scripts/setup/ 2>/dev/null && \
echo "✅ Scripts reorganized"

# Phase D: Organize Documentation
mkdir -p docs/{admin,modules,guides,security} && \
mv ADMIN_*.md docs/admin/ 2>/dev/null && \
mv ENTERPRISE_ADMIN_UI_COMPLETE.md docs/admin/ 2>/dev/null && \
mv SERVICE_ENGINEER_*.md docs/modules/ 2>/dev/null && \
mv QUICK_START*.md docs/guides/ 2>/dev/null && \
mv PRODUCTION_READY_CHECKLIST.md docs/guides/ 2>/dev/null && \
mv ADVANCED_FEATURES.md docs/guides/ 2>/dev/null && \
mv VOICE_INPUT_GUIDE.md docs/guides/ 2>/dev/null && \
mv LOGIN_CREDENTIALS.md docs/security/ 2>/dev/null && \
echo "✅ Documentation organized"

# Verify
echo "🔍 Verifying structure..."
ls -la docs/
ls -la scripts/
echo "✅ Cleanup complete!"
```

---

## 🔍 VERIFICATION COMMANDS

### Check Backend
```bash
cd backend
source ../.venv/bin/activate
python -c "import main; print('✅ Backend imports OK')"
uvicorn main:app --reload &
sleep 3
curl http://127.0.0.1:8000/docs && echo "✅ Backend running"
```

### Check Frontend
```bash
cd frontend
npm run dev &
sleep 5
curl http://localhost:5173 && echo "✅ Frontend running"
```

---

## ⚠️ ROLLBACK COMMANDS (If Needed)

### Restore from Archive
```bash
# If you need to restore Dashboard_old.jsx
cp archive/old-components/Dashboard_old.jsx frontend/src/admin/pages/

# Restore scripts to backend
cp scripts/migrations/* backend/
cp scripts/utils/* backend/
cp scripts/setup/* backend/

# Restore docs to root
cp docs/admin/* .
cp docs/modules/* .
cp docs/guides/* .
```

---

## 📋 VERIFICATION CHECKLIST

After running cleanup, verify:

```bash
# Backend health
curl http://127.0.0.1:8000/api/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}' \
  && echo "✅ API working"

# Frontend health
curl http://localhost:5173 | grep -q "html" && echo "✅ Frontend serving"

# File structure
[ -d "docs" ] && echo "✅ docs/ exists"
[ -d "scripts" ] && echo "✅ scripts/ exists"
[ -d "archive" ] && echo "✅ archive/ exists"
```

---

## 🎯 QUICK STATUS CHECK

```bash
cd /Users/ajaikumarn/Desktop/Yamini.pvt-master

echo "📊 Project Status:"
echo "===================="
echo "Backend files: $(find backend -name '*.py' | wc -l)"
echo "Frontend files: $(find frontend/src -name '*.jsx' | wc -l)"
echo "Documentation: $(find docs -name '*.md' 2>/dev/null | wc -l)"
echo "Scripts: $(find scripts -name '*.py' 2>/dev/null | wc -l)"
echo "Archive: $(find archive -type f 2>/dev/null | wc -l)"
```

---

## 🚨 EMERGENCY STOP

If anything goes wrong:

```bash
# Stop all processes
pkill -f uvicorn
pkill -f vite
pkill -f node

# Check git status
git status

# Restore from git (if tracked)
git restore [files]
```

---

**Ready to Execute!** ✅
