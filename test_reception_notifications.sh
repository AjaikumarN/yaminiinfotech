#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "         RECEPTION NOTIFICATIONS TEST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get reception token
echo "🔑 Authenticating as reception user..."
TOKEN=$(curl -s -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=reception&password=reception123" | \
  python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to authenticate"
  exit 1
fi
echo "✅ Authenticated successfully"
echo ""

# Test 1: Get all notifications
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1: Get All Notifications"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET \
  "http://localhost:8000/api/notifications/my-notifications" \
  -H "Authorization: Bearer $TOKEN")

STATUS=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$STATUS" = "200" ]; then
  echo "✅ Status: 200 OK"
  COUNT=$(echo "$BODY" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null)
  echo "📊 Total notifications: $COUNT"
  
  if [ "$COUNT" -gt 0 ]; then
    echo ""
    echo "Sample notifications:"
    echo "$BODY" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for i, notif in enumerate(data[:5], 1):
    print(f'{i}. [{notif[\"type\"]}] {notif[\"message\"]}')
    print(f'   Read: {notif[\"is_read\"]} | Created: {notif[\"created_at\"][:19]}')
" 2>/dev/null
  fi
else
  echo "❌ Status: $STATUS"
  echo "Response: $BODY"
fi
echo ""

# Test 2: Get unread notifications only
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 2: Get Unread Notifications Only"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET \
  "http://localhost:8000/api/notifications/my-notifications?unread_only=true" \
  -H "Authorization: Bearer $TOKEN")

STATUS=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$STATUS" = "200" ]; then
  echo "✅ Status: 200 OK"
  UNREAD_COUNT=$(echo "$BODY" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null)
  echo "📊 Unread notifications: $UNREAD_COUNT"
  
  if [ "$UNREAD_COUNT" -gt 0 ]; then
    echo ""
    echo "Unread notifications:"
    echo "$BODY" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for i, notif in enumerate(data[:5], 1):
    print(f'{i}. [{notif[\"type\"]}] {notif[\"message\"]}')
    print(f'   ID: {notif[\"id\"]} | Created: {notif[\"created_at\"][:19]}')
" 2>/dev/null
    
    # Store first notification ID for marking as read
    NOTIF_ID=$(echo "$BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data[0]['id']) if len(data) > 0 else ''" 2>/dev/null)
  fi
else
  echo "❌ Status: $STATUS"
  echo "Response: $BODY"
fi
echo ""

# Test 3: Mark notification as read (if we have unread notifications)
if [ -n "$NOTIF_ID" ] && [ "$NOTIF_ID" != "" ]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "TEST 3: Mark Notification #$NOTIF_ID as Read"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT \
    "http://localhost:8000/api/notifications/$NOTIF_ID/read" \
    -H "Authorization: Bearer $TOKEN")

  STATUS=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  if [ "$STATUS" = "200" ]; then
    echo "✅ Status: 200 OK"
    echo "✅ Notification marked as read"
    IS_READ=$(echo "$BODY" | python3 -c "import sys, json; print(json.load(sys.stdin).get('is_read', False))" 2>/dev/null)
    echo "   is_read: $IS_READ"
  else
    echo "❌ Status: $STATUS"
    echo "Response: $BODY"
  fi
  echo ""
fi

# Test 4: Verify notification context is loaded in frontend
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 4: Frontend Notification Context Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if grep -q "NotificationContext" /Users/ajaikumarn/Desktop/ui\ 2/frontend/src/contexts/NotificationContext.jsx 2>/dev/null; then
  echo "✅ NotificationContext exists"
  
  if grep -q "useNotification" /Users/ajaikumarn/Desktop/ui\ 2/frontend/src/components/ReceptionDashboardNew.jsx 2>/dev/null; then
    echo "✅ ReceptionDashboard uses NotificationContext"
  else
    echo "⚠️  ReceptionDashboard does NOT use NotificationContext"
  fi
else
  echo "❌ NotificationContext not found"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
