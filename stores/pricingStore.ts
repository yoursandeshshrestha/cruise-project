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

      set({ pricingRules: data || [], loading: false, initialized: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch pricing rules';
      console.error('[PricingStore] Error:', errorMessage);
      set({ error: errorMessage, loading: false, initialized: true });
    }
  },

  fetchActivePricingRule: async () => {
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

      set({ activePricingRule: data, loading: false, initialized: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch active pricing rule';
      console.error('[PricingStore] Error:', errorMessage);
      set({ error: errorMessage, loading: false, initialized: true });
    }
  },

  /**
   * Get pricing rule for a specific date with priority system
   * Priority 1 (custom pricing) overrides Priority 2 (standard pricing)
   * Returns the highest priority active rule that matches the date range
   */
  getPricingForDate: (date: Date) => {
    const state = get();
    const targetDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format

    // Find all active rules that match the date range
    const matchingRules = state.pricingRules.filter(rule => {
      if (!rule.is_active) return false;

      // If no date range specified, it's a year-round rule (standard pricing)
      if (!rule.start_date && !rule.end_date) return true;

      // Check if date falls within range
      const afterStart = !rule.start_date || targetDate >= rule.start_date;
      const beforeEnd = !rule.end_date || targetDate <= rule.end_date;

      return afterStart && beforeEnd;
    });

    // Sort by priority (ascending: 1 = highest priority, 2 = lowest priority)
    // If multiple rules have the same priority, prefer the one with more specific date range
    matchingRules.sort((a, b) => {
      const priorityA = a.priority || 2;
      const priorityB = b.priority || 2;

      // First compare by priority
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // If same priority, prefer rules with date ranges (more specific)
      const hasRangeA = a.start_date && a.end_date ? 1 : 0;
      const hasRangeB = b.start_date && b.end_date ? 1 : 0;

      return hasRangeB - hasRangeA;
    });

    // Return the highest priority matching rule
    return matchingRules[0] || null;
  },

  createPricingRule: async (data: PricingRuleInsert) => {
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
