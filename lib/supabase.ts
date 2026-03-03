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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      add_ons: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          last_login: string | null
          role: Database["public"]["Enums"]["admin_role"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          role?: Database["public"]["Enums"]["admin_role"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          role?: Database["public"]["Enums"]["admin_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          add_ons: Json | null
          amendment_history: Json | null
          booking_reference: string
          cancellation_reason: string | null
          cancelled_at: string | null
          checked_in_at: string | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string | null
          cruise_line: string
          discount: number | null
          drop_off_datetime: string
          email: string
          first_name: string
          id: string
          internal_notes: string | null
          last_name: string
          number_of_passengers: number
          parking_type: string | null
          payment_status: string | null
          phone: string
          promo_code: string | null
          refund_amount: number | null
          refund_processed_at: string | null
          return_datetime: string
          ship_name: string
          status: Database["public"]["Enums"]["booking_status"] | null
          stripe_charge_id: string | null
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          subtotal: number
          terminal: string | null
          total: number
          updated_at: string | null
          vat: number
          vehicle_make: string
          vehicle_registration: string
          vehicle_type: string
        }
        Insert: {
          add_ons?: Json | null
          amendment_history?: Json | null
          booking_reference: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          checked_in_at?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          cruise_line: string
          discount?: number | null
          drop_off_datetime: string
          email: string
          first_name: string
          id?: string
          internal_notes?: string | null
          last_name: string
          number_of_passengers: number
          parking_type?: string | null
          payment_status?: string | null
          phone: string
          promo_code?: string | null
          refund_amount?: number | null
          refund_processed_at?: string | null
          return_datetime: string
          ship_name: string
          status?: Database["public"]["Enums"]["booking_status"] | null
          stripe_charge_id?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal: number
          terminal?: string | null
          total: number
          updated_at?: string | null
          vat: number
          vehicle_make: string
          vehicle_registration: string
          vehicle_type?: string
        }
        Update: {
          add_ons?: Json | null
          amendment_history?: Json | null
          booking_reference?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          checked_in_at?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          cruise_line?: string
          discount?: number | null
          drop_off_datetime?: string
          email?: string
          first_name?: string
          id?: string
          internal_notes?: string | null
          last_name?: string
          number_of_passengers?: number
          parking_type?: string | null
          payment_status?: string | null
          phone?: string
          promo_code?: string | null
          refund_amount?: number | null
          refund_processed_at?: string | null
          return_datetime?: string
          ship_name?: string
          status?: Database["public"]["Enums"]["booking_status"] | null
          stripe_charge_id?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal?: number
          terminal?: string | null
          total?: number
          updated_at?: string | null
          vat?: number
          vehicle_make?: string
          vehicle_registration?: string
          vehicle_type?: string
        }
        Relationships: []
      }
      capacity_config: {
        Row: {
          created_at: string | null
          current_bookings: number | null
          date: string
          id: string
          max_capacity: number
          notes: string | null
          override_capacity: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_bookings?: number | null
          date: string
          id?: string
          max_capacity: number
          notes?: string | null
          override_capacity?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_bookings?: number | null
          date?: string
          id?: string
          max_capacity?: number
          notes?: string | null
          override_capacity?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          admin_notes: string | null
          booking_reference: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          booking_reference?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          booking_reference?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cruise_lines: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          ships: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          ships?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          ships?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_capacities: {
        Row: {
          capacity: number
          created_at: string | null
          date: string
          id: string
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          capacity: number
          created_at?: string | null
          date: string
          id?: string
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          capacity?: number
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      email_queue: {
        Row: {
          attempts: number | null
          created_at: string | null
          id: string
          last_error: string | null
          mailgun_message_id: string | null
          sent_at: string | null
          status: string | null
          template_name: string
          template_variables: Json | null
          to_email: string
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          id?: string
          last_error?: string | null
          mailgun_message_id?: string | null
          sent_at?: string | null
          status?: string | null
          template_name: string
          template_variables?: Json | null
          to_email: string
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          id?: string
          last_error?: string | null
          mailgun_message_id?: string | null
          sent_at?: string | null
          status?: string | null
          template_name?: string
          template_variables?: Json | null
          to_email?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          completed_at: string | null
          created_at: string
          id: string
          metadata: Json | null
          payment_type: string
          refund_amount: number | null
          refund_processed_at: string | null
          refund_reason: string | null
          status: string
          stripe_charge_id: string | null
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          subtotal: number
          vat: number
        }
        Insert: {
          amount: number
          booking_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          payment_type: string
          refund_amount?: number | null
          refund_processed_at?: string | null
          refund_reason?: string | null
          status?: string
          stripe_charge_id?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal: number
          vat: number
        }
        Update: {
          amount?: number
          booking_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          payment_type?: string
          refund_amount?: number | null
          refund_processed_at?: string | null
          refund_reason?: string | null
          status?: string
          stripe_charge_id?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal?: number
          vat?: number
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_rules: {
        Row: {
          created_at: string | null
          display_order: number
          end_date: string | null
          id: string
          is_active: boolean | null
          name: string
          price_per_day: number
          priority: number
          reason: string | null
          start_date: string | null
          updated_at: string | null
          van_multiplier: number
          vat_rate: number
        }
        Insert: {
          created_at?: string | null
          display_order?: number
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price_per_day?: number
          priority?: number
          reason?: string | null
          start_date?: string | null
          updated_at?: string | null
          van_multiplier?: number
          vat_rate?: number
        }
        Update: {
          created_at?: string | null
          display_order?: number
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_per_day?: number
          priority?: number
          reason?: string | null
          start_date?: string | null
          updated_at?: string | null
          van_multiplier?: number
          vat_rate?: number
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string | null
          current_uses: number | null
          description: string | null
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          id: string
          is_active: boolean | null
          max_uses: number | null
          minimum_spend: number | null
          updated_at: string | null
          valid_from: string
          valid_until: string
        }
        Insert: {
          code: string
          created_at?: string | null
          current_uses?: number | null
          description?: string | null
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          minimum_spend?: number | null
          updated_at?: string | null
          valid_from: string
          valid_until: string
        }
        Update: {
          code?: string
          created_at?: string | null
          current_uses?: number | null
          description?: string | null
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          minimum_spend?: number | null
          updated_at?: string | null
          valid_from?: string
          valid_until?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string
          group_name: string
          id: string
          settings: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          group_name: string
          id?: string
          settings?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          group_name?: string
          id?: string
          settings?: Json
          updated_at?: string
        }
        Relationships: []
      }
      terminals: {
        Row: {
          address: string | null
          code: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          latitude: number | null
          location: string | null
          longitude: number | null
          name: string
          postcode: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          code?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name: string
          postcode?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          code?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name?: string
          postcode?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_expired_pending_bookings: { Args: never; Returns: number }
      delete_current_user: { Args: never; Returns: undefined }
      generate_booking_reference: { Args: never; Returns: string }
      get_setting: { Args: { p_group: string; p_key: string }; Returns: string }
      increment_promo_code_usage: {
        Args: { p_code: string }
        Returns: undefined
      }
      validate_promo_code: {
        Args: { p_booking_amount: number; p_code: string }
        Returns: {
          discount_amount: number
          is_valid: boolean
          message: string
        }[]
      }
    }
    Enums: {
      admin_role: "admin" | "manager" | "staff"
      booking_status:
        | "pending"
        | "confirmed"
        | "checked_in"
        | "completed"
        | "cancelled"
      discount_type: "percentage" | "fixed"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      admin_role: ["admin", "manager", "staff"],
      booking_status: [
        "pending",
        "confirmed",
        "checked_in",
        "completed",
        "cancelled",
      ],
      discount_type: ["percentage", "fixed"],
    },
  },
} as const

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Type helpers for specific table types with proper JSONB typing
export interface AmendmentHistoryEntry {
  timestamp: string;
  changes: {
    dates?: {
      old: { drop_off: string; return: string };
      new: { drop_off: string; return: string };
    };
    vehicle?: {
      old: { type: string; make: string; registration: string };
      new: { type: string; make: string; registration: string };
    };
    payment?: {
      old: { subtotal: number; vat: number; total: number };
      new: { subtotal: number; vat: number; total: number };
    };
  };
}

export interface AddOnEntry {
  id: string;
  name: string;
  price: number;
}

// Extended types with proper JSONB typing
export type Booking = Omit<Database['public']['Tables']['bookings']['Row'], 'add_ons' | 'amendment_history'> & {
  add_ons: string[] | null; // Array of add-on slugs
  amendment_history: AmendmentHistoryEntry[] | null;
};

export type BookingInsert = Omit<Database['public']['Tables']['bookings']['Insert'], 'add_ons' | 'amendment_history'> & {
  add_ons?: string[] | null; // Array of add-on slugs
  amendment_history?: AmendmentHistoryEntry[] | null;
};

export type CruiseLine = Omit<Database['public']['Tables']['cruise_lines']['Row'], 'ships'> & {
  ships: string[];
};

export type Payment = Omit<Database['public']['Tables']['payments']['Row'], 'payment_type'> & {
  payment_type: 'new_booking' | 'amendment';
  bookings?: {
    booking_reference: string;
    first_name: string;
    last_name: string;
    email: string;
  };
};
