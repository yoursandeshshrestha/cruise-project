export interface PromoCodeFormData {
  id?: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: string;
  minimum_spend: string;
  max_uses: string;
  valid_from: Date | undefined;
  valid_until: Date | undefined;
}

export interface PromoCode {
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
}
