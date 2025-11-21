# Motivational Messages System

This directory contains the centralized motivational messaging system for Outcomeo.

## Overview

The `motivational-messages.ts` file contains 40+ carefully crafted microcopy messages that appear contextually throughout the app to energize, celebrate progress, and guide users with warmth.

## Message Categories

### 1. **micro_success**
Displayed after completing flashcards, earning XP, or finishing tasks.
- "Nice work — your consistency pays off."
- "You're building real exam momentum."
- "Strong session! That's how top scorers study."

### 2. **streak_active**
Shown when users maintain their daily study streak.
- "You kept the streak alive!"
- "Another day of discipline logged."
- "Momentum sustained. Let's keep it rolling."

### 3. **streak_risk**
Gentle nudges when a streak is at risk.
- "Don't break the chain — one quick session today."
- "Five minutes now equals streak saved."

### 4. **streak_broken**
Supportive messages to rebuild after a broken streak.
- "No worries — every expert restarts."
- "Reset and rise — the next streak starts now."

### 5. **milestone**
Celebrates goal achievements and progress markers.
- "Your readiness score just leveled up."
- "You're over halfway to your goal!"
- "Exam-ready is no longer a dream. It's data."

### 6. **encouragement**
Helps users recover from slow periods or low activity.
- "You don't need perfection — only persistence."
- "Small steps beat big breaks."
- "You've come too far to stop here."

### 7. **xp_gain**
Reinforces gamification and XP rewards.
- "Every effort matters."
- "You're climbing the leaderboard!"
- "That's how top 5% learners roll."

### 8. **reminder**
Re-engagement messages for inactive users.
- "Your planner misses you — ready to continue?"
- "Momentum is calling — open Outcomeo and start small."

### 9. **celebration**
Major milestones and first-time achievements.
- "Welcome back, future ACCA!"
- "Exam-ready mode: activated."
- "You're officially in the top learner zone."

### 10. **coaching**
In-context micro-tips and guidance.
- "Feeling stuck? Review your weakest topic next."
- "Use analytics weekly to spot your blind spots."
- "You're not behind; you're just recalibrating."

## Usage

### In Components

```typescript
import { useMotivationalMessage } from "@/hooks/useMotivationalMessage";
import { toast } from "@/hooks/use-toast";

function YourComponent() {
  const { getMessage } = useMotivationalMessage();
  
  // Get a random message from a category
  const message = getMessage("micro_success");
  
  // Get a specific message by category and trigger
  const specificMessage = getMessage("streak_active", "daily_login");
  
  // Show in toast
  toast({
    description: message,
    duration: 2000,
  });
}
```

### Message Structure

Each message has:
- **category**: The type of message (micro_success, streak_active, etc.)
- **message**: The actual text to display
- **trigger**: When to show this message (flashcard_complete, xp_earned, etc.)
- **tone**: Optional emotional tone (calm, energetic, recovery)

## Design Principles

1. **Brevity**: 4-8 words max per message
2. **Positive Framing**: Never say "you haven't" - use "ready to start?"
3. **Second Person**: Always use "You" and "Your"
4. **Credible Gamification**: Professional yet encouraging - "Duolingo meets Coursera"
5. **No Emojis**: Clean, text-only messaging

## Current Implementations

The motivational messaging system is currently integrated in:

- **FlashcardsContent**: Shows micro-success messages when earning XP
- **GuidedTour**: Displays celebration messages on tour completion
- **PostSignupOnboarding**: Welcomes users with celebratory messages
- **DashboardContent**: Can be extended for task completion and milestone tracking

## Future Enhancements

- Add streak tracking with automatic reminder messages
- Implement analytics-based coaching tips
- Create personalized messages based on user performance
- Add leaderboard celebration messages
- Integrate push notification support for re-engagement
