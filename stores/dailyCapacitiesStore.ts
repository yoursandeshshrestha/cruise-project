import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type DailyCapacity = Database['public']['Tables']['daily_capacities']['Row'];
type DailyCapacityInsert = Database['public']['Tables']['daily_capacities']['Insert'];

interface DailyCapacitiesState {
  dailyCapacities: Map<string, DailyCapacity>; // key is date string
  loading: boolean;
  error: string | null;

  // Actions
  fetchCapacitiesForMonth: (year: number, month: number) => Promise<void>;
  getCapacityForDate: (dateStr: string) => number | null;
  setCapacityForDate: (dateStr: string, capacity: number, notes?: string) => Promise<void>;
  deleteCapacityForDate: (dateStr: string) => Promise<void>;
}

export const useDailyCapacitiesStore = create<DailyCapacitiesState>((set, get) => ({
  dailyCapacities: new Map(),
  loading: false,
  error: null,

  fetchCapacitiesForMonth: async (year: number, month: number) => {
    set({ loading: true, error: null });

    try {
      // Get first and last day of month
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);

      const startDate = firstDay.toISOString().split('T')[0];
      const endDate = lastDay.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('daily_capacities')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) throw error;

      // Build map
      const capacitiesMap = new Map<string, DailyCapacity>();
      data?.forEach((capacity) => {
        capacitiesMap.set(capacity.date, capacity);
      });

      set({ dailyCapacities: capacitiesMap, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch capacities';
      console.error('[DailyCapacitiesStore] Error fetching capacities:', errorMessage);
      set({ error: errorMessage, loading: false });
    }
  },

  getCapacityForDate: (dateStr: string): number | null => {
    const capacity = get().dailyCapacities.get(dateStr);
    return capacity ? capacity.capacity : null;
  },

  setCapacityForDate: async (dateStr: string, capacity: number, notes?: string) => {
    set({ error: null });

    try {
      const { data, error } = await supabase
        .from('daily_capacities')
        .upsert({
          date: dateStr,
          capacity,
          notes: notes || null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'date',
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      const capacitiesMap = new Map(get().dailyCapacities);
      capacitiesMap.set(dateStr, data);
      set({ dailyCapacities: capacitiesMap });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to set capacity';
      console.error('[DailyCapacitiesStore] Error setting capacity:', errorMessage);
      set({ error: errorMessage });
      throw error;
    }
  },

  deleteCapacityForDate: async (dateStr: string) => {
    set({ error: null });

    try {
      const { error } = await supabase
        .from('daily_capacities')
        .delete()
        .eq('date', dateStr);

      if (error) throw error;

      // Update local state
      const capacitiesMap = new Map(get().dailyCapacities);
      capacitiesMap.delete(dateStr);
      set({ dailyCapacities: capacitiesMap });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete capacity';
      console.error('[DailyCapacitiesStore] Error deleting capacity:', errorMessage);
      set({ error: errorMessage });
      throw error;
    }
  },
}));
