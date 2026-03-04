import { create } from 'zustand';
import { supabase, type CruiseLine } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type CruiseLineInsert = Database['public']['Tables']['cruise_lines']['Insert'];
type CruiseLineUpdate = Database['public']['Tables']['cruise_lines']['Update'];

interface CruiseLinesState {
  cruiseLines: CruiseLine[];
  loading: boolean;
  initialized: boolean;
  error: string | null;
  fetchCruiseLines: () => Promise<void>;
  fetchActiveCruiseLines: () => Promise<void>;
  createCruiseLine: (name: string, ships: string[]) => Promise<void>;
  updateCruiseLine: (id: string, data: CruiseLineUpdate) => Promise<void>;
  deleteCruiseLine: (id: string) => Promise<void>;
  reorderCruiseLines: (items: { id: string; display_order: number }[]) => Promise<void>;
}

export const useCruiseLinesStore = create<CruiseLinesState>((set, get) => ({
  cruiseLines: [],
  loading: false,
  initialized: false,
  error: null,

  fetchCruiseLines: async () => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('cruise_lines')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('[CruiseLinesStore] Fetch error:', error);
        throw error;
      }

      // Filter out any null/undefined entries to prevent runtime errors
      const validCruiseLines = (data || []).filter(line => line && line.name) as unknown as CruiseLine[];
      set({ cruiseLines: validCruiseLines, loading: false, initialized: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch cruise lines';
      console.error('[CruiseLinesStore] Error:', errorMessage);
      set({ error: errorMessage, loading: false, initialized: true });
    }
  },

  fetchActiveCruiseLines: async () => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('cruise_lines')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('[CruiseLinesStore] Fetch active error:', error);
        throw error;
      }

      // Filter out any null/undefined entries to prevent runtime errors
      const validCruiseLines = (data || []).filter(line => line && line.name) as unknown as CruiseLine[];
      set({ cruiseLines: validCruiseLines, loading: false, initialized: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch cruise lines';
      console.error('[CruiseLinesStore] Error:', errorMessage);
      set({ error: errorMessage, loading: false, initialized: true });
    }
  },

  createCruiseLine: async (name: string, ships: string[]) => {
    set({ error: null });

    try {
      // Get the max display_order
      const { data: maxOrderData } = await supabase
        .from('cruise_lines')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .single();

      const nextOrder = (maxOrderData?.display_order || 0) + 1;

      const newCruiseLine: CruiseLineInsert = {
        name,
        ships,
        is_active: true,
        display_order: nextOrder,
      };

      const { data, error } = await supabase
        .from('cruise_lines')
        .insert(newCruiseLine)
        .select()
        .single();

      if (error) {
        console.error('[CruiseLinesStore] Create error:', error);
        throw error;
      }

      set(state => ({
        cruiseLines: [...state.cruiseLines, data as unknown as CruiseLine]
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create cruise line';
      console.error('[CruiseLinesStore] Error:', errorMessage);
      set({ error: errorMessage });
      throw error;
    }
  },

  updateCruiseLine: async (id: string, data: CruiseLineUpdate) => {
    set({ error: null });

    try {
      const updateData: CruiseLineUpdate = {
        ...data,
      };

      const { data: updated, error } = await supabase
        .from('cruise_lines')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[CruiseLinesStore] Update error:', error);
        throw error;
      }

      set(state => ({
        cruiseLines: state.cruiseLines.map(cl =>
          cl.id === id ? updated as unknown as CruiseLine : cl
        )
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update cruise line';
      console.error('[CruiseLinesStore] Error:', errorMessage);
      set({ error: errorMessage });
      throw error;
    }
  },

  deleteCruiseLine: async (id: string) => {
    set({ error: null });

    try {
      const { error } = await supabase
        .from('cruise_lines')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[CruiseLinesStore] Delete error:', error);
        throw error;
      }

      set(state => ({
        cruiseLines: state.cruiseLines.filter(cl => cl.id !== id)
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete cruise line';
      console.error('[CruiseLinesStore] Error:', errorMessage);
      set({ error: errorMessage });
      throw error;
    }
  },

  reorderCruiseLines: async (items: { id: string; display_order: number }[]) => {
    set({ error: null });

    try {
      // Update all items in parallel
      const updates = items.map(item =>
        supabase
          .from('cruise_lines')
          .update({ display_order: item.display_order })
          .eq('id', item.id)
      );

      await Promise.all(updates);


      // Update the local state with new order
      set(state => ({
        cruiseLines: state.cruiseLines
          .map(cl => {
            const updated = items.find(item => item.id === cl.id);
            return updated ? { ...cl, display_order: updated.display_order } : cl;
          })
          .sort((a, b) => a.display_order - b.display_order)
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reorder cruise lines';
      console.error('[CruiseLinesStore] Error:', errorMessage);
      set({ error: errorMessage });
      throw error;
    }
  },
}));
