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
      class_actions: {
        Row: {
          adhesion_deadline: string | null
          adhesion_url: string | null
          case_number: string | null
          created_at: string | null
          id: string
          last_checked_at: string | null
          opportunity_id: string | null
          organizer: string
          source_url: string | null
          status: string | null
          tribunal: string | null
          updated_at: string | null
        }
        Insert: {
          adhesion_deadline?: string | null
          adhesion_url?: string | null
          case_number?: string | null
          created_at?: string | null
          id?: string
          last_checked_at?: string | null
          opportunity_id?: string | null
          organizer: string
          source_url?: string | null
          status?: string | null
          tribunal?: string | null
          updated_at?: string | null
        }
        Update: {
          adhesion_deadline?: string | null
          adhesion_url?: string | null
          case_number?: string | null
          created_at?: string | null
          id?: string
          last_checked_at?: string | null
          opportunity_id?: string | null
          organizer?: string
          source_url?: string | null
          status?: string | null
          tribunal?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_actions_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      company_contacts: {
        Row: {
          category: string
          created_at: string
          email_reclami: string | null
          id: string
          indirizzo_sede_legale: string | null
          name: string
          note: string | null
          pec_reclami: string | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          email_reclami?: string | null
          id?: string
          indirizzo_sede_legale?: string | null
          name: string
          note?: string | null
          pec_reclami?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          email_reclami?: string | null
          id?: string
          indirizzo_sede_legale?: string | null
          name?: string
          note?: string | null
          pec_reclami?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          parsed_data: Json | null
          processing_status: string | null
          source: string | null
          type: Database["public"]["Enums"]["document_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          parsed_data?: Json | null
          processing_status?: string | null
          source?: string | null
          type: Database["public"]["Enums"]["document_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          parsed_data?: Json | null
          processing_status?: string | null
          source?: string | null
          type?: Database["public"]["Enums"]["document_type"]
          user_id?: string
        }
        Relationships: []
      }
      email_connections: {
        Row: {
          created_at: string
          email_address: string
          emails_scanned: number | null
          encrypted_password: string
          error_message: string | null
          id: string
          imap_port: number
          imap_server: string
          last_sync_at: string | null
          opportunities_found: number | null
          provider: string
          status: Database["public"]["Enums"]["email_connection_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_address: string
          emails_scanned?: number | null
          encrypted_password: string
          error_message?: string | null
          id?: string
          imap_port?: number
          imap_server: string
          last_sync_at?: string | null
          opportunities_found?: number | null
          provider?: string
          status?: Database["public"]["Enums"]["email_connection_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_address?: string
          emails_scanned?: number | null
          encrypted_password?: string
          error_message?: string | null
          id?: string
          imap_port?: number
          imap_server?: string
          last_sync_at?: string | null
          opportunities_found?: number | null
          provider?: string
          status?: Database["public"]["Enums"]["email_connection_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      generated_requests: {
        Row: {
          content: string
          created_at: string
          id: string
          recipient: string | null
          subject: string | null
          type: Database["public"]["Enums"]["request_type"]
          user_opportunity_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          recipient?: string | null
          subject?: string | null
          type: Database["public"]["Enums"]["request_type"]
          user_opportunity_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          recipient?: string | null
          subject?: string | null
          type?: Database["public"]["Enums"]["request_type"]
          user_opportunity_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_requests_user_opportunity_id_fkey"
            columns: ["user_opportunity_id"]
            isOneToOne: false
            referencedRelation: "user_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      news_articles: {
        Row: {
          category: string
          content: string
          created_at: string | null
          excerpt: string
          featured_image_url: string | null
          id: string
          is_published: boolean | null
          keywords: string[]
          meta_description: string
          published_at: string | null
          reading_time_minutes: number | null
          slug: string
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          excerpt: string
          featured_image_url?: string | null
          id?: string
          is_published?: boolean | null
          keywords?: string[]
          meta_description: string
          published_at?: string | null
          reading_time_minutes?: number | null
          slug: string
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          excerpt?: string
          featured_image_url?: string | null
          id?: string
          is_published?: boolean | null
          keywords?: string[]
          meta_description?: string
          published_at?: string | null
          reading_time_minutes?: number | null
          slug?: string
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          message: string | null
          read: boolean | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          active: boolean | null
          category: Database["public"]["Enums"]["opportunity_category"]
          created_at: string
          deadline_days: number | null
          description: string | null
          id: string
          legal_reference: string | null
          max_amount: number | null
          min_amount: number | null
          rules: Json | null
          short_description: string | null
          source_url: string | null
          template_email: string | null
          template_form: string | null
          template_pec: string | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          category: Database["public"]["Enums"]["opportunity_category"]
          created_at?: string
          deadline_days?: number | null
          description?: string | null
          id?: string
          legal_reference?: string | null
          max_amount?: number | null
          min_amount?: number | null
          rules?: Json | null
          short_description?: string | null
          source_url?: string | null
          template_email?: string | null
          template_form?: string | null
          template_pec?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          category?: Database["public"]["Enums"]["opportunity_category"]
          created_at?: string
          deadline_days?: number | null
          description?: string | null
          id?: string
          legal_reference?: string | null
          max_amount?: number | null
          min_amount?: number | null
          rules?: Json | null
          short_description?: string | null
          source_url?: string | null
          template_email?: string | null
          template_form?: string | null
          template_pec?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          estimated_total_recovery: number | null
          full_name: string | null
          id: string
          onboarding_completed: boolean | null
          phone: string | null
          quiz_answers: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          estimated_total_recovery?: number | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          phone?: string | null
          quiz_answers?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          estimated_total_recovery?: number | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          phone?: string | null
          quiz_answers?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          converted_at: string | null
          created_at: string
          id: string
          invited_email: string | null
          opportunity_id: string | null
          referral_code: string
          referred_id: string | null
          referrer_id: string
          source: string
          status: string
        }
        Insert: {
          converted_at?: string | null
          created_at?: string
          id?: string
          invited_email?: string | null
          opportunity_id?: string | null
          referral_code: string
          referred_id?: string | null
          referrer_id: string
          source?: string
          status?: string
        }
        Update: {
          converted_at?: string | null
          created_at?: string
          id?: string
          invited_email?: string | null
          opportunity_id?: string | null
          referral_code?: string
          referred_id?: string | null
          referrer_id?: string
          source?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      refund_parameters: {
        Row: {
          category: string
          created_at: string | null
          id: string
          parameter_name: string
          source: string | null
          unit: string | null
          updated_at: string | null
          valid_from: string
          valid_to: string | null
          value: number
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          parameter_name: string
          source?: string | null
          unit?: string | null
          updated_at?: string | null
          valid_from: string
          valid_to?: string | null
          value: number
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          parameter_name?: string
          source?: string | null
          unit?: string | null
          updated_at?: string | null
          valid_from?: string
          valid_to?: string | null
          value?: number
        }
        Relationships: []
      }
      scanned_emails: {
        Row: {
          analysis_result: Json | null
          analyzed: boolean | null
          body_preview: string | null
          connection_id: string
          created_at: string
          id: string
          message_id: string
          opportunity_id: string | null
          received_at: string | null
          sender: string | null
          sender_domain: string | null
          subject: string | null
          user_id: string
          user_opportunity_id: string | null
        }
        Insert: {
          analysis_result?: Json | null
          analyzed?: boolean | null
          body_preview?: string | null
          connection_id: string
          created_at?: string
          id?: string
          message_id: string
          opportunity_id?: string | null
          received_at?: string | null
          sender?: string | null
          sender_domain?: string | null
          subject?: string | null
          user_id: string
          user_opportunity_id?: string | null
        }
        Update: {
          analysis_result?: Json | null
          analyzed?: boolean | null
          body_preview?: string | null
          connection_id?: string
          created_at?: string
          id?: string
          message_id?: string
          opportunity_id?: string | null
          received_at?: string | null
          sender?: string | null
          sender_domain?: string | null
          subject?: string | null
          user_id?: string
          user_opportunity_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scanned_emails_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "email_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scanned_emails_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scanned_emails_user_opportunity_id_fkey"
            columns: ["user_opportunity_id"]
            isOneToOne: false
            referencedRelation: "user_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_successes: {
        Row: {
          amount_recovered: number
          anonymous_name: string
          category: string
          company_name: string
          created_at: string
          id: string
          is_public: boolean
          message: string | null
          user_id: string
          user_opportunity_id: string
        }
        Insert: {
          amount_recovered: number
          anonymous_name: string
          category: string
          company_name: string
          created_at?: string
          id?: string
          is_public?: boolean
          message?: string | null
          user_id: string
          user_opportunity_id: string
        }
        Update: {
          amount_recovered?: number
          anonymous_name?: string
          category?: string
          company_name?: string
          created_at?: string
          id?: string
          is_public?: boolean
          message?: string | null
          user_id?: string
          user_opportunity_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_successes_user_opportunity_id_fkey"
            columns: ["user_opportunity_id"]
            isOneToOne: false
            referencedRelation: "user_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          starts_at: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          starts_at?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          starts_at?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_opportunities: {
        Row: {
          actual_amount: number | null
          completed_at: string | null
          created_at: string
          deadline: string | null
          estimated_amount: number | null
          id: string
          matched_data: Json | null
          notes: string | null
          opportunity_id: string
          outcome: string | null
          status: Database["public"]["Enums"]["opportunity_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_amount?: number | null
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          estimated_amount?: number | null
          id?: string
          matched_data?: Json | null
          notes?: string | null
          opportunity_id: string
          outcome?: string | null
          status?: Database["public"]["Enums"]["opportunity_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_amount?: number | null
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          estimated_amount?: number | null
          id?: string
          matched_data?: Json | null
          notes?: string | null
          opportunity_id?: string
          outcome?: string | null
          status?: Database["public"]["Enums"]["opportunity_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_opportunities_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
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
          role?: Database["public"]["Enums"]["app_role"]
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
      user_stats: {
        Row: {
          badges: Json
          created_at: string
          id: string
          referral_code: string
          successful_referrals: number
          total_recovered: number
          total_referrals: number
          updated_at: string
          user_id: string
        }
        Insert: {
          badges?: Json
          created_at?: string
          id?: string
          referral_code: string
          successful_referrals?: number
          total_recovered?: number
          total_referrals?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          badges?: Json
          created_at?: string
          id?: string
          referral_code?: string
          successful_referrals?: number
          total_recovered?: number
          total_referrals?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_referral_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_article_views: {
        Args: { article_slug: string }
        Returns: undefined
      }
      owns_user_opportunity: {
        Args: { _user_opportunity_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      document_type: "email" | "pdf" | "image"
      email_connection_status:
        | "connected"
        | "error"
        | "credentials_expired"
        | "syncing"
      notification_type: "new_opportunity" | "deadline" | "reminder" | "system"
      opportunity_category:
        | "flight"
        | "ecommerce"
        | "bank"
        | "insurance"
        | "warranty"
        | "other"
        | "telecom"
        | "energy"
        | "transport"
        | "automotive"
        | "tech"
        | "class_action"
      opportunity_status: "found" | "started" | "sent" | "completed" | "expired"
      request_type: "email" | "pec" | "form"
      subscription_plan: "free" | "monthly" | "annual"
      subscription_status: "active" | "cancelled" | "expired" | "pending"
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
      document_type: ["email", "pdf", "image"],
      email_connection_status: [
        "connected",
        "error",
        "credentials_expired",
        "syncing",
      ],
      notification_type: ["new_opportunity", "deadline", "reminder", "system"],
      opportunity_category: [
        "flight",
        "ecommerce",
        "bank",
        "insurance",
        "warranty",
        "other",
        "telecom",
        "energy",
        "transport",
        "automotive",
        "tech",
        "class_action",
      ],
      opportunity_status: ["found", "started", "sent", "completed", "expired"],
      request_type: ["email", "pec", "form"],
      subscription_plan: ["free", "monthly", "annual"],
      subscription_status: ["active", "cancelled", "expired", "pending"],
    },
  },
} as const
