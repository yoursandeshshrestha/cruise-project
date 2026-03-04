import React, { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { Button } from '../../../components/admin/ui/button';
import { Input } from '../../../components/admin/ui/input';
import { Spinner } from '../../../components/admin/ui/spinner';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
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
  startOfDay,
} from 'date-fns';
import { useDailyCapacitiesStore } from '../../../stores/dailyCapacitiesStore';
import { useSystemSettingsStore } from '../../../stores/systemSettingsStore';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import { formatDateShort, formatDateLong } from '../../../lib/dateUtils';

interface BookingData {
  drop_off_datetime: string;
  return_datetime: string;
}

export const CapacityCalendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [capacityInput, setCapacityInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const {
    dailyCapacities,
    loading,
    error,
    fetchCapacitiesForMonth,
    getCapacityForDate,
    setCapacityForDate,
    deleteCapacityForDate,
  } = useDailyCapacitiesStore();

  const { getSetting } = useSystemSettingsStore();
  const defaultCapacity = getSetting<number>('capacity', 'default_daily_capacity', 100) ?? 100;

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Capacity Calendar' },
  ];

  // Fetch capacities and bookings when month changes
  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    fetchCapacitiesForMonth(year, month);

    // Fetch bookings for the month
    const fetchBookings = async () => {
      setLoadingBookings(true);
      try {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);

        const { data, error } = await supabase
          .from('bookings')
          .select('drop_off_datetime, return_datetime')
          .lte('drop_off_datetime', monthEnd.toISOString())
          .gte('return_datetime', monthStart.toISOString())
          .in('status', ['pending', 'confirmed', 'checked_in']);

        if (error) throw error;
        setBookings(data || []);
      } catch (err) {
        console.error('Error fetching bookings:', err);
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchBookings();
  }, [currentMonth, fetchCapacitiesForMonth]);

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

  // Handle day click
  const handleDayClick = (date: Date) => {
    if (!isSameMonth(date, currentMonth)) return;

    const dateStr = format(date, 'yyyy-MM-dd');
    const existingCapacity = getCapacityForDate(dateStr);
    const existingData = dailyCapacities.get(dateStr);

    setSelectedDate(date);
    setCapacityInput(existingCapacity !== null ? existingCapacity.toString() : '');
    setNotesInput(existingData?.notes || '');
    setIsModalOpen(true);
  };

  // Handle save
  const handleSave = async () => {
    if (!selectedDate) return;

    const capacity = parseInt(capacityInput);
    if (isNaN(capacity) || capacity < 0) {
      toast.error('Please enter a valid capacity (0 or higher)');
      return;
    }

    // Validate against current bookings
    const currentBookings = getBookingsCountForDate(selectedDate);
    if (capacity < currentBookings) {
      toast.error(`Cannot set capacity below current bookings (${currentBookings}). Please cancel some bookings first.`);
      return;
    }

    setIsSaving(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      await setCapacityForDate(dateStr, capacity, notesInput);
      toast.success(`Capacity set to ${capacity} for ${formatDateShort(selectedDate)}`);
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to save capacity');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle reset to default
  const handleResetToDefault = async () => {
    if (!selectedDate) return;

    // Validate against current bookings
    const currentBookings = getBookingsCountForDate(selectedDate);
    if (defaultCapacity < currentBookings) {
      toast.error(`Cannot reset to default capacity (${defaultCapacity}) - current bookings: ${currentBookings}. Please increase default capacity or cancel some bookings first.`);
      return;
    }

    setIsSaving(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      await deleteCapacityForDate(dateStr);
      toast.success(`Reset to default capacity (${defaultCapacity}) for ${formatDateShort(selectedDate)}`);
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to reset capacity');
    } finally {
      setIsSaving(false);
    }
  };

  // Get capacity for display
  const getDisplayCapacity = (date: Date): number => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const customCapacity = getCapacityForDate(dateStr);
    return customCapacity !== null ? customCapacity : defaultCapacity;
  };

  // Check if date has custom capacity
  const hasCustomCapacity = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return getCapacityForDate(dateStr) !== null;
  };

  // Calculate bookings count for a specific date
  const getBookingsCountForDate = (date: Date): number => {
    const dateStr = format(startOfDay(date), 'yyyy-MM-dd');

    return bookings.filter((booking) => {
      const dropOff = format(startOfDay(new Date(booking.drop_off_datetime)), 'yyyy-MM-dd');
      const returnDate = format(startOfDay(new Date(booking.return_datetime)), 'yyyy-MM-dd');

      // Check if the date falls within the booking period
      return dateStr >= dropOff && dateStr <= returnDate;
    }).length;
  };

  // Calculate remaining capacity for a date
  const getRemainingCapacity = (date: Date): number => {
    const capacity = getDisplayCapacity(date);
    const bookingsCount = getBookingsCountForDate(date);
    return Math.max(0, capacity - bookingsCount);
  };

  const isInitialLoading = (loading && dailyCapacities.size === 0) || (loadingBookings && bookings.length === 0);

  if (isInitialLoading) {
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
            <h1 className="text-2xl font-semibold mb-1 flex items-center gap-2">
              Capacity Calendar
              {(loading || loadingBookings) && (
                <Spinner className="h-4 w-4" />
              )}
            </h1>
            <p className="text-sm text-muted-foreground">
              Set daily capacity limits (Default: {defaultCapacity})
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
          {/* Calendar Header */}
          <div className="p-4 border-b bg-slate-50">
            <h2 className="text-lg font-semibold text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
          </div>

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
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());
              const capacity = getDisplayCapacity(day);
              const isCustom = hasCustomCapacity(day);
              const bookingsCount = isCurrentMonth ? getBookingsCountForDate(day) : 0;
              const remaining = isCurrentMonth ? getRemainingCapacity(day) : 0;
              const utilizationPercent = capacity > 0 ? (bookingsCount / capacity) * 100 : 0;

              // Determine color based on utilization
              const getUtilizationColor = () => {
                if (utilizationPercent >= 100) return 'text-red-600';
                if (utilizationPercent >= 90) return 'text-orange-600';
                if (utilizationPercent >= 70) return 'text-yellow-600';
                return 'text-green-600';
              };

              return (
                <div
                  key={index}
                  onClick={() => handleDayClick(day)}
                  className={`
                    min-h-[120px] border-r border-b last:border-r-0 p-2
                    ${isCurrentMonth ? (isCustom ? 'bg-blue-50' : 'bg-white') : 'bg-slate-50/50'}
                    ${isToday ? 'ring-2 ring-blue-500 ring-inset' : ''}
                    ${isCurrentMonth ? 'cursor-pointer hover:bg-slate-100' : 'cursor-not-allowed'}
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

                  {/* Capacity Display */}
                  {isCurrentMonth && (
                    <div className="space-y-1">
                      <div className="text-center">
                        <div className={`text-xl font-bold ${isCustom ? 'text-blue-600' : 'text-slate-600'}`}>
                          {capacity}
                        </div>
                        <div className="text-xs text-slate-500">
                          {isCustom ? 'Custom' : 'Default'}
                        </div>
                      </div>

                      {/* Booking Stats */}
                      <div className="text-center space-y-0.5 pt-1 border-t">
                        <div className="text-xs">
                          <span className="text-slate-600">Booked:</span>{' '}
                          <span className={`font-semibold ${getUtilizationColor()}`}>
                            {bookingsCount}
                          </span>
                        </div>
                        <div className="text-xs">
                          <span className="text-slate-600">Left:</span>{' '}
                          <span className={`font-semibold ${remaining === 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {remaining}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && selectedDate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">
                  Set Capacity for {formatDateLong(selectedDate)}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* Current Stats */}
                <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                  <div className="text-sm font-medium text-slate-700">Current Status</div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-xs text-slate-600">Capacity</div>
                      <div className="text-lg font-bold text-slate-700">
                        {getDisplayCapacity(selectedDate)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-600">Booked</div>
                      <div className="text-lg font-bold text-blue-600">
                        {getBookingsCountForDate(selectedDate)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-600">Available</div>
                      <div className="text-lg font-bold text-green-600">
                        {getRemainingCapacity(selectedDate)}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Daily Capacity
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={capacityInput}
                    onChange={(e) => setCapacityInput(e.target.value)}
                    placeholder={`Default: ${defaultCapacity}`}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Leave empty to use default capacity ({defaultCapacity})
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Notes (Optional)
                  </label>
                  <Input
                    type="text"
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder="e.g., Holiday, Special event"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border-t bg-slate-50">
                <Button
                  variant="outline"
                  onClick={handleResetToDefault}
                  disabled={isSaving || !hasCustomCapacity(selectedDate)}
                  className="cursor-pointer"
                >
                  Reset to Default
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSaving}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || !capacityInput}
                    className="cursor-pointer"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
