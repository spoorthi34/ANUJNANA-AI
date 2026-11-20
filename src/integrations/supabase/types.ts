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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      knowledge_chunks: {
        Row: {
          chapter_id: string | null
          chunk_index: number
          content: string
          created_at: string
          document_id: string
          embedding: string
          id: string
          owner_id: string | null
          page_number: number | null
          search_tsv: unknown
          section_index: number | null
          source_label: string
        }
        Insert: {
          chapter_id?: string | null
          chunk_index: number
          content: string
          created_at?: string
          document_id: string
          embedding: string
          id?: string
          owner_id?: string | null
          page_number?: number | null
          search_tsv?: unknown
          section_index?: number | null
          source_label: string
        }
        Update: {
          chapter_id?: string | null
          chunk_index?: number
          content?: string
          created_at?: string
          document_id?: string
          embedding?: string
          id?: string
          owner_id?: string | null
          page_number?: number | null
          search_tsv?: unknown
          section_index?: number | null
          source_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "knowledge_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_documents: {
        Row: {
          chunk_count: number
          course_version: string | null
          created_at: string
          error_message: string | null
          id: string
          mime_type: string | null
          owner_id: string | null
          page_count: number
          source_type: string
          status: string
          storage_path: string | null
          title: string
          updated_at: string
        }
        Insert: {
          chunk_count?: number
          course_version?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          mime_type?: string | null
          owner_id?: string | null
          page_count?: number
          source_type?: string
          status?: string
          storage_path?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          chunk_count?: number
          course_version?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          mime_type?: string | null
          owner_id?: string | null
          page_count?: number
          source_type?: string
          status?: string
          storage_path?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      learning_activities: {
        Row: {
          chapter_id: string | null
          created_at: string
          duration_seconds: number
          id: string
          kind: string
          score: number | null
          section_index: number | null
          total: number | null
          user_id: string
        }
        Insert: {
          chapter_id?: string | null
          created_at?: string
          duration_seconds?: number
          id?: string
          kind: string
          score?: number | null
          section_index?: number | null
          total?: number | null
          user_id: string
        }
        Update: {
          chapter_id?: string | null
          created_at?: string
          duration_seconds?: number
          id?: string
          kind?: string
          score?: number | null
          section_index?: number | null
          total?: number | null
          user_id?: string
        }
        Relationships: []
      }
      lesson_completions: {
        Row: {
          chapter_id: string
          completed_at: string
          id: string
          user_id: string
        }
        Insert: {
          chapter_id: string
          completed_at?: string
          id?: string
          user_id: string
        }
        Update: {
          chapter_id?: string
          completed_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          id: string
          prefers_relax_mode: boolean
          suggest_relax_on_low_focus: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string
          id: string
          prefers_relax_mode?: boolean
          suggest_relax_on_low_focus?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          prefers_relax_mode?: boolean
          suggest_relax_on_low_focus?: boolean
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_knowledge_chunks: {
        Args: {
          include_course?: boolean
          include_mine?: boolean
          match_count?: number
          query_embedding: string
          query_text: string
        }
        Returns: {
          chapter_id: string
          content: string
          document_id: string
          id: string
          keyword_rank: number
          owner_id: string
          page_number: number
          score: number
          section_index: number
          similarity: number
          source_label: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
