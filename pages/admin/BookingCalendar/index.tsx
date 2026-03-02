import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { useCalendarData, CalendarBooking } from './hooks/useCalendarData';
import { Spinner } from '../../../components/admin/ui/spinner';
import { Button } from '../../../components/admin/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  addMonths,
  subMonths,
  isSameDay,
  differenceInDays,
  startOfDay,
} from 'date-fns';

// Color palette for bookings
const BOOKING_COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-green-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-teal-500',
];

// Get a consistent color for a booking based on its ID
const getBookingColor = (bookingId: string): string => {
  const hash = bookingId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return BOOKING_COLORS[Math.abs(hash) % BOOKING_COLORS.length];
};

export const BookingCalendar: React.FC = () => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const {
    bookings,
    loading,
    error,
    stats,
    getBookingsForDate,
    getDayStats,
  } = useCalendarData(currentMonth);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Booking Calendar' },
  ];

  // Get calendar days for the current month view
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Navigate months
  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const today = () => setCurrentMonth(new Date());

  // Handle booking click
  const handleBookingClick = (booking: CalendarBooking) => {
    navigate(`/admin/bookings?search=${booking.booking_reference}`);
  };

  // Handle day click - navigate to bookings for that date
  const handleDayClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    navigate(`/admin/bookings?date=${dateStr}`);
  };

  if (loading && bookings.length === 0) {
    return (
      <AdminLayout showSidebar showHeader breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-full p-8">
          <div className="text-center">
            <Spinner className="h-8 w-8 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading calendar...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout showSidebar showHeader breadcrumbs={breadcrumbs}>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Booking Calendar</h1>
            <p className="text-sm text-muted-foreground">
              View all active bookings in calendar view
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={today}
              className="cursor-pointer text-xs"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={previousMonth}
              className="cursor-pointer h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextMonth}
              className="cursor-pointer h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Calendar */}
        <div className="border rounded-lg bg-white overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b bg-slate-50">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
              <div key={day} className="text-center text-sm font-semibold text-slate-700 py-3 border-r last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const dayBookings = getBookingsForDate(day);
              const dayStats = getDayStats(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={index}
                  className={`
                    min-h-[120px] border-r border-b last:border-r-0 p-2
                    ${isCurrentMonth ? 'bg-white' : 'bg-slate-50/50'}
                    ${isToday ? 'bg-blue-50' : ''}
                  `}
                >
                  {/* Date Number */}
                  <div className={`
                    text-sm font-medium mb-2
                    ${isCurrentMonth ? 'text-slate-700' : 'text-slate-400'}
                    ${isToday ? 'text-blue-600 font-bold' : ''}
                  `}>
                    {format(day, 'd')}
                  </div>

                  {/* Day Stats */}
                  {dayStats.total > 0 && (
                    <div className="space-y-1">
                      <div
                        onClick={() => handleDayClick(day)}
                        className="bg-blue-500 text-white text-xs px-2 py-1 rounded cursor-pointer hover:bg-blue-600 transition-colors"
                        title="View all bookings on this day"
                      >
                        <span className="font-semibold">Total: {dayStats.total}</span>
                      </div>
                      {dayStats.arrivals > 0 && (
                        <div
                          onClick={() => handleDayClick(day)}
                          className="bg-green-500 text-white text-xs px-2 py-1 rounded cursor-pointer hover:bg-green-600 transition-colors"
                          title="View bookings with arrivals on this day"
                        >
                          <span className="font-semibold">↓ Arrivals: {dayStats.arrivals}</span>
                        </div>
                      )}
                      {dayStats.departures > 0 && (
                        <div
                          onClick={() => handleDayClick(day)}
                          className="bg-orange-500 text-white text-xs px-2 py-1 rounded cursor-pointer hover:bg-orange-600 transition-colors"
                          title="View bookings with departures on this day"
                        >
                          <span className="font-semibold">↑ Departures: {dayStats.departures}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
