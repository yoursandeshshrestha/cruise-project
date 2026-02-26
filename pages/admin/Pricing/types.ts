import type { Database } from '../../../lib/supabase';

export type PricingRule = Database['public']['Tables']['pricing_rules']['Row'];

export interface PricingFormData {
  id?: string;
  name: string;
  vat_rate: string;
  base_car_price: string;
  base_van_price: string;
  additional_day_rate: string;
  additional_day_rate_van: string;
  start_date?: Date;
  end_date?: Date;
  is_active: boolean;
  priority: 1 | 2;
  reason?: string;
}
