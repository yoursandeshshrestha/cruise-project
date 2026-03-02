import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../../lib/supabase';
import { startOfMonth, endOfMonth, format, startOfDay } from 'date-fns';

export interface CalendarBooking {
  id: string;
  booking_reference: string;
  first_name: string;
  last_name: string;
  drop_off_datetime: string;
  return_datetime: string;
  status: string;
  vehicle_registration: string | null;
}

export interface CalendarStats {
  totalBookings: number;
  arrivalsToday: number;
  departuresToday: number;
}

export const useCalendarData = (currentMonth: Date) => {
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch bookings for the current month
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);

      try {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);

        // Fetch all bookings that overlap with the month
        const { data, error: fetchError } = await supabase
          .from('bookings')
          .select('id, booking_reference, first_name, last_name, drop_off_datetime, return_datetime, status, vehicle_registration')
          .lte('drop_off_datetime', monthEnd.toISOString())
          .gte('return_datetime', monthStart.toISOString())
          .in('status', ['pending', 'confirmed', 'checked_in']);

        if (fetchError) throw fetchError;

        setBookings(data || []);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [currentMonth]);

  // Calculate stats for today
  const stats: CalendarStats = useMemo(() => {
    const today = format(startOfDay(new Date()), 'yyyy-MM-dd');

    const arrivalsToday = bookings.filter((booking) => {
      const dropOff = format(startOfDay(new Date(booking.drop_off_datetime)), 'yyyy-MM-dd');
      return dropOff === today;
    }).length;

    const departuresToday = bookings.filter((booking) => {
      const returnDate = format(startOfDay(new Date(booking.return_datetime)), 'yyyy-MM-dd');
      return returnDate === today;
    }).length;

    return {
      totalBookings: bookings.length,
      arrivalsToday,
      departuresToday,
    };
  }, [bookings]);

  // Helper function to get bookings for a specific date
  const getBookingsForDate = (date: Date): CalendarBooking[] => {
    const dateStr = format(startOfDay(date), 'yyyy-MM-dd');

    return bookings.filter((booking) => {
      const dropOff = format(startOfDay(new Date(booking.drop_off_datetime)), 'yyyy-MM-dd');
      const returnDate = format(startOfDay(new Date(booking.return_datetime)), 'yyyy-MM-dd');

      // Check if the date falls within the booking period
      return dateStr >= dropOff && dateStr <= returnDate;
    });
  };

  // Helper function to get day stats
  const getDayStats = (date: Date) => {
    const dateStr = format(startOfDay(date), 'yyyy-MM-dd');
    const dayBookings = getBookingsForDate(date);

    const arrivals = bookings.filter((booking) => {
      const dropOff = format(startOfDay(new Date(booking.drop_off_datetime)), 'yyyy-MM-dd');
      return dropOff === dateStr;
    }).length;

    const departures = bookings.filter((booking) => {
      const returnDate = format(startOfDay(new Date(booking.return_datetime)), 'yyyy-MM-dd');
      return returnDate === dateStr;
    }).length;

    return {
      total: dayBookings.length,
      arrivals,
      departures,
    };
  };

  return {
    bookings,
    loading,
    error,
    stats,
    getBookingsForDate,
    getDayStats,
  };
};
