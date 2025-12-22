#!/bin/bash

echo "=========================================="
echo "🧪 ERP NEW FEATURES - TESTING SUITE"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Helper functions
print_test() {
    echo "📝 Testing: $1"
}

print_success() {
    echo -e "${GREEN}✅ PASSED${NC}: $1"
    ((PASSED++))
}

print_error() {
    echo -e "${RED}❌ FAILED${NC}: $1"
    ((FAILED++))
}

print_info() {
    echo -e "${YELLOW}ℹ️  INFO${NC}: $1"
}

echo "1️⃣ TESTING BACKEND HEALTH"
echo "-------------------------------------------"
print_test "Backend health endpoint"
HEALTH=$(curl -s http://127.0.0.1:8000/api/health)
if [ "$HEALTH" = '{"status":"ok"}' ]; then
    print_success "Backend is healthy"
else
    print_error "Backend health check failed"
    exit 1
fi
echo ""

echo "2️⃣ TESTING AUTHENTICATION"
echo "-------------------------------------------"
print_test "Admin login"
LOGIN_RESPONSE=$(curl -s -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)

if [ ! -z "$TOKEN" ]; then
    print_success "Login successful - Token obtained"
    print_info "Token: ${TOKEN:0:20}..."
else
    print_error "Login failed - Cannot proceed with tests"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi
echo ""

echo "3️⃣ TESTING DAILY REPORTS API"
echo "-------------------------------------------"

print_test "Check missing daily reports"
MISSING=$(curl -s http://127.0.0.1:8000/api/reports/daily/missing \
  -H "Authorization: Bearer $TOKEN")
echo "$MISSING" | python3 -m json.tool
if echo "$MISSING" | grep -q "missing_count"; then
    print_success "Missing reports endpoint working"
else
    print_error "Missing reports endpoint failed"
fi
echo ""

print_test "Get daily report statistics"
STATS=$(curl -s http://127.0.0.1:8000/api/reports/daily/stats \
  -H "Authorization: Bearer $TOKEN")
echo "$STATS" | python3 -m json.tool
if echo "$STATS" | grep -q "total_reports_submitted"; then
    print_success "Report statistics endpoint working"
else
    print_error "Report statistics endpoint failed"
fi
echo ""

echo "4️⃣ TESTING ENQUIRIES API (ENHANCED)"
echo "-------------------------------------------"

print_test "Get all enquiries"
ENQUIRIES=$(curl -s http://127.0.0.1:8000/api/enquiries \
  -H "Authorization: Bearer $TOKEN")
ENQUIRY_COUNT=$(echo "$ENQUIRIES" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
print_info "Found $ENQUIRY_COUNT enquiries"

if [ "$ENQUIRY_COUNT" -gt 0 ]; then
    print_success "Enquiries endpoint working"
    echo ""
    print_info "Sample enquiry data:"
    echo "$ENQUIRIES" | python3 -m json.tool | head -30
else
    print_error "No enquiries found or endpoint failed"
fi
echo ""

echo "5️⃣ TESTING AUDIT LOGS API"
echo "-------------------------------------------"

print_test "Get recent audit logs"
AUDIT=$(curl -s http://127.0.0.1:8000/api/audit/logs?limit=5 \
  -H "Authorization: Bearer $TOKEN")
if echo "$AUDIT" | grep -q "\[\]" || echo "$AUDIT" | grep -q "id"; then
    print_success "Audit logs endpoint working"
    echo "$AUDIT" | python3 -m json.tool
else
    print_error "Audit logs endpoint failed"
fi
echo ""

print_test "Get audit statistics"
AUDIT_STATS=$(curl -s http://127.0.0.1:8000/api/audit/stats \
  -H "Authorization: Bearer $TOKEN")
if echo "$AUDIT_STATS" | grep -q "total_logs"; then
    print_success "Audit statistics endpoint working"
    echo "$AUDIT_STATS" | python3 -m json.tool
else
    print_error "Audit statistics endpoint failed"
fi
echo ""

echo "6️⃣ TESTING COMPLAINTS API (SLA FEATURES)"
echo "-------------------------------------------"

print_test "Get all complaints"
COMPLAINTS=$(curl -s http://127.0.0.1:8000/api/complaints \
  -H "Authorization: Bearer $TOKEN")
COMPLAINT_COUNT=$(echo "$COMPLAINTS" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
print_info "Found $COMPLAINT_COUNT complaints"

if [ "$COMPLAINT_COUNT" -gt 0 ]; then
    print_success "Complaints endpoint working"
    echo ""
    print_info "Sample complaint with SLA tracking:"
    echo "$COMPLAINTS" | python3 -m json.tool | head -30
else
    print_info "No complaints found (this is okay for testing)"
fi
echo ""

echo "7️⃣ TESTING DATABASE TABLES"
echo "-------------------------------------------"

print_test "Check new database tables"
psql -U postgres -d yamini_db -c "\dt" 2>/dev/null | grep -E "(daily_reports|audit_logs|service_engineer|reminder_schedules)" && print_success "New tables exist" || print_error "New tables missing"
echo ""

echo "8️⃣ TESTING SCHEDULER STATUS"
echo "-------------------------------------------"

print_test "Check scheduler logs"
if [ -f "backend.log" ]; then
    if grep -q "Scheduler started" backend.log; then
        print_success "Scheduler started successfully"
        echo ""
        print_info "Recent scheduler activity:"
        tail -10 backend.log | grep -E "(Scheduler|Reminder|SLA|Report|AMC)" || echo "No recent scheduler activity (system just started)"
    else
        print_error "Scheduler not found in logs"
    fi
else
    print_error "backend.log not found"
fi
echo ""

echo "=========================================="
echo "📊 TEST SUMMARY"
echo "=========================================="
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo "Your ERP system is working perfectly!"
else
    echo -e "${YELLOW}⚠️  Some tests failed${NC}"
    echo "Check the output above for details"
fi
echo ""

echo "=========================================="
echo "🔍 SYSTEM INFORMATION"
echo "=========================================="
echo "Backend URL: http://127.0.0.1:8000"
echo "Frontend URL: http://localhost:5173"
echo "API Docs: http://127.0.0.1:8000/docs"
echo ""
echo "New Features Endpoints:"
echo "  - Daily Reports: /api/reports/daily/*"
echo "  - Audit Logs: /api/audit/*"
echo "  - Enhanced Enquiries: /api/enquiries (with priority field)"
echo ""
echo "Frontend Components Created:"
echo "  - DailyReportForm.jsx"
echo "  - EnquiryTemperatureCard.jsx"
echo "  - MissingReportsWidget.jsx"
echo "  - SLAWarningDashboard.jsx"
echo ""
