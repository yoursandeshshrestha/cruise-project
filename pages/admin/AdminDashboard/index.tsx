import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import { useBookingsStore } from '../../../stores/bookingsStore';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { KPICard } from '../../../components/admin/KPICard';
import { Button } from '../../../components/admin/ui/button';
import { Badge } from '../../../components/admin/ui/badge';
import { Spinner } from '../../../components/admin/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/admin/ui/table';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { adminUser } = useAuthStore();
  const { bookings, loading, fetchBookings, initialized } = useBookingsStore();

  useEffect(() => {
    if (!initialized) {
      fetchBookings();
    }
  }, [initialized, fetchBookings]);

  const userName = adminUser?.email?.split('@')[0] || 'Admin';

  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    // Total revenue (convert pence to pounds)
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.total / 100), 0);

    // This month revenue
    const thisMonthBookings = bookings.filter(
      b => new Date(b.created_at) >= monthStart && new Date(b.created_at) <= monthEnd
    );
    const monthRevenue = thisMonthBookings.reduce((sum, b) => sum + (b.total / 100), 0);

    // Total bookings count
    const totalBookings = bookings.length;

    // Today's arrivals
    const todaysArrivals = bookings.filter((booking) => {
      const dropOffDate = new Date(booking.drop_off_datetime);
      const isToday = dropOffDate >= todayStart && dropOffDate <= todayEnd;
      const isActive = ['confirmed', 'checked_in'].includes(booking.status);
      return isToday && isActive;
    });

    // Confirmed bookings
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;

    return {
      totalRevenue,
      monthRevenue,
      totalBookings,
      todaysArrivals: todaysArrivals.length,
      confirmedBookings,
    };
  }, [bookings]);

  // Recent bookings (last 5)
  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [bookings]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-100">
            Pending
          </Badge>
        );
      case 'confirmed':
        return (
          <Badge className="bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-100">
            Confirmed
          </Badge>
        );
      case 'checked_in':
        return (
          <Badge className="bg-green-100 text-green-800 border border-green-200 hover:bg-green-100">
            Checked In
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-100">
            Completed
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-red-100 text-red-800 border border-red-200 hover:bg-red-100">
            Cancelled
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (!initialized || loading) {
    return (
      <AdminLayout showSidebar showHeader breadcrumbs={[{ label: 'Dashboard' }]}>
        <div className="flex items-center justify-center h-full p-8">
          <div className="text-center">
            <Spinner className="h-8 w-8 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout showSidebar showHeader breadcrumbs={[{ label: 'Dashboard' }]}>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {userName}! Here's what's happening today.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            title="Total Revenue"
            value={`£${stats.totalRevenue.toFixed(2)}`}
            loading={loading}
          />
          <KPICard
            title="This Month"
            value={`£${stats.monthRevenue.toFixed(2)}`}
            loading={loading}
          />
          <KPICard
            title="Total Bookings"
            value={stats.totalBookings}
            loading={loading}
          />
          <KPICard
            title="Today's Arrivals"
            value={stats.todaysArrivals}
            loading={loading}
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Confirmed Bookings</h3>
            <div className="text-3xl font-bold">{stats.confirmedBookings}</div>
            <p className="text-sm text-muted-foreground mt-1">Active reservations</p>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Avg Booking Value</h3>
            <div className="text-3xl font-bold">
              £{stats.totalBookings > 0 ? (stats.totalRevenue / stats.totalBookings).toFixed(2) : '0.00'}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Per booking</p>
          </div>

          <div className="border rounded-lg p-6 cursor-pointer hover:bg-slate-50" onClick={() => navigate('/admin/arrivals')}>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Arrivals Today</h3>
            <div className="text-3xl font-bold">{stats.todaysArrivals}</div>
            <p className="text-sm text-blue-600 mt-1">View all arrivals →</p>
          </div>
        </div>

        {/* Recent Bookings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Bookings</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/bookings')}
              className="cursor-pointer"
            >
              View All
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking Ref</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Cruise Line</TableHead>
                  <TableHead>Drop-off</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No bookings found
                    </TableCell>
                  </TableRow>
                ) : (
                  recentBookings.map((booking) => (
                    <TableRow
                      key={booking.id}
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                    >
                      <TableCell className="font-mono text-sm font-medium">
                        {booking.booking_reference}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {booking.first_name} {booking.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground">{booking.email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">{booking.cruise_line}</div>
                        <div className="text-xs text-muted-foreground">{booking.ship_name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(booking.drop_off_datetime), 'MMM d, yyyy')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(booking.drop_off_datetime), 'h:mm a')}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        £{(booking.total / 100).toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
