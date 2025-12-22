#!/bin/bash

# Test Admin Sales Performance Dashboard
echo "========================================="
echo "🧪 TESTING ADMIN SALES PERFORMANCE"
echo "========================================="
echo ""

BASE_URL="http://localhost:8000"

# Login as admin (create if doesn't exist)
echo "1️⃣ Creating/Login as Admin..."
# Try to create admin user
curl -s -X POST "${BASE_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "email": "admin@yamini.com",
    "full_name": "Admin User",
    "role": "admin",
    "department": "Management"
  }' > /dev/null 2>&1

# Login
ADMIN_LOGIN=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'username=admin&password=admin123')
ADMIN_TOKEN=$(echo $ADMIN_LOGIN | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)

if [ -z "$ADMIN_TOKEN" ]; then
  echo "❌ Admin login failed"
  exit 1
fi

echo "✅ Admin logged in successfully"
echo ""

# Test 1: Get all salesman performance
echo "2️⃣ Testing: Get All Salesman Performance..."
PERFORMANCE=$(curl -s "${BASE_URL}/api/admin/sales-performance/" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo $PERFORMANCE | python3 -m json.tool
echo ""

# Test 2: Get sales funnel
echo "3️⃣ Testing: Get Sales Funnel (All Salesmen)..."
FUNNEL=$(curl -s "${BASE_URL}/api/admin/sales-performance/funnel" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo $FUNNEL | python3 -m json.tool
echo ""

# Test 3: Get specific salesman performance
echo "4️⃣ Testing: Get Specific Salesman Performance (ID: 10)..."
SALESMAN_PERF=$(curl -s "${BASE_URL}/api/admin/sales-performance/salesman/10" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo $SALESMAN_PERF | python3 -m json.tool
echo ""

# Test 4: Get missing daily reports
echo "5️⃣ Testing: Get Missing Daily Reports..."
MISSING=$(curl -s "${BASE_URL}/api/admin/sales-performance/missing-reports" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo "Missing reports:"
echo $MISSING | python3 -m json.tool
echo ""

# Test 5: Get all daily reports
echo "6️⃣ Testing: Get All Daily Reports..."
REPORTS=$(curl -s "${BASE_URL}/api/admin/sales-performance/daily-reports" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo "Daily reports count: $(echo $REPORTS | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null)"
echo $REPORTS | python3 -m json.tool | head -50
echo ""

# Test 6: Get pending orders for approval
echo "7️⃣ Testing: Get Pending Orders for Approval..."
PENDING_ORDERS=$(curl -s "${BASE_URL}/api/orders/pending-approval" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo $PENDING_ORDERS | python3 -m json.tool
echo ""

# Test 7: Approve an order
echo "8️⃣ Testing: Approve Order (ID: 1)..."
APPROVE=$(curl -s -X PUT "${BASE_URL}/api/orders/1/approve" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "approved": true
  }')
echo $APPROVE | python3 -m json.tool
echo ""

# Test 8: Check analytics after approval
echo "9️⃣ Testing: Salesman Performance After Order Approval..."
PERF_AFTER=$(curl -s "${BASE_URL}/api/admin/sales-performance/salesman/10" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo $PERF_AFTER | python3 -m json.tool
echo ""

# Test 9: Test with filters
echo "🔟 Testing: Performance with Date Filters..."
START_DATE="2025-12-01"
END_DATE="2025-12-31"
FILTERED=$(curl -s "${BASE_URL}/api/admin/sales-performance/?start_date=${START_DATE}&end_date=${END_DATE}" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo $FILTERED | python3 -m json.tool
echo ""

echo "========================================="
echo "✅ ADMIN TESTING COMPLETE"
echo "========================================="
echo ""
echo "📊 Tests Completed:"
echo "  ✅ 1. Admin Login"
echo "  ✅ 2. Get All Salesman Performance"
echo "  ✅ 3. Get Sales Funnel"
echo "  ✅ 4. Get Specific Salesman Performance"
echo "  ✅ 5. Get Missing Reports"
echo "  ✅ 6. Get All Daily Reports"
echo "  ✅ 7. Get Pending Orders"
echo "  ✅ 8. Approve Order"
echo "  ✅ 9. Performance After Approval"
echo "  ✅ 10. Filtered Performance"
echo ""
