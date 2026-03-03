import type { Database } from '../../../lib/supabase';

export type PricingRule = Database['public']['Tables']['pricing_rules']['Row'];

export interface PricingFormData {
  id?: string;
  name: string;
  price_per_day: string;
  van_multiplier: string;
  vat_rate: string;
  start_date?: Date;
  end_date?: Date;
  is_active: boolean;
  priority: 1 | 2;
  reason?: string;
}
