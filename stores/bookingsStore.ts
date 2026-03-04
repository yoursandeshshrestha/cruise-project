import { create } from 'zustand';
import { supabase, type Database } from '../lib/supabase';
import type { Booking, BookingInsert } from '../lib/supabase';

interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  checked_in: number;
  completed: number;
  cancelled: number;
}

interface RevenueAnalytics {
  total_revenue: number;
  year_revenue: number;
  month_revenue: number;
  booking_count: number;
  avg_booking_value: number;
}

interface CancelBookingResult {
  success: boolean;
  message: string;
  refund_issued: boolean;
  refund_amount?: number;
  refund_id?: string;
  non_refundable?: boolean;
}

interface BookingsState {
  bookings: Booking[];
  allBookings: Booking[];
  currentBooking: Booking | null;
  stats: BookingStats | null;
  revenueAnalytics: RevenueAnalytics | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  hasMore: boolean;
  page: number;

  // Actions
  fetchBookings: (page?: number, limit?: number, filters?: { search?: string; status?: string; showPending?: boolean; date?: string }) => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchRevenueAnalytics: () => Promise<void>;
  fetchBookingByReference: (reference: string) => Promise<Booking | null>;
  fetchBookingsByEmail: (email: string) => Promise<Booking[]>;
  createBooking: (booking: BookingInsert) => Promise<Booking | null>;
  updateBooking: (id: string, updates: Partial<Database['public']['Tables']['bookings']['Update']>) => Promise<void>;
  cancelBooking: (id: string, reason: string) => Promise<CancelBookingResult>;
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
  revenueAnalytics: null,
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

      set({ stats });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch stats';
      console.error('[BookingsStore] Error fetching stats:', errorMessage);
    }
  },

  fetchRevenueAnalytics: async () => {
    try {
      // @ts-ignore - Custom RPC function not in generated types
      const { data, error } = await supabase.rpc('get_revenue_analytics');

      if (error) throw error;

      if (data && Array.isArray(data) && data.length > 0) {
        const analytics = data[0] as Record<string, number>;
        set({
          revenueAnalytics: {
            total_revenue: Number(analytics.total_revenue),
            year_revenue: Number(analytics.year_revenue),
            month_revenue: Number(analytics.month_revenue),
            booking_count: Number(analytics.booking_count),
            avg_booking_value: Number(analytics.avg_booking_value),
          }
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch revenue analytics';
      console.error('[BookingsStore] Error fetching revenue analytics:', errorMessage);
    }
  },

  fetchBookings: async (page = 0, limit = 50, filters?: { search?: string; status?: string; showPending?: boolean; date?: string }) => {
    set({ loading: true, error: null });

    try {
      const from = page * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('bookings')
        .select('*', { count: 'exact' });

      // Apply status filter
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status as 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled');
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


      const newBookings = data || [];
      const hasMore = count ? from + newBookings.length < count : false;

      set(state => ({
        bookings: page === 0 ? (newBookings as unknown as Booking[]) : [...state.bookings, ...(newBookings as unknown as Booking[])],
        allBookings: page === 0 ? (newBookings as unknown as Booking[]) : [...state.allBookings, ...(newBookings as unknown as Booking[])],
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
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('booking_reference', reference)
        .single();

      if (error) throw error;

      set({ currentBooking: data as unknown as Booking, loading: false });
      return data as unknown as Booking;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch booking';
      console.error('[BookingsStore] Error fetching booking:', errorMessage);
      set({ error: errorMessage, loading: false, currentBooking: null });
      return null;
    }
  },

  fetchBookingsByEmail: async (email: string) => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ bookings: (data || []) as unknown as Booking[], loading: false });
      return (data || []) as unknown as Booking[];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch bookings';
      console.error('[BookingsStore] Error fetching bookings:', errorMessage);
      set({ error: errorMessage, loading: false });
      return [];
    }
  },

  createBooking: async (bookingData: BookingInsert) => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData as any)
        .select()
        .single();

      if (error) throw error;


      // Add to local state
      set(state => ({
        bookings: [data as unknown as Booking, ...state.bookings],
        currentBooking: data as unknown as Booking,
        loading: false
      }));

      return data as unknown as Booking;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create booking';
      console.error('[BookingsStore] Error creating booking:', errorMessage);
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  updateBooking: async (id: string, updates: Partial<Database['public']['Tables']['bookings']['Update']>) => {
    set({ error: null });

    try {
      const { data: updated, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;


      // Update local state with the full updated record from database
      set(state => ({
        bookings: state.bookings.map(b =>
          b.id === id ? updated as unknown as Booking : b
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
    set({ loading: true, error: null });

    try {
      // Call the cancel-booking edge function which handles refund and email
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('Supabase URL is not configured');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/cancel-booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_id: id,
          reason: reason,
        }),
      });

      const result = await response.json() as CancelBookingResult;

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to cancel booking');
      }

      // Fetch updated booking from database
      const { data: updatedBooking, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Update local state with the full updated record
      set(state => ({
        bookings: state.bookings.map(b =>
          b.id === id ? updatedBooking as unknown as Booking : b
        ),
        loading: false
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel booking';
      console.error('[BookingsStore] Error cancelling booking:', errorMessage);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },
}));
