export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          badge_name: string
          created_at: string
          criteria_type: string
          criteria_value: number
          description: string
          icon: string
          id: string
          tier: string
        }
        Insert: {
          badge_name: string
          created_at?: string
          criteria_type: string
          criteria_value: number
          description: string
          icon: string
          id?: string
          tier?: string
        }
        Update: {
          badge_name?: string
          created_at?: string
          criteria_type?: string
          criteria_value?: number
          description?: string
          icon?: string
          id?: string
          tier?: string
        }
        Relationships: []
      }
      flags_anti_abuse: {
        Row: {
          details: Json | null
          flagged_at: string
          id: string
          reason: string
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          user_id: string
        }
        Insert: {
          details?: Json | null
          flagged_at?: string
          id?: string
          reason: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          user_id: string
        }
        Update: {
          details?: Json | null
          flagged_at?: string
          id?: string
          reason?: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
      flashcard_reviews: {
        Row: {
          correct_count: number | null
          created_at: string | null
          flashcard_id: string
          id: string
          last_reviewed_at: string | null
          total_reviews: number | null
          user_id: string
        }
        Insert: {
          correct_count?: number | null
          created_at?: string | null
          flashcard_id: string
          id?: string
          last_reviewed_at?: string | null
          total_reviews?: number | null
          user_id: string
        }
        Update: {
          correct_count?: number | null
          created_at?: string | null
          flashcard_id?: string
          id?: string
          last_reviewed_at?: string | null
          total_reviews?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_reviews_flashcard_id_fkey"
            columns: ["flashcard_id"]
            isOneToOne: false
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcards: {
        Row: {
          answer: string
          category: string | null
          created_at: string | null
          difficulty: string | null
          id: string
          paper_code: string
          paper_name: string | null
          question: string
          source_type: string | null
          unit_title: string | null
          updated_at: string | null
          xp: number | null
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string | null
          difficulty?: string | null
          id?: string
          paper_code: string
          paper_name?: string | null
          question: string
          source_type?: string | null
          unit_title?: string | null
          updated_at?: string | null
          xp?: number | null
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string | null
          difficulty?: string | null
          id?: string
          paper_code?: string
          paper_name?: string | null
          question?: string
          source_type?: string | null
          unit_title?: string | null
          updated_at?: string | null
          xp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_paper_code_fkey"
            columns: ["paper_code"]
            isOneToOne: false
            referencedRelation: "papers"
            referencedColumns: ["paper_code"]
          },
        ]
      }
      leaderboard_snapshots: {
        Row: {
          captured_on: string
          created_at: string
          id: string
          paper_code: string | null
          percentile_country: number | null
          percentile_global: number | null
          percentile_paper: number | null
          rank_country: number | null
          rank_global: number | null
          rank_paper: number | null
          user_id: string
          xp_30d: number
          xp_7d: number
          xp_total: number
        }
        Insert: {
          captured_on?: string
          created_at?: string
          id?: string
          paper_code?: string | null
          percentile_country?: number | null
          percentile_global?: number | null
          percentile_paper?: number | null
          rank_country?: number | null
          rank_global?: number | null
          rank_paper?: number | null
          user_id: string
          xp_30d?: number
          xp_7d?: number
          xp_total?: number
        }
        Update: {
          captured_on?: string
          created_at?: string
          id?: string
          paper_code?: string | null
          percentile_country?: number | null
          percentile_global?: number | null
          percentile_paper?: number | null
          rank_country?: number | null
          rank_global?: number | null
          rank_paper?: number | null
          user_id?: string
          xp_30d?: number
          xp_7d?: number
          xp_total?: number
        }
        Relationships: []
      }
      mock_config: {
        Row: {
          created_at: string | null
          duration_minutes: number
          id: string
          paper_code: string
          pass_mark_percentage: number
          sections_json: Json | null
          total_questions: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          duration_minutes: number
          id?: string
          paper_code: string
          pass_mark_percentage?: number
          sections_json?: Json | null
          total_questions: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number
          id?: string
          paper_code?: string
          pass_mark_percentage?: number
          sections_json?: Json | null
          total_questions?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_mock_config_paper"
            columns: ["paper_code"]
            isOneToOne: true
            referencedRelation: "papers"
            referencedColumns: ["paper_code"]
          },
        ]
      }
      papers: {
        Row: {
          created_at: string | null
          id: string
          level: string
          paper_code: string
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          level: string
          paper_code: string
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: string
          paper_code?: string
          title?: string
        }
        Relationships: []
      }
      past_papers_meta: {
        Row: {
          created_at: string | null
          id: string
          note: string | null
          paper_code: string
          session: string
          year: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          note?: string | null
          paper_code: string
          session: string
          year: number
        }
        Update: {
          created_at?: string | null
          id?: string
          note?: string | null
          paper_code?: string
          session?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "past_papers_meta_paper_code_fkey"
            columns: ["paper_code"]
            isOneToOne: false
            referencedRelation: "papers"
            referencedColumns: ["paper_code"]
          },
        ]
      }
      question_bookmarks: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          question_id: string
          source_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          question_id: string
          source_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          question_id?: string
          source_type?: string
          user_id?: string
        }
        Relationships: []
      }
      question_reviews: {
        Row: {
          created_at: string
          ease_factor: number
          id: string
          interval_days: number
          last_reviewed_at: string
          next_review_at: string
          question_id: string
          repetitions: number
          times_correct: number
          times_incorrect: number
          times_seen: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ease_factor?: number
          id?: string
          interval_days?: number
          last_reviewed_at?: string
          next_review_at: string
          question_id: string
          repetitions?: number
          times_correct?: number
          times_incorrect?: number
          times_seen?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ease_factor?: number
          id?: string
          interval_days?: number
          last_reviewed_at?: string
          next_review_at?: string
          question_id?: string
          repetitions?: number
          times_correct?: number
          times_incorrect?: number
          times_seen?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sb_minitests: {
        Row: {
          created_at: string | null
          duration_minutes: number | null
          id: string
          paper: string
          question_ids: string[]
          title: string
        }
        Insert: {
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          paper: string
          question_ids: string[]
          title: string
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          paper?: string
          question_ids?: string[]
          title?: string
        }
        Relationships: []
      }
      sb_questions: {
        Row: {
          answer: string | null
          correct_option_index: number | null
          created_at: string | null
          difficulty: string | null
          estimated_time_seconds: number | null
          explanation: string | null
          external_id: string | null
          id: string
          is_active: boolean | null
          learning_outcome_code: string | null
          metadata: Json | null
          options: Json | null
          paper: string
          question: string
          tags: Json | null
          type: string
          unit_code: string | null
        }
        Insert: {
          answer?: string | null
          correct_option_index?: number | null
          created_at?: string | null
          difficulty?: string | null
          estimated_time_seconds?: number | null
          explanation?: string | null
          external_id?: string | null
          id?: string
          is_active?: boolean | null
          learning_outcome_code?: string | null
          metadata?: Json | null
          options?: Json | null
          paper: string
          question: string
          tags?: Json | null
          type: string
          unit_code?: string | null
        }
        Update: {
          answer?: string | null
          correct_option_index?: number | null
          created_at?: string | null
          difficulty?: string | null
          estimated_time_seconds?: number | null
          explanation?: string | null
          external_id?: string | null
          id?: string
          is_active?: boolean | null
          learning_outcome_code?: string | null
          metadata?: Json | null
          options?: Json | null
          paper?: string
          question?: string
          tags?: Json | null
          type?: string
          unit_code?: string | null
        }
        Relationships: []
      }
      sb_study_sessions: {
        Row: {
          correct_answers: number | null
          created_at: string | null
          ended_at: string | null
          id: string
          raw_log: Json | null
          session_type: string
          started_at: string | null
          total_questions: number | null
          user_id: string
        }
        Insert: {
          correct_answers?: number | null
          created_at?: string | null
          ended_at?: string | null
          id?: string
          raw_log?: Json | null
          session_type: string
          started_at?: string | null
          total_questions?: number | null
          user_id: string
        }
        Update: {
          correct_answers?: number | null
          created_at?: string | null
          ended_at?: string | null
          id?: string
          raw_log?: Json | null
          session_type?: string
          started_at?: string | null
          total_questions?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sb_study_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "sb_users"
            referencedColumns: ["id"]
          },
        ]
      }
      sb_users: {
        Row: {
          created_at: string | null
          email: string
          exam_date: string | null
          exam_paper: string | null
          id: string
          name: string | null
          subscription_status: string | null
          updated_at: string | null
          weekly_study_hours: number | null
        }
        Insert: {
          created_at?: string | null
          email: string
          exam_date?: string | null
          exam_paper?: string | null
          id?: string
          name?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          weekly_study_hours?: number | null
        }
        Update: {
          created_at?: string | null
          email?: string
          exam_date?: string | null
          exam_paper?: string | null
          id?: string
          name?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          weekly_study_hours?: number | null
        }
        Relationships: []
      }
      study_paths: {
        Row: {
          created_at: string | null
          exam_date: string
          id: string
          is_active: boolean | null
          path_data: Json
          progress: Json | null
          updated_at: string | null
          user_id: string
          weeks_duration: number
        }
        Insert: {
          created_at?: string | null
          exam_date: string
          id?: string
          is_active?: boolean | null
          path_data: Json
          progress?: Json | null
          updated_at?: string | null
          user_id: string
          weeks_duration: number
        }
        Update: {
          created_at?: string | null
          exam_date?: string
          id?: string
          is_active?: boolean | null
          path_data?: Json
          progress?: Json | null
          updated_at?: string | null
          user_id?: string
          weeks_duration?: number
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          correct_answers: number | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          notes: string | null
          paper_code: string
          raw_log: Json | null
          session_date: string
          session_type: string | null
          start_time: string | null
          syllabus_unit_id: string | null
          total_questions: number | null
          updated_at: string | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          correct_answers?: number | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          paper_code: string
          raw_log?: Json | null
          session_date: string
          session_type?: string | null
          start_time?: string | null
          syllabus_unit_id?: string | null
          total_questions?: number | null
          updated_at?: string | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          correct_answers?: number | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          paper_code?: string
          raw_log?: Json | null
          session_date?: string
          session_type?: string | null
          start_time?: string | null
          syllabus_unit_id?: string | null
          total_questions?: number | null
          updated_at?: string | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "study_sessions_syllabus_unit_id_fkey"
            columns: ["syllabus_unit_id"]
            isOneToOne: false
            referencedRelation: "syllabus_units"
            referencedColumns: ["id"]
          },
        ]
      }
      syllabus_units: {
        Row: {
          chapter: string
          created_at: string | null
          description: string | null
          estimated_minutes: number | null
          estimated_study_minutes: number | null
          id: string
          learning_outcome: string | null
          paper_code: string
          parent_unit_code: string | null
          priority: string | null
          unit_code: string | null
          unit_level: string | null
          unit_name: string | null
          unit_title: string
          updated_at: string | null
        }
        Insert: {
          chapter: string
          created_at?: string | null
          description?: string | null
          estimated_minutes?: number | null
          estimated_study_minutes?: number | null
          id?: string
          learning_outcome?: string | null
          paper_code: string
          parent_unit_code?: string | null
          priority?: string | null
          unit_code?: string | null
          unit_level?: string | null
          unit_name?: string | null
          unit_title: string
          updated_at?: string | null
        }
        Update: {
          chapter?: string
          created_at?: string | null
          description?: string | null
          estimated_minutes?: number | null
          estimated_study_minutes?: number | null
          id?: string
          learning_outcome?: string | null
          paper_code?: string
          parent_unit_code?: string | null
          priority?: string | null
          unit_code?: string | null
          unit_level?: string | null
          unit_name?: string | null
          unit_title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "syllabus_units_paper_code_fkey"
            columns: ["paper_code"]
            isOneToOne: false
            referencedRelation: "papers"
            referencedColumns: ["paper_code"]
          },
        ]
      }
      topic_performance: {
        Row: {
          accuracy_percentage: number | null
          id: string
          last_practiced_at: string | null
          paper_code: string
          questions_attempted: number | null
          questions_correct: number | null
          topic_name: string
          unit_code: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accuracy_percentage?: number | null
          id?: string
          last_practiced_at?: string | null
          paper_code: string
          questions_attempted?: number | null
          questions_correct?: number | null
          topic_name: string
          unit_code?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accuracy_percentage?: number | null
          id?: string
          last_practiced_at?: string | null
          paper_code?: string
          questions_attempted?: number | null
          questions_correct?: number | null
          topic_name?: string
          unit_code?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          browser_notifications_enabled: boolean | null
          country: string | null
          created_at: string | null
          daily_coach_messages_used: number | null
          daily_flashcards_used: number | null
          display_name: string | null
          email_reminders_enabled: boolean | null
          exam_session: string | null
          id: string
          is_opted_out_of_leaderboard: boolean | null
          last_coach_reset_date: string | null
          last_flashcard_reset_date: string | null
          last_mock_reset_date: string | null
          last_study_date: string | null
          level: number | null
          plan_type: Database["public"]["Enums"]["plan_type"] | null
          selected_paper: string | null
          selected_papers: string[] | null
          stripe_customer_id: string | null
          study_days: string[] | null
          study_hours: number | null
          study_streak: number | null
          subscription_end_date: string | null
          subscription_product_id: string | null
          subscription_status: string | null
          total_mocks_completed: number | null
          total_xp: number | null
          unlocked_papers: string[] | null
          updated_at: string | null
          user_id: string
          weekly_mocks_used: number | null
        }
        Insert: {
          browser_notifications_enabled?: boolean | null
          country?: string | null
          created_at?: string | null
          daily_coach_messages_used?: number | null
          daily_flashcards_used?: number | null
          display_name?: string | null
          email_reminders_enabled?: boolean | null
          exam_session?: string | null
          id?: string
          is_opted_out_of_leaderboard?: boolean | null
          last_coach_reset_date?: string | null
          last_flashcard_reset_date?: string | null
          last_mock_reset_date?: string | null
          last_study_date?: string | null
          level?: number | null
          plan_type?: Database["public"]["Enums"]["plan_type"] | null
          selected_paper?: string | null
          selected_papers?: string[] | null
          stripe_customer_id?: string | null
          study_days?: string[] | null
          study_hours?: number | null
          study_streak?: number | null
          subscription_end_date?: string | null
          subscription_product_id?: string | null
          subscription_status?: string | null
          total_mocks_completed?: number | null
          total_xp?: number | null
          unlocked_papers?: string[] | null
          updated_at?: string | null
          user_id: string
          weekly_mocks_used?: number | null
        }
        Update: {
          browser_notifications_enabled?: boolean | null
          country?: string | null
          created_at?: string | null
          daily_coach_messages_used?: number | null
          daily_flashcards_used?: number | null
          display_name?: string | null
          email_reminders_enabled?: boolean | null
          exam_session?: string | null
          id?: string
          is_opted_out_of_leaderboard?: boolean | null
          last_coach_reset_date?: string | null
          last_flashcard_reset_date?: string | null
          last_mock_reset_date?: string | null
          last_study_date?: string | null
          level?: number | null
          plan_type?: Database["public"]["Enums"]["plan_type"] | null
          selected_paper?: string | null
          selected_papers?: string[] | null
          stripe_customer_id?: string | null
          study_days?: string[] | null
          study_hours?: number | null
          study_streak?: number | null
          subscription_end_date?: string | null
          subscription_product_id?: string | null
          subscription_status?: string | null
          total_mocks_completed?: number | null
          total_xp?: number | null
          unlocked_papers?: string[] | null
          updated_at?: string | null
          user_id?: string
          weekly_mocks_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_selected_paper_fkey"
            columns: ["selected_paper"]
            isOneToOne: false
            referencedRelation: "papers"
            referencedColumns: ["paper_code"]
          },
        ]
      }
      user_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          paper_code: string
          syllabus_unit_id: string | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          paper_code: string
          syllabus_unit_id?: string | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          paper_code?: string
          syllabus_unit_id?: string | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_paper_code_fkey"
            columns: ["paper_code"]
            isOneToOne: false
            referencedRelation: "papers"
            referencedColumns: ["paper_code"]
          },
          {
            foreignKeyName: "user_progress_syllabus_unit_id_fkey"
            columns: ["syllabus_unit_id"]
            isOneToOne: false
            referencedRelation: "syllabus_units"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      xp_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          user_id: string
          xp_value: number
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          user_id: string
          xp_value: number
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          user_id?: string
          xp_value?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_leaderboard_rank: {
        Args: { p_user_id: string }
        Returns: {
          percentile_country: number
          percentile_global: number
          rank_country: number
          rank_global: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_opted_out_of_leaderboard: {
        Args: { _user_id: string }
        Returns: boolean
      }
      reset_daily_flashcard_counter: { Args: never; Returns: undefined }
      reset_weekly_mock_counter: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      plan_type: "free" | "per_paper" | "pro" | "elite"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      plan_type: ["free", "per_paper", "pro", "elite"],
    },
  },
} as const
