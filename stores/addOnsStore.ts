import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface AddOn {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number; // in pence
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface AddOnsState {
  addOns: AddOn[];
  loading: boolean;
  error: string | null;
  initialized: boolean;

  // Actions
  fetchActiveAddOns: () => Promise<void>;
}

export const useAddOnsStore = create<AddOnsState>((set) => ({
  addOns: [],
  loading: false,
  error: null,
  initialized: false,

  // Fetch only active add-ons (public)
  fetchActiveAddOns: async () => {
    console.log('[AddOnsStore] Fetching active add-ons...');
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('add_ons')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      console.log('[AddOnsStore] Fetched active add-ons:', data?.length || 0);
      set({ addOns: data || [], loading: false, initialized: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch active add-ons';
      console.error('[AddOnsStore] Error fetching active add-ons:', errorMessage);
      set({ error: errorMessage, loading: false, initialized: true });
    }
  },
}));
