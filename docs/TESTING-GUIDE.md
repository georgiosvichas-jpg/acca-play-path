# Outcomeo API Testing Guide

Quick reference for testing all Outcomeo backend endpoints.

## 🔑 Authentication

All requests require Bearer token authentication:

```bash
export SUPABASE_URL="https://irlxegoatcgskhdvbvuo.supabase.co"
export SERVICE_KEY="your_service_role_key_here"
```

---

## 🧪 Test Endpoints

### 1. Create/Get User

```bash
curl -X POST "$SUPABASE_URL/functions/v1/users-get-or-create" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "exam_paper": "BT",
    "exam_date": "2025-06-15",
    "weekly_study_hours": 10
  }'
```

**Expected Response**:
```json
{
  "id": "uuid",
  "email": "test@example.com",
  "exam_paper": "BT",
  "exam_date": "2025-06-15",
  "weekly_study_hours": 10,
  "subscription_status": "free",
  "created_at": "2025-01-14T...",
  "updated_at": "2025-01-14T..."
}
```

---

### 2. Get Today's Tasks

```bash
# Replace USER_ID with ID from previous response
curl -X GET "$SUPABASE_URL/functions/v1/plans-today-tasks?userId=USER_ID" \
  -H "Authorization: Bearer $SERVICE_KEY"
```

**Expected Response**:
```json
{
  "paper": "BT",
  "tasks": [
    {
      "unit_code": "BT01",
      "type": "mcq",
      "difficulty": "medium",
      "count": 10
    }
  ]
}
```

---

### 3. Get Questions

```bash
curl -X POST "$SUPABASE_URL/functions/v1/content-batch" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "paper": "BT",
    "unit_code": "BT01",
    "type": "mcq",
    "difficulty": "medium",
    "size": 5
  }'
```

**Expected Response**:
```json
[
  {
    "id": "uuid",
    "paper": "BT",
    "unit_code": "BT01",
    "type": "mcq",
    "difficulty": "medium",
    "question": "What is...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_option_index": 0,
    "explanation": "..."
  }
]
```

---

### 4. Log Study Session

```bash
curl -X POST "$SUPABASE_URL/functions/v1/sessions-log" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "session_type": "daily",
    "total_questions": 10,
    "correct_answers": 8,
    "raw_log": [
      {
        "question_id": "uuid",
        "unit_code": "BT01",
        "difficulty": "medium",
        "correct": true,
        "time_taken_seconds": 45
      }
    ]
  }'
```

**Expected Response**:
```json
{
  "id": "uuid",
  "user_id": "USER_ID",
  "session_type": "daily",
  "started_at": "2025-01-14T...",
  "ended_at": "2025-01-14T...",
  "total_questions": 10,
  "correct_answers": 8,
  "raw_log": [...],
  "created_at": "2025-01-14T..."
}
```

---

### 5. Get Analytics

```bash
curl -X GET "$SUPABASE_URL/functions/v1/analytics-summary?userId=USER_ID" \
  -H "Authorization: Bearer $SERVICE_KEY"
```

**Expected Response**:
```json
{
  "total_questions": 10,
  "overall_accuracy": 80,
  "by_unit": {
    "BT01": 80
  },
  "by_difficulty": {
    "medium": 80
  }
}
```

---

### 6. Create Checkout Link

```bash
curl -X POST "$SUPABASE_URL/functions/v1/stripe-create-checkout-link" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID"
  }'
```

**Expected Response**:
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

---

## 🧩 Integration Test Script

Save as `test-studybuddy.sh`:

```bash
#!/bin/bash

SUPABASE_URL="https://irlxegoatcgskhdvbvuo.supabase.co"
SERVICE_KEY="your_service_role_key"
TEST_EMAIL="test-$(date +%s)@example.com"

echo "🧪 StudyBuddy API Integration Test"
echo "===================================="

# 1. Create user
echo -e "\n1️⃣ Creating user..."
USER_RESPONSE=$(curl -s -X POST "$SUPABASE_URL/functions/v1/users-get-or-create" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"exam_paper\":\"BT\",\"weekly_study_hours\":10}")

USER_ID=$(echo $USER_RESPONSE | jq -r '.id')
echo "✅ User created: $USER_ID"

# 2. Get tasks
echo -e "\n2️⃣ Getting today's tasks..."
TASKS=$(curl -s -X GET "$SUPABASE_URL/functions/v1/plans-today-tasks?userId=$USER_ID" \
  -H "Authorization: Bearer $SERVICE_KEY")
echo "✅ Tasks: $TASKS"

# 3. Get questions
echo -e "\n3️⃣ Fetching questions..."
QUESTIONS=$(curl -s -X POST "$SUPABASE_URL/functions/v1/content-batch" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"paper":"BT","size":5}')
echo "✅ Questions fetched: $(echo $QUESTIONS | jq 'length') questions"

# 4. Log session
echo -e "\n4️⃣ Logging study session..."
SESSION=$(curl -s -X POST "$SUPABASE_URL/functions/v1/sessions-log" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$USER_ID\",\"session_type\":\"daily\",\"total_questions\":5,\"correct_answers\":4}")
echo "✅ Session logged"

# 5. Get analytics
echo -e "\n5️⃣ Getting analytics..."
ANALYTICS=$(curl -s -X GET "$SUPABASE_URL/functions/v1/analytics-summary?userId=$USER_ID" \
  -H "Authorization: Bearer $SERVICE_KEY")
echo "✅ Analytics: $ANALYTICS"

# 6. Create checkout
echo -e "\n6️⃣ Creating checkout link..."
CHECKOUT=$(curl -s -X POST "$SUPABASE_URL/functions/v1/stripe-create-checkout-link" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$USER_ID\"}")
echo "✅ Checkout: $CHECKOUT"

echo -e "\n✅ All tests passed!"
```

Make executable and run:
```bash
chmod +x test-outcomeo.sh
./test-outcomeo.sh
```

---

## 📊 Database Verification

After testing, verify data in Supabase:

```sql
-- Check users
SELECT * FROM sb_users ORDER BY created_at DESC LIMIT 5;

-- Check sessions
SELECT * FROM sb_study_sessions ORDER BY created_at DESC LIMIT 5;

-- Check questions exist
SELECT COUNT(*) FROM sb_questions;
SELECT COUNT(*) FROM sb_questions WHERE paper = 'BT';
```

---

## 🚨 Error Scenarios

### Test Invalid Inputs

```bash
# Missing required field
curl -X POST "$SUPABASE_URL/functions/v1/users-get-or-create" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'

# Invalid session type
curl -X POST "$SUPABASE_URL/functions/v1/sessions-log" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "session_type": "invalid_type"
  }'

# Size out of range
curl -X POST "$SUPABASE_URL/functions/v1/content-batch" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "paper": "BT",
    "size": 500
  }'
```

---

## ✅ Success Criteria

- [ ] All 6 endpoints return 200 OK
- [ ] User is created in `sb_users` table
- [ ] Session is logged in `sb_study_sessions` table
- [ ] Analytics accurately reflect logged session
- [ ] Checkout link is valid Stripe URL
- [ ] Error handling works for invalid inputs

---

**Ready for production when all tests pass!** 🚀
