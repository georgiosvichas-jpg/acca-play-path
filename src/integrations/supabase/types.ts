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
          question: string
          xp: number | null
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string | null
          difficulty?: string | null
          id?: string
          paper_code: string
          question: string
          xp?: number | null
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string | null
          difficulty?: string | null
          id?: string
          paper_code?: string
          question?: string
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
      syllabus_units: {
        Row: {
          chapter: string
          created_at: string | null
          estimated_minutes: number | null
          id: string
          learning_outcome: string | null
          paper_code: string
          priority: string | null
          unit_title: string
        }
        Insert: {
          chapter: string
          created_at?: string | null
          estimated_minutes?: number | null
          id?: string
          learning_outcome?: string | null
          paper_code: string
          priority?: string | null
          unit_title: string
        }
        Update: {
          chapter?: string
          created_at?: string | null
          estimated_minutes?: number | null
          id?: string
          learning_outcome?: string | null
          paper_code?: string
          priority?: string | null
          unit_title?: string
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
      user_profiles: {
        Row: {
          created_at: string | null
          id: string
          last_study_date: string | null
          plan_type: Database["public"]["Enums"]["plan_type"] | null
          selected_paper: string | null
          stripe_customer_id: string | null
          study_streak: number | null
          subscription_end_date: string | null
          subscription_product_id: string | null
          subscription_status: string | null
          total_xp: number | null
          unlocked_papers: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_study_date?: string | null
          plan_type?: Database["public"]["Enums"]["plan_type"] | null
          selected_paper?: string | null
          stripe_customer_id?: string | null
          study_streak?: number | null
          subscription_end_date?: string | null
          subscription_product_id?: string | null
          subscription_status?: string | null
          total_xp?: number | null
          unlocked_papers?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_study_date?: string | null
          plan_type?: Database["public"]["Enums"]["plan_type"] | null
          selected_paper?: string | null
          stripe_customer_id?: string | null
          study_streak?: number | null
          subscription_end_date?: string | null
          subscription_product_id?: string | null
          subscription_status?: string | null
          total_xp?: number | null
          unlocked_papers?: string[] | null
          updated_at?: string | null
          user_id?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      plan_type: "free" | "per_paper" | "pro"
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
      plan_type: ["free", "per_paper", "pro"],
    },
  },
} as const
