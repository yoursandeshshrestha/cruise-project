import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Booking = Database['public']['Tables']['bookings']['Row'];
type BookingInsert = Database['public']['Tables']['bookings']['Insert'];

interface BookingsState {
  bookings: Booking[];
  currentBooking: Booking | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;

  // Actions
  fetchBookings: (searchQuery?: string, statusFilter?: string) => Promise<void>;
  fetchBookingByReference: (reference: string) => Promise<Booking | null>;
  fetchBookingsByEmail: (email: string) => Promise<Booking[]>;
  createBooking: (booking: BookingInsert) => Promise<Booking | null>;
  updateBooking: (id: string, updates: Partial<BookingInsert>) => Promise<void>;
  cancelBooking: (id: string, reason: string) => Promise<void>;

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
  currentBooking: null,
  loading: false,
  error: null,
  initialized: false,

  generateBookingReference: () => {
    return generateReference();
  },

  fetchBookings: async (searchQuery?: string, statusFilter?: string) => {
    console.log('[BookingsStore] Fetching bookings...', { searchQuery, statusFilter });
    set({ loading: true, error: null });

    try {
      let query = supabase
        .from('bookings')
        .select('*');

      // Apply status filter
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      // Apply search filter - search across multiple fields using OR
      if (searchQuery && searchQuery.trim()) {
        const search = searchQuery.trim().toLowerCase();
        query = query.or(
          `booking_reference.ilike.%${search}%,` +
          `first_name.ilike.%${search}%,` +
          `last_name.ilike.%${search}%,` +
          `email.ilike.%${search}%,` +
          `vehicle_registration.ilike.%${search}%`
        );
      }

      // Order by created_at descending
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      console.log('[BookingsStore] Fetched bookings:', data?.length || 0);
      set({ bookings: data || [], loading: false, initialized: true });
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
