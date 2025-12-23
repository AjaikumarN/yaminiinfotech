#!/bin/bash

# Reception Dashboard - Frontend/Backend Integration Test
# This script tests all API endpoints used by ReceptionDashboardNew component

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  RECEPTION DASHBOARD - INTEGRATION TEST                  ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Get token
echo "🔑 Getting authentication token..."
TOKEN=$(curl -s -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=reception&password=reception123" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get authentication token"
  exit 1
fi

echo "✅ Token obtained"
echo ""

# Test counters
PASSED=0
FAILED=0

# Helper function to test endpoint
test_endpoint() {
  local NAME=$1
  local METHOD=$2
  local URL=$3
  local DATA=$4
  
  echo "Testing: $NAME"
  
  if [ -z "$DATA" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" -X $METHOD "$URL" -H "Authorization: Bearer $TOKEN")
  else
    RESPONSE=$(curl -s -w "\n%{http_code}" -X $METHOD "$URL" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$DATA")
  fi
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  
  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo "  ✅ Status: $HTTP_CODE"
    PASSED=$((PASSED + 1))
  else
    echo "  ❌ Status: $HTTP_CODE"
    echo "  Response: $BODY"
    FAILED=$((FAILED + 1))
  fi
  echo ""
}

echo "═══════════════════════════════════════════════════════════"
echo "SECTION 1: DATA FETCHING (GET REQUESTS)"
echo "═══════════════════════════════════════════════════════════"
echo ""

test_endpoint "1. Get Enquiries" "GET" "http://localhost:8000/api/enquiries/"
test_endpoint "2. Get Complaints" "GET" "http://localhost:8000/api/complaints/"
test_endpoint "3. Get Salesmen" "GET" "http://localhost:8000/api/users/salesmen/"
test_endpoint "4. Get Today's Calls" "GET" "http://localhost:8000/api/sales/calls?today=true"
test_endpoint "5. Get Today's Visitors" "GET" "http://localhost:8000/api/visitors/?today=true"

echo "═══════════════════════════════════════════════════════════"
echo "SECTION 2: DATA CREATION (POST REQUESTS)"
echo "═══════════════════════════════════════════════════════════"
echo ""

test_endpoint "6. Log New Call" "POST" "http://localhost:8000/api/sales/calls" \
  '{"customer_name":"Integration Test","phone":"9999999999","call_type":"Hot","outcome":"Interested","notes":"Test call"}'

test_endpoint "7. Add New Visitor" "POST" "http://localhost:8000/api/visitors/" \
  '{"name":"Test Visitor","phone":"8888888888","purpose":"Meeting","whom_to_meet":"Manager","in_time":"14:30"}'

echo "═══════════════════════════════════════════════════════════"
echo "SECTION 3: DATA UPDATES (PUT REQUESTS)"  
echo "═══════════════════════════════════════════════════════════"
echo ""

# Get a visitor ID first
VISITOR_ID=$(curl -s "http://localhost:8000/api/visitors/?today=true" -H "Authorization: Bearer $TOKEN" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d[0]['id'] if d else '')" 2>/dev/null)

if [ ! -z "$VISITOR_ID" ]; then
  test_endpoint "8. Check Out Visitor" "PUT" "http://localhost:8000/api/visitors/$VISITOR_ID/checkout" \
    '{"out_time":"16:00"}'
else
  echo "Testing: 8. Check Out Visitor"
  echo "  ⚠️  Skipped (No visitors to check out)"
  echo ""
fi

# Get an enquiry ID
ENQUIRY_ID=$(curl -s "http://localhost:8000/api/enquiries/" -H "Authorization: Bearer $TOKEN" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d[0]['id'] if d else '')" 2>/dev/null)

if [ ! -z "$ENQUIRY_ID" ]; then
  test_endpoint "9. Update Enquiry Priority" "PUT" "http://localhost:8000/api/enquiries/$ENQUIRY_ID" \
    '{"priority":"WARM"}'
    
  # Get salesman ID
  SALESMAN_ID=$(curl -s "http://localhost:8000/api/users/" -H "Authorization: Bearer $TOKEN" | python3 -c "import sys, json; d=json.load(sys.stdin); salesmen=[u for u in d if u.get('role') in ['SALESMAN','salesman']]; print(salesmen[0]['id'] if salesmen else '')" 2>/dev/null)
  
  if [ ! -z "$SALESMAN_ID" ]; then
    test_endpoint "10. Assign Enquiry to Salesman" "PUT" "http://localhost:8000/api/enquiries/$ENQUIRY_ID" \
      "{\"assigned_to\":$SALESMAN_ID}"
  else
    echo "Testing: 10. Assign Enquiry to Salesman"
    echo "  ⚠️  Skipped (No salesmen found)"
    echo ""
  fi
else
  echo "Testing: 9. Update Enquiry Priority"
  echo "  ⚠️  Skipped (No enquiries found)"
  echo ""
  echo "Testing: 10. Assign Enquiry to Salesman"
  echo "  ⚠️  Skipped (No enquiries found)"
  echo ""
fi

echo "═══════════════════════════════════════════════════════════"
echo "SECTION 4: PERMISSION TESTS (SHOULD FAIL)"
echo "═══════════════════════════════════════════════════════════"
echo ""

echo "Testing: 11. Stock Movement Approval (Should be blocked)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "http://localhost:8000/api/stock-movements/1/approve" \
  -H "Authorization: Bearer $TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "403" ]; then
  echo "  ✅ Correctly blocked with 403 Forbidden"
  PASSED=$((PASSED + 1))
else
  echo "  ❌ Expected 403, got $HTTP_CODE"
  FAILED=$((FAILED + 1))
fi
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "TEST SUMMARY"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "✅ Passed: $PASSED"
echo "❌ Failed: $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
  echo "🎉 All tests passed! Frontend is ready for testing."
  exit 0
else
  echo "⚠️  Some tests failed. Please review the errors above."
  exit 1
fi
