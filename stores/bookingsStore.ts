import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Booking = Database['public']['Tables']['bookings']['Row'];
type BookingInsert = Database['public']['Tables']['bookings']['Insert'];

interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  checked_in: number;
  completed: number;
  cancelled: number;
}

interface BookingsState {
  bookings: Booking[];
  allBookings: Booking[];
  currentBooking: Booking | null;
  stats: BookingStats | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  hasMore: boolean;
  page: number;

  // Actions
  fetchBookings: (page?: number, limit?: number, filters?: { search?: string; status?: string; showPending?: boolean; date?: string }) => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchBookingByReference: (reference: string) => Promise<Booking | null>;
  fetchBookingsByEmail: (email: string) => Promise<Booking[]>;
  createBooking: (booking: BookingInsert) => Promise<Booking | null>;
  updateBooking: (id: string, updates: Partial<BookingInsert>) => Promise<void>;
  cancelBooking: (id: string, reason: string) => Promise<void>;
  resetPagination: () => void;

  // Helpers
  generateBookingReference: () => string;
}

// Generate a unique booking reference (e.g., SCP-123456)
const generateReference = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `SCP-${timestamp}${random}`;
};

export const useBookingsStore = create<BookingsState>((set, get) => ({
  bookings: [],
  allBookings: [],
  currentBooking: null,
  stats: null,
  loading: false,
  error: null,
  initialized: false,
  hasMore: true,
  page: 0,

  generateBookingReference: () => {
    return generateReference();
  },

  resetPagination: () => {
    set({ page: 0, hasMore: true });
  },

  fetchStats: async () => {
    console.log('[BookingsStore] Fetching stats...');

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('status');

      if (error) throw error;

      const stats: BookingStats = {
        total: data?.length || 0,
        pending: data?.filter(b => b.status === 'pending').length || 0,
        confirmed: data?.filter(b => b.status === 'confirmed').length || 0,
        checked_in: data?.filter(b => b.status === 'checked_in').length || 0,
        completed: data?.filter(b => b.status === 'completed').length || 0,
        cancelled: data?.filter(b => b.status === 'cancelled').length || 0,
      };

      console.log('[BookingsStore] Fetched stats:', stats);
      set({ stats });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch stats';
      console.error('[BookingsStore] Error fetching stats:', errorMessage);
    }
  },

  fetchBookings: async (page = 0, limit = 50, filters?: { search?: string; status?: string; showPending?: boolean; date?: string }) => {
    console.log('[BookingsStore] Fetching bookings...', { page, limit, filters });
    set({ loading: true, error: null });

    try {
      const from = page * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('bookings')
        .select('*', { count: 'exact' });

      // Apply status filter
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      // Apply pending filter
      if (filters?.showPending === false) {
        query = query.neq('status', 'pending');
      }

      // Apply date filter (filter by drop-off or return date)
      if (filters?.date) {
        const dateStr = filters.date;
        const startOfDay = `${dateStr}T00:00:00`;
        const endOfDay = `${dateStr}T23:59:59`;
        // Match bookings where drop-off or return date is on the specified date
        query = query.or(
          `and(drop_off_datetime.gte.${startOfDay},drop_off_datetime.lte.${endOfDay}),` +
          `and(return_datetime.gte.${startOfDay},return_datetime.lte.${endOfDay})`
        );
      }

      // Apply search filter
      if (filters?.search && filters.search.trim()) {
        const search = filters.search.trim();
        query = query.or(
          `booking_reference.ilike.%${search}%,` +
          `first_name.ilike.%${search}%,` +
          `last_name.ilike.%${search}%,` +
          `email.ilike.%${search}%,` +
          `vehicle_registration.ilike.%${search}%`
        );
      }

      // Order and paginate
      query = query
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      console.log('[BookingsStore] Fetched bookings:', data?.length || 0, 'total:', count);

      const newBookings = data || [];
      const hasMore = count ? from + newBookings.length < count : false;

      set(state => ({
        bookings: page === 0 ? newBookings : [...state.bookings, ...newBookings],
        allBookings: page === 0 ? newBookings : [...state.allBookings, ...newBookings],
        loading: false,
        initialized: true,
        hasMore,
        page,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch bookings';
      console.error('[BookingsStore] Error fetching bookings:', errorMessage);
      set({ error: errorMessage, loading: false, initialized: true });
    }
  },

  fetchBookingByReference: async (reference: string) => {
    console.log('[BookingsStore] Fetching booking by reference:', reference);
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('booking_reference', reference)
        .single();

      if (error) throw error;

      console.log('[BookingsStore] Fetched booking:', data);
      set({ currentBooking: data, loading: false });
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch booking';
      console.error('[BookingsStore] Error fetching booking:', errorMessage);
      set({ error: errorMessage, loading: false, currentBooking: null });
      return null;
    }
  },

  fetchBookingsByEmail: async (email: string) => {
    console.log('[BookingsStore] Fetching bookings for email:', email);
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('[BookingsStore] Fetched bookings for email:', data?.length || 0);
      set({ bookings: data || [], loading: false });
      return data || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch bookings';
      console.error('[BookingsStore] Error fetching bookings:', errorMessage);
      set({ error: errorMessage, loading: false });
      return [];
    }
  },

  createBooking: async (bookingData: BookingInsert) => {
    console.log('[BookingsStore] Creating booking...');
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

      if (error) throw error;

      console.log('[BookingsStore] Booking created:', data);

      // Add to local state
      set(state => ({
        bookings: [data, ...state.bookings],
        currentBooking: data,
        loading: false
      }));

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create booking';
      console.error('[BookingsStore] Error creating booking:', errorMessage);
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  updateBooking: async (id: string, updates: Partial<BookingInsert>) => {
    console.log('[BookingsStore] Updating booking:', id);
    set({ error: null });

    try {
      const { data: updated, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      console.log('[BookingsStore] Booking updated:', updated);

      // Update local state with the full updated record from database
      set(state => ({
        bookings: state.bookings.map(b =>
          b.id === id ? updated : b
        )
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update booking';
      console.error('[BookingsStore] Error updating booking:', errorMessage);
      set({ error: errorMessage });
      throw error;
    }
  },

  cancelBooking: async (id: string, reason: string) => {
    console.log('[BookingsStore] Cancelling booking:', id);
    set({ loading: true, error: null });

    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          cancellation_reason: reason,
          cancelled_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      console.log('[BookingsStore] Booking cancelled');

      // Update local state
      set(state => ({
        bookings: state.bookings.map(b =>
          b.id === id
            ? { ...b, status: 'cancelled', cancellation_reason: reason, cancelled_at: new Date().toISOString() }
            : b
        ),
        loading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel booking';
      console.error('[BookingsStore] Error cancelling booking:', errorMessage);
      set({ error: errorMessage, loading: false });
    }
  },
}));
