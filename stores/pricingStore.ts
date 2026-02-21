import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type PricingRule = Database['public']['Tables']['pricing_rules']['Row'];
type PricingRuleInsert = Database['public']['Tables']['pricing_rules']['Insert'];
type PricingRuleUpdate = Database['public']['Tables']['pricing_rules']['Update'];

interface PricingState {
  pricingRules: PricingRule[];
  activePricingRule: PricingRule | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  fetchPricingRules: () => Promise<void>;
  fetchActivePricingRule: () => Promise<void>;
  getPricingForDate: (date: Date) => PricingRule | null;
  createPricingRule: (data: PricingRuleInsert) => Promise<void>;
  updatePricingRule: (id: string, data: PricingRuleUpdate) => Promise<void>;
  deletePricingRule: (id: string) => Promise<void>;
  reorderPricingRules: (items: { id: string; display_order: number }[]) => Promise<void>;
}

export const usePricingStore = create<PricingState>((set, get) => ({
  pricingRules: [],
  activePricingRule: null,
  loading: false,
  initialized: false,
  error: null,

  fetchPricingRules: async () => {
    console.log('[PricingStore] Fetching pricing rules...');
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('pricing_rules')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('[PricingStore] Fetch error:', error);
        throw error;
      }

      console.log('[PricingStore] Loaded', data?.length || 0, 'pricing rules');
      set({ pricingRules: data || [], loading: false, initialized: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch pricing rules';
      console.error('[PricingStore] Error:', errorMessage);
      set({ error: errorMessage, loading: false, initialized: true });
    }
  },

  fetchActivePricingRule: async () => {
    console.log('[PricingStore] Fetching active pricing rule...');
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('pricing_rules')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('[PricingStore] Fetch active error:', error);
        throw error;
      }

      console.log('[PricingStore] Active pricing rule:', data);
      set({ activePricingRule: data, loading: false, initialized: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch active pricing rule';
      console.error('[PricingStore] Error:', errorMessage);
      set({ error: errorMessage, loading: false, initialized: true });
    }
  },

  /**
   * Get pricing rule for a specific date (useful for seasonal pricing)
   * Returns the active rule that matches the date range, or null if none found
   */
  getPricingForDate: (date: Date) => {
    const state = get();

    // Find active rules that match the date range
    const matchingRule = state.pricingRules.find(rule => {
      if (!rule.is_active) return false;

      // If no date range specified, it's a default rule
      if (!rule.start_date && !rule.end_date) return true;

      const targetDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format

      // Check if date falls within range
      const afterStart = !rule.start_date || targetDate >= rule.start_date;
      const beforeEnd = !rule.end_date || targetDate <= rule.end_date;

      return afterStart && beforeEnd;
    });

    return matchingRule || null;
  },

  createPricingRule: async (data: PricingRuleInsert) => {
    console.log('[PricingStore] Creating pricing rule:', data.name);
    set({ error: null });

    try {
      // Get the max display_order
      const { data: maxOrderData } = await supabase
        .from('pricing_rules')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextOrder = (maxOrderData?.display_order || 0) + 1;

      const newPricingRule: PricingRuleInsert = {
        ...data,
        display_order: data.display_order ?? nextOrder,
      };

      const { data: created, error } = await supabase
        .from('pricing_rules')
        .insert(newPricingRule)
        .select()
        .single();

      if (error) {
        console.error('[PricingStore] Create error:', error);
        throw error;
      }

      console.log('[PricingStore] Created pricing rule:', created);
      set(state => ({
        pricingRules: [...state.pricingRules, created]
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create pricing rule';
      console.error('[PricingStore] Error:', errorMessage);
      set({ error: errorMessage });
      throw error;
    }
  },

  updatePricingRule: async (id: string, data: PricingRuleUpdate) => {
    console.log('[PricingStore] Updating pricing rule:', id);
    set({ error: null });

    try {
      const { data: updated, error } = await supabase
        .from('pricing_rules')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[PricingStore] Update error:', error);
        throw error;
      }

      console.log('[PricingStore] Updated pricing rule:', updated);
      set(state => ({
        pricingRules: state.pricingRules.map(pr =>
          pr.id === id ? updated : pr
        ),
        // Update active pricing rule if it was the one updated
        activePricingRule: state.activePricingRule?.id === id ? updated : state.activePricingRule
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update pricing rule';
      console.error('[PricingStore] Error:', errorMessage);
      set({ error: errorMessage });
      throw error;
    }
  },

  deletePricingRule: async (id: string) => {
    console.log('[PricingStore] Deleting pricing rule:', id);
    set({ error: null });

    try {
      const { error } = await supabase
        .from('pricing_rules')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[PricingStore] Delete error:', error);
        throw error;
      }

      console.log('[PricingStore] Deleted pricing rule:', id);
      set(state => ({
        pricingRules: state.pricingRules.filter(pr => pr.id !== id),
        // Clear active pricing rule if it was deleted
        activePricingRule: state.activePricingRule?.id === id ? null : state.activePricingRule
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete pricing rule';
      console.error('[PricingStore] Error:', errorMessage);
      set({ error: errorMessage });
      throw error;
    }
  },

  reorderPricingRules: async (items: { id: string; display_order: number }[]) => {
    console.log('[PricingStore] Reordering pricing rules');
    set({ error: null });

    try {
      // Update all items in parallel
      const updates = items.map(item =>
        supabase
          .from('pricing_rules')
          .update({ display_order: item.display_order })
          .eq('id', item.id)
      );

      await Promise.all(updates);

      console.log('[PricingStore] Reordered pricing rules');

      // Update the local state with new order
      set(state => ({
        pricingRules: state.pricingRules
          .map(pr => {
            const updated = items.find(item => item.id === pr.id);
            return updated ? { ...pr, display_order: updated.display_order } : pr;
          })
          .sort((a, b) => a.display_order - b.display_order)
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reorder pricing rules';
      console.error('[PricingStore] Error:', errorMessage);
      set({ error: errorMessage });
      throw error;
    }
  },
}));
