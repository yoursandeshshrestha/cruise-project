import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rsrfvklwthdubufpqjhq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzcmZ2a2x3dGhkdWJ1ZnBxamhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MTI3NTYsImV4cCI6MjA4NzE4ODc1Nn0.kznZNa6lefyodDEutrHc7u_Q4wnpOk123lzy1ELNZ0o';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Database types (will be auto-generated later)
export interface Database {
  public: {
    Tables: {
      bookings: {
        Row: {
          id: string;
          booking_reference: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          vehicle_registration: string;
          vehicle_make: string;
          vehicle_type: string;
          cruise_line: string;
          ship_name: string;
          terminal: string | null;
          drop_off_datetime: string;
          return_datetime: string;
          number_of_passengers: number;
          parking_type: string;
          add_ons: string[];
          subtotal: number;
          vat: number;
          total: number;
          discount: number;
          promo_code: string | null;
          stripe_payment_intent_id: string | null;
          stripe_charge_id: string | null;
          payment_status: string | null;
          status: 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled';
          cancellation_reason: string | null;
          refund_amount: number | null;
          refund_processed_at: string | null;
          internal_notes: string | null;
          created_at: string;
          updated_at: string;
          confirmed_at: string | null;
          checked_in_at: string | null;
          completed_at: string | null;
          cancelled_at: string | null;
        };
        Insert: {
          booking_reference: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          vehicle_registration: string;
          vehicle_make: string;
          vehicle_type?: string;
          cruise_line: string;
          ship_name: string;
          terminal?: string | null;
          drop_off_datetime: string;
          return_datetime: string;
          number_of_passengers: number;
          parking_type: string;
          add_ons?: string[];
          subtotal: number;
          vat: number;
          total: number;
          discount: number;
          promo_code?: string | null;
          stripe_payment_intent_id?: string | null;
          stripe_charge_id?: string | null;
          payment_status?: string | null;
          status: 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled';
          cancellation_reason?: string | null;
          refund_amount?: number | null;
          refund_processed_at?: string | null;
          internal_notes?: string | null;
          confirmed_at?: string | null;
          checked_in_at?: string | null;
          completed_at?: string | null;
          cancelled_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>;
      };
      add_ons: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          price: number;
          icon: string | null;
          is_active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['add_ons']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['add_ons']['Insert']>;
      };
      system_settings: {
        Row: {
          id: string;
          group_name: string;
          settings: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['system_settings']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['system_settings']['Insert']>;
      };
      seasonal_pricing: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          daily_rate: number;
          minimum_cost: number;
          start_date: string;
          end_date: string;
          is_active: boolean;
          priority: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['seasonal_pricing']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['seasonal_pricing']['Insert']>;
      };
      capacity_overrides: {
        Row: {
          id: string;
          date: string;
          max_capacity: number;
          current_bookings: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['capacity_overrides']['Row'], 'id' | 'created_at' | 'updated_at' | 'current_bookings'>;
        Update: Partial<Database['public']['Tables']['capacity_overrides']['Insert']>;
      };
      promo_codes: {
        Row: {
          id: string;
          code: string;
          description: string | null;
          discount_type: 'percentage' | 'fixed';
          discount_value: number;
          minimum_spend: number | null;
          max_uses: number | null;
          current_uses: number;
          valid_from: string;
          valid_until: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['promo_codes']['Row'], 'id' | 'created_at' | 'updated_at' | 'current_uses'>;
        Update: Partial<Database['public']['Tables']['promo_codes']['Insert']>;
      };
      cruise_lines: {
        Row: {
          id: string;
          name: string;
          ships: string[];
          is_active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['cruise_lines']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['cruise_lines']['Insert']>;
      };
      terminals: {
        Row: {
          id: string;
          name: string;
          location: string | null;
          description: string | null;
          is_active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['terminals']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['terminals']['Insert']>;
      };
      pricing_rules: {
        Row: {
          id: string;
          name: string;
          price_per_day: number;
          minimum_charge: number;
          vat_rate: number;
          start_date: string | null;
          end_date: string | null;
          is_active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['pricing_rules']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['pricing_rules']['Insert']>;
      };
      contact_submissions: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          subject: string | null;
          message: string;
          booking_reference: string | null;
          status: string;
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          email: string;
          phone?: string | null;
          subject?: string | null;
          message: string;
          booking_reference?: string | null;
          status?: string;
          admin_notes?: string | null;
        };
        Update: Partial<Database['public']['Tables']['contact_submissions']['Insert']>;
      };
    };
  };
}
