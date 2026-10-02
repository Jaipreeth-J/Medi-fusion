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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_emergency_response: boolean | null
          metadata: Json | null
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_emergency_response?: boolean | null
          metadata?: Json | null
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_emergency_response?: boolean | null
          metadata?: Json | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          is_emergency: boolean | null
          summary: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_emergency?: boolean | null
          summary?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_emergency?: boolean | null
          summary?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      drug_interactions: {
        Row: {
          analyzed_at: string
          created_at: string
          id: string
          interaction_summary: string
          medication_ids: string[]
          recommendations: string[] | null
          severity: string
          user_id: string
        }
        Insert: {
          analyzed_at?: string
          created_at?: string
          id?: string
          interaction_summary: string
          medication_ids: string[]
          recommendations?: string[] | null
          severity: string
          user_id: string
        }
        Update: {
          analyzed_at?: string
          created_at?: string
          id?: string
          interaction_summary?: string
          medication_ids?: string[]
          recommendations?: string[] | null
          severity?: string
          user_id?: string
        }
        Relationships: []
      }
      emergency_contacts: {
        Row: {
          contact_name: string
          created_at: string
          id: string
          is_active: boolean
          phone_number: string
          relationship: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_name: string
          created_at?: string
          id?: string
          is_active?: boolean
          phone_number: string
          relationship?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_name?: string
          created_at?: string
          id?: string
          is_active?: boolean
          phone_number?: string
          relationship?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      health_insights: {
        Row: {
          created_at: string
          data_sources: string[] | null
          id: string
          insight_type: string
          period_end: string | null
          period_start: string | null
          recommendations: string[] | null
          summary: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_sources?: string[] | null
          id?: string
          insight_type: string
          period_end?: string | null
          period_start?: string | null
          recommendations?: string[] | null
          summary: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_sources?: string[] | null
          id?: string
          insight_type?: string
          period_end?: string | null
          period_start?: string | null
          recommendations?: string[] | null
          summary?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      medical_images: {
        Row: {
          ai_summary: string | null
          analyzed_at: string | null
          body_part: string | null
          created_at: string
          description: string | null
          file_name: string
          file_path: string
          file_size_bytes: number | null
          file_type: string
          id: string
          image_type: string | null
          linked_conversation_id: string | null
          user_id: string
        }
        Insert: {
          ai_summary?: string | null
          analyzed_at?: string | null
          body_part?: string | null
          created_at?: string
          description?: string | null
          file_name: string
          file_path: string
          file_size_bytes?: number | null
          file_type: string
          id?: string
          image_type?: string | null
          linked_conversation_id?: string | null
          user_id: string
        }
        Update: {
          ai_summary?: string | null
          analyzed_at?: string | null
          body_part?: string | null
          created_at?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_size_bytes?: number | null
          file_type?: string
          id?: string
          image_type?: string | null
          linked_conversation_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_images_linked_conversation_id_fkey"
            columns: ["linked_conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_logs: {
        Row: {
          created_at: string
          id: string
          medication_id: string
          notes: string | null
          scheduled_time: string | null
          status: string
          taken_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          medication_id: string
          notes?: string | null
          scheduled_time?: string | null
          status?: string
          taken_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          medication_id?: string
          notes?: string | null
          scheduled_time?: string | null
          status?: string
          taken_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_logs_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          created_at: string
          dosage: string
          dosage_unit: string
          end_date: string | null
          frequency: string
          id: string
          instructions: string | null
          is_active: boolean
          last_notified_times: Json | null
          last_taken_at: string | null
          medication_name: string
          pharmacy: string | null
          prescribing_doctor: string | null
          purpose: string | null
          quantity_remaining: number | null
          refill_reminder_days: number | null
          schedule_times: string[] | null
          start_date: string
          times_per_day: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dosage: string
          dosage_unit?: string
          end_date?: string | null
          frequency: string
          id?: string
          instructions?: string | null
          is_active?: boolean
          last_notified_times?: Json | null
          last_taken_at?: string | null
          medication_name: string
          pharmacy?: string | null
          prescribing_doctor?: string | null
          purpose?: string | null
          quantity_remaining?: number | null
          refill_reminder_days?: number | null
          schedule_times?: string[] | null
          start_date?: string
          times_per_day?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dosage?: string
          dosage_unit?: string
          end_date?: string | null
          frequency?: string
          id?: string
          instructions?: string | null
          is_active?: boolean
          last_notified_times?: Json | null
          last_taken_at?: string | null
          medication_name?: string
          pharmacy?: string | null
          prescribing_doctor?: string | null
          purpose?: string | null
          quantity_remaining?: number | null
          refill_reminder_days?: number | null
          schedule_times?: string[] | null
          start_date?: string
          times_per_day?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mood_entries: {
        Row: {
          activities: string[] | null
          anxiety_level: number | null
          created_at: string
          energy_level: number | null
          gratitude_notes: string[] | null
          id: string
          journal_entry: string | null
          mood_score: number
          recorded_at: string
          sleep_quality: number | null
          stress_level: number | null
          triggers: string[] | null
          user_id: string
        }
        Insert: {
          activities?: string[] | null
          anxiety_level?: number | null
          created_at?: string
          energy_level?: number | null
          gratitude_notes?: string[] | null
          id?: string
          journal_entry?: string | null
          mood_score: number
          recorded_at?: string
          sleep_quality?: number | null
          stress_level?: number | null
          triggers?: string[] | null
          user_id: string
        }
        Update: {
          activities?: string[] | null
          anxiety_level?: number | null
          created_at?: string
          energy_level?: number | null
          gratitude_notes?: string[] | null
          id?: string
          journal_entry?: string | null
          mood_score?: number
          recorded_at?: string
          sleep_quality?: number | null
          stress_level?: number | null
          triggers?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          allergies: string[] | null
          avatar_url: string | null
          blood_type: string | null
          created_at: string
          date_of_birth: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          full_name: string | null
          gender: string | null
          height_cm: number | null
          id: string
          medical_conditions: string[] | null
          medications: string[] | null
          onboarding_completed: boolean | null
          updated_at: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          allergies?: string[] | null
          avatar_url?: string | null
          blood_type?: string | null
          created_at?: string
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          medical_conditions?: string[] | null
          medications?: string[] | null
          onboarding_completed?: boolean | null
          updated_at?: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          allergies?: string[] | null
          avatar_url?: string | null
          blood_type?: string | null
          created_at?: string
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          medical_conditions?: string[] | null
          medications?: string[] | null
          onboarding_completed?: boolean | null
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          function_name: string
          id: string
          request_count: number
          user_id: string
          window_start: string
        }
        Insert: {
          function_name: string
          id?: string
          request_count?: number
          user_id: string
          window_start?: string
        }
        Update: {
          function_name?: string
          id?: string
          request_count?: number
          user_id?: string
          window_start?: string
        }
        Relationships: []
      }
      sos_preferences: {
        Row: {
          created_at: string
          id: string
          send_to_contacts: boolean
          send_to_emergency_services: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          send_to_contacts?: boolean
          send_to_emergency_services?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          send_to_contacts?: boolean
          send_to_emergency_services?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      symptoms: {
        Row: {
          body_location: string | null
          created_at: string
          description: string | null
          duration_hours: number | null
          frequency: string | null
          id: string
          resolved_at: string | null
          severity: number
          started_at: string
          symptom_name: string
          user_id: string
        }
        Insert: {
          body_location?: string | null
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          frequency?: string | null
          id?: string
          resolved_at?: string | null
          severity: number
          started_at?: string
          symptom_name: string
          user_id: string
        }
        Update: {
          body_location?: string | null
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          frequency?: string | null
          id?: string
          resolved_at?: string | null
          severity?: number
          started_at?: string
          symptom_name?: string
          user_id?: string
        }
        Relationships: []
      }
      vitals: {
        Row: {
          activity_minutes: number | null
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          blood_sugar: number | null
          created_at: string
          device_name: string | null
          device_type: string | null
          health_platform: string | null
          heart_rate: number | null
          id: string
          notes: string | null
          recorded_at: string
          sleep_hours: number | null
          source_app: string | null
          spo2: number | null
          sync_source_chain: Json | null
          sync_timestamp: string | null
          temperature_celsius: number | null
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          activity_minutes?: number | null
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          blood_sugar?: number | null
          created_at?: string
          device_name?: string | null
          device_type?: string | null
          health_platform?: string | null
          heart_rate?: number | null
          id?: string
          notes?: string | null
          recorded_at?: string
          sleep_hours?: number | null
          source_app?: string | null
          spo2?: number | null
          sync_source_chain?: Json | null
          sync_timestamp?: string | null
          temperature_celsius?: number | null
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          activity_minutes?: number | null
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          blood_sugar?: number | null
          created_at?: string
          device_name?: string | null
          device_type?: string | null
          health_platform?: string | null
          heart_rate?: number | null
          id?: string
          notes?: string | null
          recorded_at?: string
          sleep_hours?: number | null
          source_app?: string | null
          spo2?: number | null
          sync_source_chain?: Json | null
          sync_timestamp?: string | null
          temperature_celsius?: number | null
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      wearable_connections: {
        Row: {
          created_at: string
          device_info: Json | null
          id: string
          is_active: boolean
          last_sync_at: string | null
          provider: string
          provider_user_id: string | null
          scopes: string[] | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          provider: string
          provider_user_id?: string | null
          scopes?: string[] | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          provider?: string
          provider_user_id?: string | null
          scopes?: string[] | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wearable_tokens: {
        Row: {
          access_token: string | null
          connection_id: string
          created_at: string
          id: string
          refresh_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          connection_id: string
          created_at?: string
          id?: string
          refresh_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          connection_id?: string
          created_at?: string
          id?: string
          refresh_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wearable_tokens_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: true
            referencedRelation: "wearable_connections"
            referencedColumns: ["id"]
          }
        ]
      }
      wearable_sync_logs: {
        Row: {
          completed_at: string | null
          connection_id: string | null
          created_at: string
          data_types: string[] | null
          error_message: string | null
          id: string
          records_synced: number | null
          started_at: string
          status: string
          sync_type: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          connection_id?: string | null
          created_at?: string
          data_types?: string[] | null
          error_message?: string | null
          id?: string
          records_synced?: number | null
          started_at?: string
          status?: string
          sync_type?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          connection_id?: string | null
          created_at?: string
          data_types?: string[] | null
          error_message?: string | null
          id?: string
          records_synced?: number | null
          started_at?: string
          status?: string
          sync_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wearable_sync_logs_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "wearable_connections"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: {
          p_function_name: string
          p_max_requests?: number
          p_user_id: string
          p_window_seconds?: number
        }
        Returns: boolean
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
    Enums: {},
  },
} as const
