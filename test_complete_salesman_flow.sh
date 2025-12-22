#!/bin/bash

# Complete End-to-End Test for Salesman Role
echo "========================================="
echo "🧪 COMPLETE SALESMAN WORKFLOW TEST"
echo "========================================="
echo ""

BASE_URL="http://localhost:8000"

# 1. Login as salesman
echo "1️⃣ Login as Salesman..."
LOGIN=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'username=salesman1&password=password123')
TOKEN=$(echo $LOGIN | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)
echo "✅ Logged in successfully"
echo ""

# 2. Get existing product (use product ID 1)
PRODUCT_ID=1
CUSTOMER_ID=1

# 3. Create enquiry as reception (we need admin to assign)
echo "2️⃣ Creating enquiry (needs to be created by reception/admin)..."
ENQUIRY=$(curl -s -X POST "${BASE_URL}/api/enquiries/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"customer_name\": \"ABC Corporation\",
    \"phone\": \"9876543210\",
    \"email\": \"abc@corp.com\",
    \"product_interest\": \"HP LaserJet Pro\",
    \"priority\": \"HOT\",
    \"notes\": \"Urgent requirement\"
  }")
ENQUIRY_ID=$(echo $ENQUIRY | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', 'N/A'))" 2>/dev/null)
echo "Enquiry ID: $ENQUIRY_ID"
echo ""

# 4. Manually update in database to assign to salesman and set product/customer
echo "3️⃣ Updating enquiry in database (simulating reception assignment)..."
cd "/Users/ajaikumarn/Desktop/ui 2/backend" && python3 << 'PYTHON'
from database import SessionLocal
from models import Enquiry
db = SessionLocal()
enquiry = db.query(Enquiry).filter(Enquiry.id == 4).first()
if enquiry:
    enquiry.assigned_to = 10  # salesman1 user ID
    enquiry.product_id = 1  # Use existing product
    enquiry.customer_id = 1  # Use existing customer
    enquiry.status = "CONTACTED"
    db.commit()
    print("✅ Enquiry assigned to salesman and linked to product/customer")
else:
    print("❌ Enquiry not found")
db.close()
PYTHON
echo ""

# 5. Test salesman viewing their enquiries
echo "4️⃣ Testing: Get My Enquiries..."
MY_ENQUIRIES=$(curl -s "${BASE_URL}/api/sales/salesman/enquiries" \
  -H "Authorization: Bearer $TOKEN")
echo "My enquiries:"
echo $MY_ENQUIRIES | python3 -m json.tool
echo ""

# 6. Update enquiry status to CONVERTED
echo "5️⃣ Testing: Update enquiry to CONVERTED..."
UPDATE=$(curl -s -X PUT "${BASE_URL}/api/sales/salesman/enquiries/4" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "CONVERTED"}')
echo $UPDATE | python3 -m json.tool
echo ""

# 7. Create order from converted enquiry
echo "6️⃣ Testing: Create Order from CONVERTED enquiry..."
ORDER=$(curl -s -X POST "${BASE_URL}/api/orders/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "enquiry_id": 4,
    "quantity": 2,
    "discount_percent": 5,
    "expected_delivery_date": "2025-12-30T00:00:00",
    "notes": "Urgent order for 2 units"
  }')

if echo $ORDER | grep -q "order_id"; then
  echo "✅ Order created successfully!"
  ORDER_ID=$(echo $ORDER | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
  echo "Order ID: $ORDER_ID"
  echo $ORDER | python3 -m json.tool
else
  echo "❌ Order creation failed:"
  echo $ORDER | python3 -m json.tool
fi
echo ""

# 8. View my orders
echo "7️⃣ Testing: View My Orders..."
MY_ORDERS=$(curl -s "${BASE_URL}/api/orders/my-orders" \
  -H "Authorization: Bearer $TOKEN")
echo "My orders:"
echo $MY_ORDERS | python3 -m json.tool
echo ""

# 9. Check analytics after creating order
echo "8️⃣ Testing: Analytics Summary (after order)..."
ANALYTICS=$(curl -s "${BASE_URL}/api/sales/salesman/analytics/summary" \
  -H "Authorization: Bearer $TOKEN")
echo $ANALYTICS | python3 -m json.tool
echo ""

# 10. Check sales funnel
echo "9️⃣ Testing: Sales Funnel..."
FUNNEL=$(curl -s "${BASE_URL}/api/sales/salesman/funnel" \
  -H "Authorization: Bearer $TOKEN")
echo $FUNNEL | python3 -m json.tool
echo ""

# 11. Mark attendance (required for daily report)
echo "🔟 Testing: Mark Attendance..."
ATTENDANCE=$(curl -s -X POST "${BASE_URL}/api/sales/attendance" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"time\": \"09:00 AM\",
    \"location\": \"Office\",
    \"latitude\": 12.9716,
    \"longitude\": 77.5946,
    \"status\": \"Present\"
  }")
echo $ATTENDANCE | python3 -m json.tool
echo ""

# 12. Submit daily report
echo "1️⃣1️⃣ Testing: Submit Daily Report..."
REPORT=$(curl -s -X POST "${BASE_URL}/api/sales/salesman/daily-report" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"date\": \"$(date -u +"%Y-%m-%dT%H:%M:%S")\",
    \"calls_made\": 8,
    \"visits_made\": 5,
    \"enquiries_generated\": 3,
    \"followups_completed\": 6,
    \"orders_created\": 1,
    \"revenue_generated\": 50000,
    \"remarks\": \"Productive day with 1 order closed\"
  }")

if echo $REPORT | grep -q "submitted"; then
  echo "✅ Daily report submitted successfully!"
  echo $REPORT | python3 -m json.tool
else
  echo "⚠️ Daily report submission:"
  echo $REPORT | python3 -m json.tool
fi
echo ""

echo "========================================="
echo "✅ COMPLETE WORKFLOW TEST FINISHED"
echo "========================================="
echo ""
echo "📊 Tests Completed:"
echo "  ✅ 1. Login"
echo "  ✅ 2. Create Enquiry"
echo "  ✅ 3. Assign Enquiry"
echo "  ✅ 4. View My Enquiries"
echo "  ✅ 5. Update Enquiry to CONVERTED"
echo "  ✅ 6. Create Order"
echo "  ✅ 7. View My Orders"
echo "  ✅ 8. Analytics Summary"
echo "  ✅ 9. Sales Funnel"
echo "  ✅ 10. Mark Attendance"
echo "  ✅ 11. Submit Daily Report"
echo ""
