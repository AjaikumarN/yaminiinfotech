# 📋 QUICK REFERENCE CARD

## 🎯 NEW ERP FEATURES - Quick Access

---

### 🔥 ENQUIRY TEMPERATURE SYSTEM

**Priority Levels:**
- 🔥 **HOT** → Weekly reminders (7 days)
- 🌡️ **WARM** → Monthly reminders (30 days)
- ❄️ **COLD** → Future follow-up (90 days)

**What Happens:**
- Automatic reminders sent to assigned salesman
- Next follow-up date updated automatically
- Follow-up instructions tracked

**Component:** `EnquiryTemperatureCard.jsx`

---

### 📊 DAILY REPORT SYSTEM

**Salesman Must Submit:**
- Calls made
- Shops visited
- Enquiries generated
- Sales closed
- Daily notes

**Deadline:** 7:00 PM daily

**Accountability:**
- Missing report → Reception notified at 7:01 PM
- Full history tracked
- Compliance metrics available

**Component:** `DailyReportForm.jsx`  
**Widget:** `MissingReportsWidget.jsx`

---

### ⚠️ SLA WARNING SYSTEM

**Alert Levels:**
- **2 hours before:** ⚠️ Warning (Yellow)
- **After breach:** 🚨 Critical (Red)

**Notifications Sent To:**
- Admin
- Office Staff
- Assigned Engineer

**Auto Actions:**
- Status changes to "Delayed"
- Alerts until resolved

**Component:** `SLAWarningDashboard.jsx`

---

### 📅 AMC REMINDER SYSTEM

**Schedule:** 1st of every month, 9:00 AM

**Reminder Timeline:**
- 30 days before expiry → First reminder
- 15 days before → Second reminder
- 7 days before → Urgent (HIGH priority)
- 1 day before → Critical (CRITICAL priority)

**Notifications To:**
- Reception
- Office Staff

---

### 📝 AUDIT LOGGING

**What's Logged:**
- User login/logout
- CREATE/UPDATE/DELETE operations
- MIF access (with IP address)
- All critical changes

**Access:**
- Admin only for full logs
- Office Staff can view
- Complete change history

---

## 🚀 AUTOMATED SCHEDULER

**Jobs Running 24/7:**

| Job | Frequency | Time | Action |
|-----|-----------|------|--------|
| Enquiry Follow-ups | Hourly | :00 | Send reminders |
| Daily Reports | Daily | 7 PM | Check submissions |
| SLA Monitoring | Hourly | :30 | Check warnings |
| AMC Alerts | Monthly | 1st, 9 AM | Send reminders |

---

## 🔗 API ENDPOINTS

### Daily Reports
```
POST   /api/reports/daily              # Submit report
GET    /api/reports/daily/my-reports   # View my reports
GET    /api/reports/daily/all          # All reports (Admin)
GET    /api/reports/daily/missing      # Missing today (Reception)
GET    /api/reports/daily/stats        # Statistics
```

### Audit Logs
```
GET    /api/audit/logs                    # Get logs
GET    /api/audit/logs/record/{module}/{id}  # Record history
GET    /api/audit/stats                   # Statistics (Admin)
```

### Enquiries (Enhanced)
```
PATCH  /api/enquiries/{id}  # Update with priority, instruction_notes
```

---

## 💻 COMPONENT USAGE

### DailyReportForm
```jsx
import DailyReportForm from './components/DailyReportForm';
<DailyReportForm />
```

### EnquiryTemperatureCard
```jsx
import EnquiryTemperatureCard from './components/EnquiryTemperatureCard';
<EnquiryTemperatureCard 
  enquiry={enquiry} 
  onUpdate={refreshEnquiries} 
/>
```

### MissingReportsWidget
```jsx
import MissingReportsWidget from './components/MissingReportsWidget';
<MissingReportsWidget />
```

### SLAWarningDashboard
```jsx
import SLAWarningDashboard from './components/SLAWarningDashboard';
<SLAWarningDashboard />
```

---

## 🔒 ACCESS CONTROL

| Feature | Admin | Reception | Salesman | Engineer | Office | Customer |
|---------|-------|-----------|----------|----------|--------|----------|
| Daily Reports - Submit | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Daily Reports - View All | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Missing Reports | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Enquiry Temperature | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| SLA Dashboard | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| AMC Reminders | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Audit Logs | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |

---

## 🛠️ TROUBLESHOOTING

### Backend Not Running
```bash
cd backend
python3 -m uvicorn main:app --reload --port 8000 &
```

### Check Scheduler Status
```bash
tail -f backend/backend.log | grep "Scheduler"
# Should show: ✅ Scheduler started - Automated reminders active!
```

### Test Health
```bash
curl http://127.0.0.1:8000/api/health
# Expected: {"status":"ok"}
```

### Re-run Migration
```bash
cd backend
python3 migrate_db.py
```

---

## 📊 DATABASE TABLES

**New Tables:**
- `daily_reports` - Salesman report tracking
- `audit_logs` - Activity logging
- `service_engineer_hierarchy` - Engineer management
- `reminder_schedules` - Reminder tracking

**Enhanced Tables:**
- `enquiries` - Added reminder fields
- `complaints` - Added SLA tracking
- `mif_records` - Added AMC reminder date
- `shop_visits` - Added detailed fields
- `notifications` - Added read status

---

## 📞 SUPPORT CONTACTS

**Technical Issues:**
- Check logs: `tail -f backend/backend.log`
- Database: Re-run migration if needed
- API: Use `/docs` for Swagger UI

**Feature Questions:**
- See IMPLEMENTATION_PLAN.md for details
- See FINAL_SUMMARY.md for overview
- See TESTING_GUIDE.md for test scenarios

---

## ✅ DAILY CHECKLIST

**Morning (9 AM):**
- [ ] Check SLA dashboard for overnight issues
- [ ] Review missing reports from yesterday
- [ ] Check new enquiries and assign temperatures

**During Day:**
- [ ] Monitor SLA warnings as they come
- [ ] Update enquiry temperatures as needed
- [ ] Follow up on HOT enquiries

**Evening (7 PM):**
- [ ] Salesmen submit daily reports
- [ ] Reception checks missing reports widget
- [ ] Review day's activities

**Monthly (1st, 9 AM):**
- [ ] AMC reminders automatically sent
- [ ] Review expiring contracts
- [ ] Plan renewal calls

---

## 🎯 KEY METRICS TO TRACK

- **Enquiry Conversion Rate:** HOT vs WARM vs COLD success
- **Report Compliance:** % of salesmen submitting on time
- **SLA Performance:** % of services within SLA
- **AMC Renewals:** % renewed before expiry
- **Follow-up Success:** Conversions from reminders

---

**System Version:** 2.0.0  
**Last Updated:** December 21, 2025  
**Status:** ✅ ACTIVE & MONITORING

---

**Print this card and keep it handy!** 📋
