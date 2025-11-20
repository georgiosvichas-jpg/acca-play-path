# Outcomeo GPT Integration Guide

Complete guide for integrating Outcomeo backend with a ChatGPT GPT using Actions.

## 🎯 Overview

Outcomeo provides a backend API for ACCA exam preparation that can be accessed from:
- Web application (React/TypeScript)
- ChatGPT GPT (via Actions API)

Both clients use the same Supabase Edge Functions endpoints.

---

## 📋 Prerequisites

Before setting up GPT Actions, ensure you have:

1. **Supabase Project** with Outcomeo deployed
2. **Project URL**: `https://irlxegoatcgskhdvbvuo.supabase.co`
3. **Service Role Key** (found in Supabase Dashboard → Settings → API)
4. **Edge Functions** deployed (automatic with this project)

---

## 🚀 ChatGPT GPT Setup

### Step 1: Create Your GPT

1. Go to [ChatGPT GPT Builder](https://chat.openai.com/gpts/editor)
2. Create a new GPT named "Outcomeo - ACCA Exam Coach"
3. Add this description:
   ```
   Your personal ACCA exam preparation coach. I help you:
   - Create personalized study plans
   - Practice with targeted questions
   - Track your progress and analytics
   - Upgrade to premium features
   
   Tell me your email and which ACCA paper you're studying!
   ```

### Step 2: Configure Actions

1. In the GPT configuration, go to **Actions**
2. Click **Create new action**
3. Import the OpenAPI schema from `docs/gpt-actions-schema.yaml`
4. Or paste the schema directly from the YAML file

### Step 3: Authentication Setup

1. In Actions settings, select **Authentication Type**: **API Key**
2. Choose **Bearer** authentication
3. Set **API Key**: Your Supabase Service Role Key
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. **Important**: Keep this key secret! It has full database access.

### Step 4: Configure Privacy Policy

Add a privacy policy URL (required by OpenAI):
```
https://outcomeo.app/privacy
```

---

## 🔧 Available Actions

### 1. `getUserOrCreate`
**Purpose**: Register or fetch a user by email

**When to use**: 
- First interaction with a new student
- User updates their exam details

**Example GPT Prompt**:
```
User: "I'm studying for ACCA BT, my exam is in June 2025"
GPT: [Calls getUserOrCreate with email, exam_paper=BT, exam_date=2025-06-15]
```

**Response**:
```json
{
  "id": "uuid",
  "email": "student@example.com",
  "exam_paper": "BT",
  "exam_date": "2025-06-15",
  "subscription_status": "free"
}
```

---

### 2. `getTodayTasks`
**Purpose**: Generate daily study plan

**When to use**:
- User asks "What should I study today?"
- User requests their daily plan

**Example GPT Prompt**:
```
User: "What should I study today?"
GPT: [Calls getTodayTasks with userId from previous call]
```

**Response**:
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

**GPT Follow-up**:
```
Great! Today's plan for ACCA BT:
📚 Unit BT01 - Business and Technology
- 10 medium-difficulty multiple choice questions

Ready to start? Say "Let's practice" to begin!
```

---

### 3. `getContentBatch`
**Purpose**: Fetch questions for practice

**When to use**:
- User wants to practice questions
- Implementing quiz/test session

**Example GPT Prompt**:
```
User: "Let's practice BT01 questions"
GPT: [Calls getContentBatch with paper=BT, unit_code=BT01, type=mcq, size=5]
```

**Response**:
```json
[
  {
    "id": "uuid",
    "question": "What is the primary objective of a business?",
    "options": ["Profit maximization", "Market share", "Employee satisfaction", "Social responsibility"],
    "correct_option_index": 0,
    "explanation": "The primary objective..."
  }
]
```

**GPT Follow-up**:
```
Question 1 of 5:

What is the primary objective of a business?

A) Profit maximization
B) Market share
C) Employee satisfaction
D) Social responsibility

What's your answer?
```

---

### 4. `logStudySession`
**Purpose**: Record session completion

**When to use**:
- After user completes a practice session
- To track progress and calculate analytics

**Example GPT Prompt**:
```
User: [Completes 10 questions, gets 8 correct]
GPT: [Calls logStudySession with session_type=daily, total=10, correct=8, raw_log]
```

**Request**:
```json
{
  "userId": "uuid",
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
}
```

**GPT Follow-up**:
```
🎉 Session complete! You scored 8/10 (80%)
Great job! Your progress has been saved.

Want to see your overall analytics? Just ask!
```

---

### 5. `getAnalyticsSummary`
**Purpose**: Retrieve performance analytics

**When to use**:
- User asks "How am I doing?"
- User wants progress report

**Example GPT Prompt**:
```
User: "Show me my progress"
GPT: [Calls getAnalyticsSummary with userId]
```

**Response**:
```json
{
  "total_questions": 150,
  "overall_accuracy": 78,
  "by_unit": {
    "BT01": 85,
    "BT02": 72,
    "BT03": 80
  },
  "by_difficulty": {
    "easy": 92,
    "medium": 75,
    "hard": 60
  }
}
```

**GPT Follow-up**:
```
📊 Your Progress Report

Overall Performance: 78% (150 questions answered)

By Unit:
• BT01: 85% ⭐
• BT02: 72% 
• BT03: 80% ⭐

By Difficulty:
• Easy: 92% ⭐⭐
• Medium: 75% ⭐
• Hard: 60%

Focus Area: Consider practicing more BT02 and hard difficulty questions!
```

---

### 6. `createCheckoutLink`
**Purpose**: Upgrade to premium subscription

**When to use**:
- User wants to unlock premium features
- User asks about subscription

**Example GPT Prompt**:
```
User: "How do I get premium?"
GPT: [Calls createCheckoutLink with userId]
```

**Response**:
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_abc123"
}
```

**GPT Follow-up**:
```
🌟 Outcomeo Premium - $29/month

Premium Features:
✓ Unlimited questions
✓ Mock exams
✓ Advanced analytics
✓ Priority support

Ready to upgrade? Click here to subscribe:
[Checkout Link]
```

---

## 💬 Example Conversation Flow

```
User: Hi! I need help preparing for ACCA BT exam

GPT: Great! I'm here to help you ace your ACCA BT exam. 
To get started, I'll need your email address to set up your account.

User: student@example.com

GPT: [Calls getUserOrCreate]
Perfect! I've set up your account. Your exam is coming up in June 2025.
Let me create today's study plan for you...

GPT: [Calls getTodayTasks]
📚 Today's Study Plan:
- 10 MCQs from Unit BT01 (medium difficulty)

Ready to start? Say "begin" when you're ready!

User: begin

GPT: [Calls getContentBatch]
Question 1 of 10:
[Presents first question]

User: [Answers all 10 questions]

GPT: [Calls logStudySession]
🎉 Excellent work! You scored 8/10 (80%)

Want to see your overall progress? Or continue to another unit?

User: Show my progress

GPT: [Calls getAnalyticsSummary]
[Presents detailed analytics]
```

---

## 🔒 Security Best Practices

### For GPT Integration

1. **Service Role Key**: Only use in GPT Actions (server-side), never expose to client
2. **Email Validation**: Always validate email format before calling getUserOrCreate
3. **Rate Limiting**: Consider implementing rate limits in edge functions
4. **Logging**: Monitor edge function logs in Supabase dashboard

### For Web App Integration

1. Use `supabase.auth` for user authentication
2. Pass JWT tokens to edge functions
3. Let RLS policies handle data access
4. Use the provided `outcomeoAPI` client helper

---

## 🧪 Testing Your GPT

### Test Checklist

- [ ] User registration works
- [ ] Study plan generation returns valid tasks
- [ ] Questions are fetched correctly
- [ ] Sessions are logged properly
- [ ] Analytics display accurate data
- [ ] Checkout link is generated
- [ ] Error handling works (invalid inputs)
- [ ] Multi-session memory persists

### Test Commands

```
"I'm studying ACCA BT"
"What should I study today?"
"Give me 5 practice questions"
"Check my progress"
"How do I upgrade to premium?"
```

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: "Authentication failed"
- **Fix**: Check that Service Role Key is correct in GPT Actions auth settings

**Issue**: "User not found"
- **Fix**: Ensure you called `getUserOrCreate` first to register the user

**Issue**: "No questions returned"
- **Fix**: Check if `sb_questions` table has data for the specified paper/unit

**Issue**: "Invalid session_type"
- **Fix**: Use only: onboarding, daily, quick_drill, mini_test, mock_exam

### Debugging Tips

1. Check Supabase Edge Function logs (Dashboard → Edge Functions → Logs)
2. Test endpoints directly using Postman/curl before GPT integration
3. Verify database tables have data (`sb_users`, `sb_questions`, `sb_study_sessions`)
4. Check CORS headers are properly configured

---

## 📚 Additional Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [ChatGPT GPT Actions Guide](https://platform.openai.com/docs/actions)
- [OpenAPI 3.1 Specification](https://swagger.io/specification/)
- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)

---

## 🆘 Support

For issues or questions:
1. Check edge function logs in Supabase dashboard
2. Review this documentation
3. Test endpoints manually with curl/Postman
4. Contact: support@outcomeo.com

---

**Last Updated**: November 2025  
**API Version**: 1.0.0  
**Supabase Project**: irlxegoatcgskhdvbvuo
