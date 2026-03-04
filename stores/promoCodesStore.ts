import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface PromoCode {
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
}

interface ValidatePromoCodeResult {
  is_valid: boolean;
  discount_amount: number;
  message: string;
}

interface PromoCodesState {
  promoCodes: PromoCode[];
  loading: boolean;
  error: string | null;
  initialized: boolean;

  // Actions
  fetchPromoCodes: () => Promise<void>;
  createPromoCode: (data: Omit<PromoCode, 'id' | 'created_at' | 'updated_at' | 'current_uses'>) => Promise<void>;
  updatePromoCode: (id: string, data: Partial<Omit<PromoCode, 'id' | 'created_at' | 'updated_at'>>) => Promise<void>;
  deletePromoCode: (id: string) => Promise<void>;
  validatePromoCode: (code: string, bookingAmount: number) => Promise<ValidatePromoCodeResult>;
  incrementPromoCodeUsage: (code: string) => Promise<void>;
}

export const usePromoCodesStore = create<PromoCodesState>((set, get) => ({
  promoCodes: [],
  loading: false,
  error: null,
  initialized: false,

  // Fetch all promo codes
  fetchPromoCodes: async () => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ promoCodes: data || [], loading: false, initialized: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch promo codes';
      console.error('[PromoCodesStore] Error fetching promo codes:', errorMessage);
      set({ error: errorMessage, loading: false, initialized: true });
    }
  },

  // Create promo code
  createPromoCode: async (data) => {
    set({ error: null });

    try {
      const { data: newPromoCode, error } = await supabase
        .from('promo_codes')
        .insert({
          ...data,
          current_uses: 0,
        })
        .select()
        .single();

      if (error) {
        console.error('[PromoCodesStore] Create error:', error);
        throw error;
      }

      set(state => ({
        promoCodes: [newPromoCode, ...state.promoCodes]
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create promo code';
      console.error('[PromoCodesStore] Error:', errorMessage);
      set({ error: errorMessage });
      throw error;
    }
  },

  // Update promo code
  updatePromoCode: async (id, data) => {
    set({ error: null });

    try {
      const { data: updated, error } = await supabase
        .from('promo_codes')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[PromoCodesStore] Update error:', error);
        throw error;
      }

      set(state => ({
        promoCodes: state.promoCodes.map(pc => pc.id === id ? updated : pc)
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update promo code';
      console.error('[PromoCodesStore] Error:', errorMessage);
      set({ error: errorMessage });
      throw error;
    }
  },

  // Delete promo code
  deletePromoCode: async (id) => {
    set({ error: null });

    try {
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[PromoCodesStore] Delete error:', error);
        throw error;
      }

      set(state => ({
        promoCodes: state.promoCodes.filter(pc => pc.id !== id)
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete promo code';
      console.error('[PromoCodesStore] Error:', errorMessage);
      set({ error: errorMessage });
      throw error;
    }
  },

  // Validate promo code
  validatePromoCode: async (code: string, bookingAmount: number) => {

    try {
      // Convert pounds to pence for database (database expects INTEGER in pence)
      const bookingAmountInPence = Math.round(bookingAmount * 100);

      const { data, error } = await supabase.rpc('validate_promo_code', {
        p_code: code,
        p_booking_amount: bookingAmountInPence
      });

      if (error) {
        console.error('[PromoCodesStore] Validation error:', error);
        throw error;
      }


      // Convert discount_amount from pence back to pounds
      const result = data[0];
      return {
        is_valid: result.is_valid,
        discount_amount: result.discount_amount / 100, // Convert pence to pounds
        message: result.message
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to validate promo code';
      console.error('[PromoCodesStore] Error:', errorMessage);
      return {
        is_valid: false,
        discount_amount: 0,
        message: errorMessage
      };
    }
  },

  // Increment promo code usage
  incrementPromoCodeUsage: async (code: string) => {

    try {
      const { error } = await supabase.rpc('increment_promo_code_usage', {
        p_code: code
      });

      if (error) {
        console.error('[PromoCodesStore] Increment usage error:', error);
        throw error;
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to increment promo code usage';
      console.error('[PromoCodesStore] Error:', errorMessage);
      throw error;
    }
  },
}));
