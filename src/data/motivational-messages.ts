export interface MotivationalMessage {
  category: string;
  message: string;
  trigger: string;
  tone?: "calm" | "energetic" | "recovery";
}

export const motivationalMessages: MotivationalMessage[] = [
  // Micro-success messages
  {
    category: "micro_success",
    message: "Nice work — your consistency pays off.",
    trigger: "flashcard_complete",
    tone: "calm",
  },
  {
    category: "micro_success",
    message: "You're building real exam momentum.",
    trigger: "quiz_complete",
    tone: "energetic",
  },
  {
    category: "micro_success",
    message: "Every 5 minutes counts — great focus.",
    trigger: "session_complete",
    tone: "calm",
  },
  {
    category: "micro_success",
    message: "Strong session! That's how top scorers study.",
    trigger: "session_complete",
    tone: "energetic",
  },
  {
    category: "micro_success",
    message: "Progress saved. Knowledge upgraded.",
    trigger: "xp_gain",
    tone: "calm",
  },
  {
    category: "micro_success",
    message: "XP earned. Keep climbing.",
    trigger: "xp_gain",
    tone: "energetic",
  },
  {
    category: "micro_success",
    message: "You're mastering this one step at a time.",
    trigger: "task_complete",
    tone: "calm",
  },

  // Streak reinforcement - active
  {
    category: "streak_active",
    message: "You kept the streak alive!",
    trigger: "daily_login",
    tone: "energetic",
  },
  {
    category: "streak_active",
    message: "Another day of discipline logged.",
    trigger: "daily_login",
    tone: "calm",
  },
  {
    category: "streak_active",
    message: "That's commitment — your plan is on track.",
    trigger: "daily_login",
    tone: "calm",
  },
  {
    category: "streak_active",
    message: "Momentum sustained. Let's keep it rolling.",
    trigger: "daily_login",
    tone: "energetic",
  },

  // Streak at risk
  {
    category: "streak_risk",
    message: "Don't break the chain — one quick session today.",
    trigger: "reminder",
    tone: "calm",
  },
  {
    category: "streak_risk",
    message: "Your streak is waiting for you.",
    trigger: "reminder",
    tone: "calm",
  },
  {
    category: "streak_risk",
    message: "Five minutes now equals streak saved.",
    trigger: "reminder",
    tone: "energetic",
  },

  // Streak broken
  {
    category: "streak_broken",
    message: "No worries — every expert restarts.",
    trigger: "login_after_break",
    tone: "recovery",
  },
  {
    category: "streak_broken",
    message: "Let's pick it back up.",
    trigger: "login_after_break",
    tone: "recovery",
  },
  {
    category: "streak_broken",
    message: "Reset and rise — the next streak starts now.",
    trigger: "login_after_break",
    tone: "recovery",
  },

  // Goal milestones
  {
    category: "milestone",
    message: "You're over halfway to your goal!",
    trigger: "progress_50",
    tone: "energetic",
  },
  {
    category: "milestone",
    message: "Your readiness score just leveled up.",
    trigger: "score_increase",
    tone: "energetic",
  },
  {
    category: "milestone",
    message: "Milestone unlocked — consistency in action.",
    trigger: "goal_reached",
    tone: "calm",
  },
  {
    category: "milestone",
    message: "Your planner's 80% complete — almost there.",
    trigger: "progress_80",
    tone: "energetic",
  },
  {
    category: "milestone",
    message: "Exam-ready is no longer a dream. It's data.",
    trigger: "high_readiness",
    tone: "calm",
  },
  {
    category: "milestone",
    message: "Focus today, results tomorrow.",
    trigger: "progress_update",
    tone: "calm",
  },
  {
    category: "milestone",
    message: "You're closer than you think.",
    trigger: "progress_update",
    tone: "calm",
  },

  // Encouragement & resilience
  {
    category: "encouragement",
    message: "Tough week? Just one study block can reset your rhythm.",
    trigger: "low_activity",
    tone: "recovery",
  },
  {
    category: "encouragement",
    message: "You don't need perfection — only persistence.",
    trigger: "low_activity",
    tone: "recovery",
  },
  {
    category: "encouragement",
    message: "Small steps beat big breaks.",
    trigger: "return_login",
    tone: "recovery",
  },
  {
    category: "encouragement",
    message: "The best time to study again is now.",
    trigger: "return_login",
    tone: "energetic",
  },
  {
    category: "encouragement",
    message: "Progress paused isn't progress lost.",
    trigger: "return_login",
    tone: "calm",
  },
  {
    category: "encouragement",
    message: "You've come too far to stop here.",
    trigger: "return_login",
    tone: "energetic",
  },

  // XP & Gamification
  {
    category: "xp_gain",
    message: "Every effort matters.",
    trigger: "xp_earned",
    tone: "calm",
  },
  {
    category: "xp_gain",
    message: "New badge unlocked — solid progress.",
    trigger: "badge_unlock",
    tone: "energetic",
  },
  {
    category: "xp_gain",
    message: "Your stats are shaping up nicely.",
    trigger: "xp_earned",
    tone: "calm",
  },
  {
    category: "xp_gain",
    message: "Consistency is your competitive edge.",
    trigger: "xp_earned",
    tone: "calm",
  },
  {
    category: "xp_gain",
    message: "You're climbing the leaderboard!",
    trigger: "rank_up",
    tone: "energetic",
  },
  {
    category: "xp_gain",
    message: "That's how top 5% learners roll.",
    trigger: "xp_earned",
    tone: "energetic",
  },

  // Reminders / Re-engagement
  {
    category: "reminder",
    message: "Your planner misses you — ready to continue?",
    trigger: "inactive_3days",
    tone: "calm",
  },
  {
    category: "reminder",
    message: "Just one flashcard set today keeps the pace.",
    trigger: "inactive_2days",
    tone: "calm",
  },
  {
    category: "reminder",
    message: "Momentum is calling — open Study Buddy and start small.",
    trigger: "inactive_5days",
    tone: "energetic",
  },
  {
    category: "reminder",
    message: "You planned it. Let's finish it.",
    trigger: "inactive_1day",
    tone: "calm",
  },

  // Celebratory moments
  {
    category: "celebration",
    message: "Welcome back, future ACCA!",
    trigger: "first_login",
    tone: "energetic",
  },
  {
    category: "celebration",
    message: "You've turned preparation into progress.",
    trigger: "major_milestone",
    tone: "calm",
  },
  {
    category: "celebration",
    message: "Another milestone conquered — proud moment.",
    trigger: "milestone_reached",
    tone: "energetic",
  },
  {
    category: "celebration",
    message: "Your consistency inspires real results.",
    trigger: "streak_milestone",
    tone: "calm",
  },
  {
    category: "celebration",
    message: "Exam-ready mode: activated.",
    trigger: "high_readiness",
    tone: "energetic",
  },
  {
    category: "celebration",
    message: "You're officially in the top learner zone.",
    trigger: "leaderboard_top",
    tone: "energetic",
  },

  // Friendly micro-coaching
  {
    category: "coaching",
    message: "Feeling stuck? Review your weakest topic next.",
    trigger: "low_score",
    tone: "calm",
  },
  {
    category: "coaching",
    message: "Short on time? Try a mini-problem.",
    trigger: "time_constraint",
    tone: "calm",
  },
  {
    category: "coaching",
    message: "Use analytics weekly to spot your blind spots.",
    trigger: "analytics_view",
    tone: "calm",
  },
  {
    category: "coaching",
    message: "Plan smarter — your future self will thank you.",
    trigger: "planner_view",
    tone: "calm",
  },
  {
    category: "coaching",
    message: "You're not behind; you're just recalibrating.",
    trigger: "progress_check",
    tone: "recovery",
  },
];

export function getMotivationalMessage(
  category: string,
  trigger?: string
): string {
  const filtered = motivationalMessages.filter(
    (msg) =>
      msg.category === category &&
      (trigger ? msg.trigger === trigger : true)
  );

  if (filtered.length === 0) {
    return "Keep going!";
  }

  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex].message;
}

export function getRandomMotivationalMessage(category: string): string {
  const filtered = motivationalMessages.filter(
    (msg) => msg.category === category
  );

  if (filtered.length === 0) {
    return "Keep going!";
  }

  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex].message;
}
