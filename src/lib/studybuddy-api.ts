import { supabase } from "@/integrations/supabase/client";

export const outcomeoAPI = {
  // Get or create user
  async getUserOrCreate(email: string, examPaper?: string, examDate?: string, weeklyStudyHours?: number) {
    const { data, error } = await supabase.functions.invoke("users-get-or-create", {
      body: { email, exam_paper: examPaper, exam_date: examDate, weekly_study_hours: weeklyStudyHours },
    });
    if (error) throw error;
    return data;
  },

  // Get today's study plan
  async getTodayTasks(userId: string) {
    const { data, error } = await supabase.functions.invoke("plans-today-tasks", {
      body: null,
      method: "GET",
    });
    if (error) throw error;
    return data;
  },

  // Get batch of questions
  async getContentBatch(paper: string, size: number, unitCode?: string, type?: string, difficulty?: string) {
    const { data, error } = await supabase.functions.invoke("content-batch", {
      body: { paper, unit_code: unitCode, type, difficulty, size },
    });
    if (error) throw error;
    return data;
  },

  // Log study session
  async logSession(userId: string, sessionType: string, totalQuestions: number, correctAnswers: number, rawLog?: any[]) {
    const { data, error } = await supabase.functions.invoke("sessions-log", {
      body: { userId, session_type: sessionType, total_questions: totalQuestions, correct_answers: correctAnswers, raw_log: rawLog },
    });
    if (error) throw error;
    return data;
  },

  // Get analytics summary
  async getAnalytics(userId: string) {
    const { data, error } = await supabase.functions.invoke("analytics-summary", {
      body: null,
      method: "GET",
    });
    if (error) throw error;
    return data;
  },

  // Create Stripe checkout link
  async createCheckoutLink(userId: string) {
    const { data, error } = await supabase.functions.invoke("stripe-create-checkout-link", {
      body: { userId },
    });
    if (error) throw error;
    return data;
  },
};
