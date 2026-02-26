import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { KPICard } from '../../../components/admin/KPICard';
import { useBookingsStore } from '../../../stores/bookingsStore';
import { Search, Clock, Ship, User, Mail, Phone, Car, MapPin, CheckCircle } from 'lucide-react';
import { format, startOfDay, endOfDay } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/admin/ui/table';
import { Button } from '../../../components/admin/ui/button';
import { Badge } from '../../../components/admin/ui/badge';
import { Input } from '../../../components/admin/ui/input';
import { Spinner } from '../../../components/admin/ui/spinner';
import { toast } from 'sonner';
import type { Database } from '../../../lib/supabase';

type Booking = Database['public']['Tables']['bookings']['Row'];

export const Arrivals: React.FC = () => {
  const { bookings, loading, fetchBookings, updateBooking, initialized } = useBookingsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

  useEffect(() => {
    if (!initialized) {
      fetchBookings();
    }
  }, [initialized, fetchBookings]);

  // Filter bookings for today's arrivals
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  const todaysArrivals = bookings.filter((booking) => {
    const dropOffDate = new Date(booking.drop_off_datetime);
    const isToday = dropOffDate >= todayStart && dropOffDate <= todayEnd;
    const isActive = ['confirmed', 'checked_in'].includes(booking.status);

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        booking.booking_reference.toLowerCase().includes(query) ||
        booking.first_name.toLowerCase().includes(query) ||
        booking.last_name.toLowerCase().includes(query) ||
        booking.email.toLowerCase().includes(query) ||
        booking.vehicle_registration.toLowerCase().includes(query);
      return isToday && isActive && matchesSearch;
    }

    return isToday && isActive;
  }).sort((a, b) => {
    // Sort by drop-off time (earliest first)
    return new Date(a.drop_off_datetime).getTime() - new Date(b.drop_off_datetime).getTime();
  });

  const handleCheckIn = async (booking: Booking) => {
    if (booking.status === 'checked_in') {
      toast.info('Customer already checked in');
      return;
    }

    setCheckingIn(booking.id);
    try {
      await updateBooking(booking.id, {
        status: 'checked_in',
        checked_in_at: new Date().toISOString(),
      });
      toast.success(`${booking.first_name} ${booking.last_name} checked in successfully`);
    } catch (error) {
      console.error('Error checking in:', error);
      toast.error('Failed to check in customer');
    } finally {
      setCheckingIn(null);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'checked_in') {
      return (
        <Badge className="bg-green-100 text-green-800 border border-green-200 hover:bg-green-100">
          Checked In
        </Badge>
      );
    }
    return (
      <Badge className="bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-100">
        Confirmed
      </Badge>
    );
  };

  const breadcrumbs = [
    { label: 'Operations' },
    { label: 'Arrivals Today' }
  ];

  // Only show full loading screen on initial load
  if (!initialized) {
    return (
      <AdminLayout showSidebar showHeader breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-full p-8">
          <div className="text-center">
            <Spinner className="h-8 w-8 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading arrivals...</p>
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
            <h1 className="text-2xl font-semibold mb-2">Arrivals Today</h1>
            <p className="text-muted-foreground">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <KPICard
            title="Total Arrivals"
            value={todaysArrivals.length}
            loading={loading}
          />
          <KPICard
            title="Checked In"
            value={todaysArrivals.filter(b => b.status === 'checked_in').length}
            loading={loading}
          />
          <KPICard
            title="Pending Check-in"
            value={todaysArrivals.filter(b => b.status === 'confirmed').length}
            loading={loading}
          />
        </div>

        {/* Search */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              type="text"
              placeholder="Search arrivals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Booking Ref</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Cruise</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="text-right w-[140px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {todaysArrivals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    {searchQuery
                      ? 'No arrivals found matching your search'
                      : 'No arrivals scheduled for today'}
                  </TableCell>
                </TableRow>
              ) : (
                todaysArrivals.map((booking) => (
                  <TableRow key={booking.id} className="cursor-pointer hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span className="font-medium">
                          {format(new Date(booking.drop_off_datetime), 'HH:mm')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm font-medium">
                        {booking.booking_reference}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {booking.first_name} {booking.last_name}
                        </div>
                        {booking.number_of_passengers > 1 && (
                          <div className="text-xs text-muted-foreground">
                            {booking.number_of_passengers} passengers
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="text-slate-600">{booking.email}</div>
                        <div className="text-slate-600">{booking.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{booking.vehicle_registration}</div>
                        <div className="text-xs text-muted-foreground">{booking.vehicle_make}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{booking.cruise_line}</div>
                        <div className="text-xs text-muted-foreground">{booking.ship_name}</div>
                        {booking.terminal && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {booking.terminal}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(booking.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      {booking.status === 'confirmed' ? (
                        <Button
                          size="sm"
                          onClick={() => handleCheckIn(booking)}
                          disabled={checkingIn === booking.id}
                          className="cursor-pointer"
                        >
                          {checkingIn === booking.id ? (
                            <>
                              <Spinner className="w-4 h-4 mr-2" />
                              Checking in...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Check In
                            </>
                          )}
                        </Button>
                      ) : (
                        <div className="flex items-center justify-end gap-2 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Checked in</span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
};
