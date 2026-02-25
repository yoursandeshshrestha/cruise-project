import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { startOfDay, endOfDay } from 'date-fns';

interface NotificationsState {
  arrivalsCount: number;
  newContactSubmissionsCount: number;
  initialized: boolean;
  subscriptions: any[];
  initialize: () => Promise<void>;
  cleanup: () => void;
  fetchArrivalsCount: () => Promise<void>;
  fetchNewContactSubmissionsCount: () => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  arrivalsCount: 0,
  newContactSubmissionsCount: 0,
  initialized: false,
  subscriptions: [],

  fetchArrivalsCount: async () => {
    try {
      const now = new Date();
      const todayStart = startOfDay(now).toISOString();
      const todayEnd = endOfDay(now).toISOString();

      const { count, error } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .gte('drop_off_datetime', todayStart)
        .lte('drop_off_datetime', todayEnd)
        .in('status', ['confirmed', 'checked_in']);

      if (error) throw error;

      set({ arrivalsCount: count || 0 });
    } catch (error) {
      console.error('Error fetching arrivals count:', error);
    }
  },

  fetchNewContactSubmissionsCount: async () => {
    try {
      const { count, error } = await supabase
        .from('contact_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new');

      if (error) throw error;

      set({ newContactSubmissionsCount: count || 0 });
    } catch (error) {
      console.error('Error fetching new contact submissions count:', error);
    }
  },

  initialize: async () => {
    const state = get();
    if (state.initialized) {
      console.log('[NotificationsStore] Already initialized, skipping');
      return;
    }

    console.log('[NotificationsStore] Initializing...');

    // Mark as initialized immediately to prevent re-initialization during rapid mount/unmount
    set({ initialized: true });

    // Fetch initial counts
    await state.fetchArrivalsCount();
    await state.fetchNewContactSubmissionsCount();

    // Real-time disabled due to persistent Supabase server-side binding issue
    // User can manually refresh the page to see updated counts

    console.log('[NotificationsStore] Setup complete (Real-time disabled)');
  },

  cleanup: () => {
    console.log('[NotificationsStore] Cleaning up...');
    set({ subscriptions: [], initialized: false });
  },
}));
