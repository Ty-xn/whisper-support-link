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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      educational_content: {
        Row: {
          body: string
          created_at: string
          id: string
          is_sample: boolean
          reading_minutes: number
          scenario: Json | null
          slug: string
          sort_order: number
          summary: string
          title: string
          topic: string
          updated_at: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          is_sample?: boolean
          reading_minutes?: number
          scenario?: Json | null
          slug: string
          sort_order?: number
          summary?: string
          title: string
          topic: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_sample?: boolean
          reading_minutes?: number
          scenario?: Json | null
          slug?: string
          sort_order?: number
          summary?: string
          title?: string
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      emergency_contacts: {
        Row: {
          created_at: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          relationship: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          relationship?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          relationship?: string | null
          user_id?: string
        }
        Relationships: []
      }
      emergency_plans: {
        Row: {
          checklist: Json
          created_at: string
          emergency_numbers: Json
          id: string
          prewritten_message: string | null
          safe_location: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          checklist?: Json
          created_at?: string
          emergency_numbers?: Json
          id?: string
          prewritten_message?: string | null
          safe_location?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          checklist?: Json
          created_at?: string
          emergency_numbers?: Json
          id?: string
          prewritten_message?: string | null
          safe_location?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      journal_attachments: {
        Row: {
          created_at: string
          entry_id: string
          file_name: string | null
          id: string
          mime_type: string | null
          size_bytes: number | null
          storage_path: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entry_id: string
          file_name?: string | null
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path: string
          user_id: string
        }
        Update: {
          created_at?: string
          entry_id?: string
          file_name?: string | null
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_attachments_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          created_at: string
          description: string
          id: string
          incident_date: string | null
          incident_time: string | null
          location: string | null
          people_involved: string | null
          title: string
          updated_at: string
          user_id: string
          witnesses: string | null
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          incident_date?: string | null
          incident_time?: string | null
          location?: string | null
          people_involved?: string | null
          title: string
          updated_at?: string
          user_id: string
          witnesses?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          incident_date?: string | null
          incident_time?: string | null
          location?: string | null
          people_involved?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          witnesses?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      referral_pathways: {
        Row: {
          category_slug: string | null
          created_at: string
          id: string
          is_sample: boolean
          need_label: string
          need_slug: string
          sort_order: number
          step_description: string
          step_title: string
        }
        Insert: {
          category_slug?: string | null
          created_at?: string
          id?: string
          is_sample?: boolean
          need_label: string
          need_slug: string
          sort_order?: number
          step_description?: string
          step_title: string
        }
        Update: {
          category_slug?: string | null
          created_at?: string
          id?: string
          is_sample?: boolean
          need_label?: string
          need_slug?: string
          sort_order?: number
          step_description?: string
          step_title?: string
        }
        Relationships: []
      }
      service_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      support_services: {
        Row: {
          category_slug: string
          created_at: string
          description: string
          email: string | null
          hours: string | null
          id: string
          is_published: boolean
          is_sample: boolean
          last_verified_at: string | null
          location: string | null
          name: string
          phone: string | null
          updated_at: string
          verification_status: string
          website: string | null
        }
        Insert: {
          category_slug: string
          created_at?: string
          description?: string
          email?: string | null
          hours?: string | null
          id?: string
          is_published?: boolean
          is_sample?: boolean
          last_verified_at?: string | null
          location?: string | null
          name: string
          phone?: string | null
          updated_at?: string
          verification_status?: string
          website?: string | null
        }
        Update: {
          category_slug?: string
          created_at?: string
          description?: string
          email?: string | null
          hours?: string | null
          id?: string
          is_published?: boolean
          is_sample?: boolean
          last_verified_at?: string | null
          location?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
          verification_status?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_services_category_slug_fkey"
            columns: ["category_slug"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["slug"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
