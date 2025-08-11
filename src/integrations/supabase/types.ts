export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      answers: {
        Row: {
          id: string
          is_correct: boolean
          label: string
          question_id: string
        }
        Insert: {
          id?: string
          is_correct?: boolean
          label: string
          question_id: string
        }
        Update: {
          id?: string
          is_correct?: boolean
          label?: string
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          country: string
          created_at: string
          dialect_notes: string | null
          history_markdown: string
          id: string
          image_url: string | null
          name: string
          notable_people: string[]
          published: boolean
          region: string
          slug: string
          summary: string
          updated_at: string
        }
        Insert: {
          country: string
          created_at?: string
          dialect_notes?: string | null
          history_markdown: string
          id?: string
          image_url?: string | null
          name: string
          notable_people?: string[]
          published?: boolean
          region: string
          slug: string
          summary: string
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          dialect_notes?: string | null
          history_markdown?: string
          id?: string
          image_url?: string | null
          name?: string
          notable_people?: string[]
          published?: boolean
          region?: string
          slug?: string
          summary?: string
          updated_at?: string
        }
        Relationships: []
      }
      dialogue_lines: {
        Row: {
          audio_url: string | null
          dialect: Database["public"]["Enums"]["dialect_type"]
          dialogue_id: string
          id: string
          ipa: string | null
          line: string
          order_index: number
          speaker: string
        }
        Insert: {
          audio_url?: string | null
          dialect: Database["public"]["Enums"]["dialect_type"]
          dialogue_id: string
          id?: string
          ipa?: string | null
          line: string
          order_index: number
          speaker: string
        }
        Update: {
          audio_url?: string | null
          dialect?: Database["public"]["Enums"]["dialect_type"]
          dialogue_id?: string
          id?: string
          ipa?: string | null
          line?: string
          order_index?: number
          speaker?: string
        }
        Relationships: [
          {
            foreignKeyName: "dialogue_lines_dialogue_id_fkey"
            columns: ["dialogue_id"]
            isOneToOne: false
            referencedRelation: "dialogues"
            referencedColumns: ["id"]
          },
        ]
      }
      dialogues: {
        Row: {
          id: string
          lesson_id: string
          title: string
        }
        Insert: {
          id?: string
          lesson_id: string
          title: string
        }
        Update: {
          id?: string
          lesson_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "dialogues_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      figures: {
        Row: {
          bio_markdown: string
          created_at: string
          era: string
          field: string
          id: string
          image_url: string | null
          impact_markdown: string
          name: string
          published: boolean
          slug: string
          updated_at: string
        }
        Insert: {
          bio_markdown: string
          created_at?: string
          era: string
          field: string
          id?: string
          image_url?: string | null
          impact_markdown: string
          name: string
          published?: boolean
          slug: string
          updated_at?: string
        }
        Update: {
          bio_markdown?: string
          created_at?: string
          era?: string
          field?: string
          id?: string
          image_url?: string | null
          impact_markdown?: string
          name?: string
          published?: boolean
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      grammar_tips: {
        Row: {
          body_markdown: string
          id: string
          lesson_id: string
          title: string
        }
        Insert: {
          body_markdown: string
          id?: string
          lesson_id: string
          title: string
        }
        Update: {
          body_markdown?: string
          id?: string
          lesson_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "grammar_tips_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_sections: {
        Row: {
          created_at: string
          id: string
          lesson_id: string
          order_index: number
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id: string
          order_index?: number
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string
          order_index?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_sections_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          body_markdown: string
          cover_image_url: string | null
          created_at: string
          id: string
          level: Database["public"]["Enums"]["lesson_level"]
          published: boolean
          slug: string
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          body_markdown: string
          cover_image_url?: string | null
          created_at?: string
          id?: string
          level: Database["public"]["Enums"]["lesson_level"]
          published?: boolean
          slug: string
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          body_markdown?: string
          cover_image_url?: string | null
          created_at?: string
          id?: string
          level?: Database["public"]["Enums"]["lesson_level"]
          published?: boolean
          slug?: string
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          alt: string | null
          attributions: string | null
          created_at: string
          file_path: string
          id: string
          kind: Database["public"]["Enums"]["media_kind"]
        }
        Insert: {
          alt?: string | null
          attributions?: string | null
          created_at?: string
          file_path: string
          id?: string
          kind: Database["public"]["Enums"]["media_kind"]
        }
        Update: {
          alt?: string | null
          attributions?: string | null
          created_at?: string
          file_path?: string
          id?: string
          kind?: Database["public"]["Enums"]["media_kind"]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          dialect: Database["public"]["Enums"]["dialect_type"] | null
          display_name: string | null
          id: string
          region: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          dialect?: Database["public"]["Enums"]["dialect_type"] | null
          display_name?: string | null
          id: string
          region?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          dialect?: Database["public"]["Enums"]["dialect_type"] | null
          display_name?: string | null
          id?: string
          region?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          explanation: string | null
          id: string
          prompt: string
          quiz_id: string
          type: Database["public"]["Enums"]["question_type"]
        }
        Insert: {
          explanation?: string | null
          id?: string
          prompt: string
          quiz_id: string
          type: Database["public"]["Enums"]["question_type"]
        }
        Update: {
          explanation?: string | null
          id?: string
          prompt?: string
          quiz_id?: string
          type?: Database["public"]["Enums"]["question_type"]
        }
        Relationships: [
          {
            foreignKeyName: "questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          finished_at: string | null
          id: string
          quiz_id: string
          score: number
          started_at: string
          user_id: string
        }
        Insert: {
          finished_at?: string | null
          id?: string
          quiz_id: string
          score?: number
          started_at?: string
          user_id: string
        }
        Update: {
          finished_at?: string | null
          id?: string
          quiz_id?: string
          score?: number
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string
          id: string
          published: boolean
          ref_id: string | null
          scope: Database["public"]["Enums"]["quiz_scope"]
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          published?: boolean
          ref_id?: string | null
          scope: Database["public"]["Enums"]["quiz_scope"]
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          published?: boolean
          ref_id?: string | null
          scope?: Database["public"]["Enums"]["quiz_scope"]
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      saves: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      traditions: {
        Row: {
          created_at: string
          detail_markdown: string
          etiquette_markdown: string | null
          id: string
          image_url: string | null
          name: string
          published: boolean
          slug: string
          summary: string
          theme: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          detail_markdown: string
          etiquette_markdown?: string | null
          id?: string
          image_url?: string | null
          name: string
          published?: boolean
          slug: string
          summary: string
          theme: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          detail_markdown?: string
          etiquette_markdown?: string | null
          id?: string
          image_url?: string | null
          name?: string
          published?: boolean
          slug?: string
          summary?: string
          theme?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          id: string
          last_viewed_at: string
          lesson_id: string
          percent: number
          user_id: string
        }
        Insert: {
          id?: string
          last_viewed_at?: string
          lesson_id: string
          percent?: number
          user_id: string
        }
        Update: {
          id?: string
          last_viewed_at?: string
          lesson_id?: string
          percent?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vocab: {
        Row: {
          base_term: string
          eng_gloss: string
          id: string
          lesson_id: string | null
          notes: string | null
        }
        Insert: {
          base_term: string
          eng_gloss: string
          id?: string
          lesson_id?: string | null
          notes?: string | null
        }
        Update: {
          base_term?: string
          eng_gloss?: string
          id?: string
          lesson_id?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vocab_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      vocab_variants: {
        Row: {
          audio_url: string | null
          dialect: Database["public"]["Enums"]["dialect_type"]
          id: string
          ipa: string | null
          phrase: string
          vocab_id: string
        }
        Insert: {
          audio_url?: string | null
          dialect: Database["public"]["Enums"]["dialect_type"]
          id?: string
          ipa?: string | null
          phrase: string
          vocab_id: string
        }
        Update: {
          audio_url?: string | null
          dialect?: Database["public"]["Enums"]["dialect_type"]
          id?: string
          ipa?: string | null
          phrase?: string
          vocab_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vocab_variants_vocab_id_fkey"
            columns: ["vocab_id"]
            isOneToOne: false
            referencedRelation: "vocab"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_editor_or_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "user"
      dialect_type: "gheg" | "tosk"
      lesson_level: "beginner" | "intermediate" | "advanced"
      media_kind: "image" | "audio"
      question_type: "mcq" | "truefalse" | "fill"
      quiz_scope: "lesson" | "city" | "figure" | "tradition" | "general"
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
      app_role: ["admin", "editor", "user"],
      dialect_type: ["gheg", "tosk"],
      lesson_level: ["beginner", "intermediate", "advanced"],
      media_kind: ["image", "audio"],
      question_type: ["mcq", "truefalse", "fill"],
      quiz_scope: ["lesson", "city", "figure", "tradition", "general"],
    },
  },
} as const
