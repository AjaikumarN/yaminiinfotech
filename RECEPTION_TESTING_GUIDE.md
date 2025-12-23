# Reception Dashboard - Quick Test Guide

## 🚀 Quick Start

### 1. Start Backend
```bash
cd backend
uvicorn main:app --reload --port 8000
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Login as Reception
- URL: http://localhost:5173/login
- Use Reception role credentials
- Navigate to: `/reception/dashboard`

## ✅ Testing Checklist

### Section 1: Enquiry Board
- [ ] See 3 enquiries in HOT/WARM/COLD columns
- [ ] Change priority from dropdown (e.g., WARM → HOT)
- [ ] Assign enquiry to salesman from dropdown
- [ ] Click enquiry card to navigate to details

**API Endpoints Used:**
- `GET /api/enquiries/` - Fetch all enquiries
- `PUT /api/enquiries/{id}` - Update priority/assignment

### Section 2: Today's Calls & Target
- [ ] See existing calls in table
- [ ] Progress bar shows X/40 calls
- [ ] Click "Log Call" button
- [ ] Fill form: Customer Name, Phone, Type, Outcome, Notes
- [ ] Submit and verify call appears in table
- [ ] Verify progress bar updates

**API Endpoints Used:**
- `GET /api/sales/calls?today=true` - Fetch today's calls
- `POST /api/sales/calls` - Log new call

### Section 3: Pending Service Complaints
- [ ] See complaints with ticket numbers
- [ ] Check SLA Due time calculations
- [ ] Verify color coding:
  - Green: >2 hours remaining
  - Yellow: <2 hours remaining  
  - Red: Overdue
- [ ] Click "View" to see complaint details

**API Endpoints Used:**
- `GET /api/complaints/` - Fetch service complaints

### Section 4: Repeat Complaint Alert
- [ ] Shows complaints for same customer+machine
- [ ] Displays repeat count
- [ ] Lists previous complaint dates
- [ ] No interaction needed (auto-calculated)

**Logic:** Derived from complaints table, no API call

### Section 5: Delivery IN/OUT Log
- [ ] See stock movements with IN/OUT types
- [ ] Status shows Pending (yellow) or Approved (green)
- [ ] Click "Add Delivery" button
- [ ] Fill form: Type (IN/OUT), Item Name, Quantity, Reference
- [ ] Submit and verify entry appears
- [ ] Verify status = "Pending" (only Admin can approve)

**API Endpoints Used:**
- `GET /api/stock-movements?today=true` - Fetch today's deliveries
- `POST /api/stock-movements` - Log new delivery

### Section 6: Outstanding Summary
- [ ] See customer outstanding balances
- [ ] Total outstanding amount displayed
- [ ] Read-only (no interactions)

**API Endpoints Used:**
- `GET /api/invoices?status=unpaid` - Fetch outstanding invoices (placeholder)

### Section 7: Missing Reports
- [ ] Shows salesmen who haven't submitted today
- [ ] Displays their names
- [ ] Read-only (no interactions)

**Logic:** Check daily_reports table vs active salesmen (placeholder)

### Section 8: Visitor Log
- [ ] See today's visitors
- [ ] IN Time and OUT Time columns
- [ ] Active visitors have no OUT Time
- [ ] Click "Add Visitor" button
- [ ] Fill form: Name, Phone, Purpose, Whom to Meet, IN Time
- [ ] Submit and verify visitor appears
- [ ] Click "Check Out" for an active visitor
- [ ] Verify OUT Time updates

**API Endpoints Used:**
- `GET /api/visitors?today=true` - Fetch today's visitors
- `POST /api/visitors` - Add new visitor
- `PUT /api/visitors/{id}/checkout` - Check out visitor

## 🔐 Permission Testing

### Reception SHOULD Be Able To:
- [x] View all enquiries
- [x] Change enquiry priority
- [x] Assign enquiries to salesmen
- [x] Log sales calls
- [x] View service complaints
- [x] Log visitors (add/check-out)
- [x] Log deliveries (IN/OUT)

### Reception SHOULD NOT Be Able To:
- [ ] Approve stock movements (Admin only)
  - **Test**: Try `PUT /api/stock-movements/1/approve`
  - **Expected**: 403 Forbidden

- [ ] Delete visitors (Admin only)
  - **Test**: Try `DELETE /api/visitors/1`
  - **Expected**: 403 Forbidden

- [ ] Delete stock movements (Admin only)
  - **Test**: Try `DELETE /api/stock-movements/1`
  - **Expected**: 403 Forbidden

## 📊 KPI Metrics Verification

### Check Top Metrics Bar
- [ ] **HOT Enquiries**: Count matches HOT column count
- [ ] **Calls Today**: Count matches table rows
- [ ] **Pending Service**: Count matches service table rows  
- [ ] **Outstanding**: Sum matches invoice balances

## 🔄 Auto-Refresh Testing

- [ ] Wait 60 seconds without interaction
- [ ] Verify all sections refresh automatically
- [ ] Check console for "Refreshing dashboard data..."
- [ ] Manually click "Refresh" button
- [ ] Verify immediate data reload

## 🎨 UI/UX Verification

### Layout
- [ ] 8 sections arranged in grid
- [ ] Mobile responsive (resize browser)
- [ ] Scrollable sections with max-height
- [ ] KPI strip always visible at top

### Modals
- [ ] Call Log modal opens/closes correctly
- [ ] Visitor Entry modal opens/closes correctly
- [ ] Delivery Entry modal opens/closes correctly
- [ ] Form validation works (required fields)
- [ ] Submit button shows loading state

### Styling
- [ ] Color coding consistent (green/yellow/red)
- [ ] Hover effects on cards
- [ ] Button states (hover, disabled)
- [ ] Tables have proper spacing

## 🐛 Common Issues & Solutions

### Issue: "API call failed"
**Solution**: Verify backend is running on port 8000
```bash
curl http://localhost:8000/api/health
```

### Issue: "403 Forbidden"
**Solution**: Login with Reception role credentials

### Issue: "401 Unauthorized"
**Solution**: Token expired, re-login

### Issue: "No data showing"
**Solution**: Run seed script:
```bash
cd backend
python3 seed_reception_data.py
```

### Issue: "Import error" in backend
**Solution**: Check routers use absolute imports (not relative `..`)

## 📝 Test Data Summary

**Default Seed Data:**
- 3 Enquiries (HOT/WARM/COLD)
- 5 Sales Calls (today)
- 2 Service Complaints (1 pending, 1 assigned)
- 3 Visitors (2 in, 1 checked out)
- 3 Stock Movements (2 pending, 1 approved)

## 🎯 Success Criteria

✅ All 8 sections display data correctly  
✅ All modals open and submit successfully  
✅ All API endpoints respond correctly  
✅ Permission enforcement working (403 for restricted actions)  
✅ Auto-refresh works every 60 seconds  
✅ KPI metrics calculate correctly  
✅ No console errors  
✅ Responsive design works on mobile  

## 📞 API Endpoints Reference

| Section | Method | Endpoint | Permission |
|---------|--------|----------|------------|
| Enquiries | GET | `/api/enquiries/` | Reception, Admin |
| Enquiries | PUT | `/api/enquiries/{id}` | Reception, Admin |
| Calls | GET | `/api/sales/calls?today=true` | Reception, Admin |
| Calls | POST | `/api/sales/calls` | Reception, Admin |
| Complaints | GET | `/api/complaints/` | Reception, Admin |
| Visitors | GET | `/api/visitors?today=true` | Reception, Admin |
| Visitors | POST | `/api/visitors` | Reception, Admin |
| Visitors | PUT | `/api/visitors/{id}/checkout` | Reception, Admin |
| Stock | GET | `/api/stock-movements?today=true` | Reception, Admin |
| Stock | POST | `/api/stock-movements` | Reception, Admin |
| Stock | PUT | `/api/stock-movements/{id}/approve` | Admin ONLY |

## 🏁 Final Verification

Before deployment:
- [ ] All 8 sections tested individually
- [ ] All modals tested
- [ ] All API endpoints tested
- [ ] Permission restrictions verified
- [ ] Auto-refresh verified
- [ ] Mobile responsiveness verified
- [ ] No console errors
- [ ] Seed data created
- [ ] Documentation reviewed

---

**Happy Testing!** 🎉

If you encounter any issues, check:
1. Backend server running (port 8000)
2. Frontend dev server running (port 5173)
3. Logged in as Reception role
4. Seed data exists in database
5. Browser console for errors
