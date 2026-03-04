import React, { useEffect, useMemo } from 'react';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { KPICard } from '../../../components/admin/KPICard';
import { useBookingsStore } from '../../../stores/bookingsStore';
import { subDays, differenceInDays } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/admin/ui/table';
import { Spinner } from '../../../components/admin/ui/spinner';

export const Analytics: React.FC = () => {
  const { bookings, loading, fetchBookings, initialized, revenueAnalytics, fetchRevenueAnalytics } = useBookingsStore();

  useEffect(() => {
    if (!initialized) {
      fetchBookings();
      fetchRevenueAnalytics();
    }
  }, [initialized, fetchBookings, fetchRevenueAnalytics]);

  const analytics = useMemo(() => {
    const now = new Date();
    const last30Days = subDays(now, 30);

    // Filter bookings with completed payments only for revenue calculations
    const paidBookings = bookings.filter(b => b.payment_status === 'completed');

    // Filter bookings by date ranges for booking counts
    const last30DaysBookings = bookings.filter(
      b => new Date(b.created_at) >= last30Days
    );

    // Revenue calculations from backend (already in pence, convert to pounds)
    const totalRevenue = revenueAnalytics ? revenueAnalytics.total_revenue / 100 : 0;
    const monthRevenue = revenueAnalytics ? revenueAnalytics.month_revenue / 100 : 0;
    const yearRevenue = revenueAnalytics ? revenueAnalytics.year_revenue / 100 : 0;

    // Booking statistics
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;

    // Average booking value from backend (completed payments only)
    const avgBookingValue = revenueAnalytics ? revenueAnalytics.avg_booking_value / 100 : 0;

    // Unique customers (by email)
    const uniqueCustomers = new Set(bookings.map(b => b.email)).size;

    // Bookings by cruise line
    const bookingsByCruiseLine: Record<string, number> = {};
    bookings.forEach(b => {
      bookingsByCruiseLine[b.cruise_line] = (bookingsByCruiseLine[b.cruise_line] || 0) + 1;
    });
    const topCruiseLines = Object.entries(bookingsByCruiseLine)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Revenue by cruise line (completed payments only)
    const revenueByCruiseLine: Record<string, number> = {};
    paidBookings.forEach(b => {
      revenueByCruiseLine[b.cruise_line] = (revenueByCruiseLine[b.cruise_line] || 0) + (b.total / 100);
    });
    const topRevenueLines = Object.entries(revenueByCruiseLine)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Average parking duration
    const totalDays = bookings.reduce((sum, b) => {
      const dropOff = new Date(b.drop_off_datetime);
      const returnDate = new Date(b.return_datetime);
      return sum + differenceInDays(returnDate, dropOff);
    }, 0);
    const avgDuration = totalBookings > 0 ? totalDays / totalBookings : 0;

    return {
      totalRevenue,
      monthRevenue,
      yearRevenue,
      totalBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      avgBookingValue,
      uniqueCustomers,
      topCruiseLines,
      topRevenueLines,
      avgDuration,
      last30DaysBookings: last30DaysBookings.length,
    };
  }, [bookings, revenueAnalytics]);

  const breadcrumbs = [
    { label: 'Overview' },
    { label: 'Analytics' }
  ];

  // Only show full loading screen on initial load
  if (!initialized) {
    return (
      <AdminLayout showSidebar showHeader breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-full p-8">
          <div className="text-center">
            <Spinner className="h-8 w-8 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading analytics...</p>
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
            <h1 className="text-2xl font-semibold mb-2">Analytics</h1>
            <p className="text-muted-foreground">
              Business insights and performance metrics
            </p>
          </div>
        </div>

        {/* Revenue Metrics */}
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Revenue Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard
              title="Total Revenue"
              value={`£${analytics.totalRevenue.toFixed(2)}`}
              loading={loading}
            />
            <KPICard
              title="This Year"
              value={`£${analytics.yearRevenue.toFixed(2)}`}
              loading={loading}
            />
            <KPICard
              title="This Month"
              value={`£${analytics.monthRevenue.toFixed(2)}`}
              loading={loading}
            />
            <KPICard
              title="Avg Booking Value"
              value={`£${analytics.avgBookingValue.toFixed(2)}`}
              loading={loading}
            />
          </div>
        </div>

        {/* Booking Metrics */}
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Booking Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <KPICard
              title="Total Bookings"
              value={analytics.totalBookings}
              loading={loading}
            />
            <KPICard
              title="Last 30 Days"
              value={analytics.last30DaysBookings}
              loading={loading}
            />
            <KPICard
              title="Confirmed"
              value={analytics.confirmedBookings}
              loading={loading}
            />
            <KPICard
              title="Completed"
              value={analytics.completedBookings}
              loading={loading}
            />
            <KPICard
              title="Cancelled"
              value={analytics.cancelledBookings}
              loading={loading}
            />
          </div>
        </div>

        {/* Customer & Operational Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Customers</h3>
            <div className="text-3xl font-bold">{analytics.uniqueCustomers}</div>
            <p className="text-sm text-muted-foreground mt-1">Unique customers</p>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Avg Duration</h3>
            <div className="text-3xl font-bold">{analytics.avgDuration.toFixed(1)}</div>
            <p className="text-sm text-muted-foreground mt-1">Days per booking</p>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Success Rate</h3>
            <div className="text-3xl font-bold">
              {analytics.totalBookings > 0
                ? ((1 - analytics.cancelledBookings / analytics.totalBookings) * 100).toFixed(1)
                : 0}%
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {analytics.totalBookings - analytics.cancelledBookings} of {analytics.totalBookings} bookings
            </p>
          </div>
        </div>

        {/* Top Cruise Lines - Two Tables Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* By Bookings */}
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Top Cruise Lines by Bookings
            </h2>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cruise Line</TableHead>
                    <TableHead className="text-right">Bookings</TableHead>
                    <TableHead className="text-right">Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.topCruiseLines.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                        No data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    analytics.topCruiseLines.map(([cruiseLine, count]) => (
                      <TableRow key={cruiseLine}>
                        <TableCell className="font-medium">{cruiseLine}</TableCell>
                        <TableCell className="text-right">{count}</TableCell>
                        <TableCell className="text-right">
                          {((count / analytics.totalBookings) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* By Revenue */}
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Top Cruise Lines by Revenue
            </h2>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cruise Line</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.topRevenueLines.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                        No data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    analytics.topRevenueLines.map(([cruiseLine, revenue]) => (
                      <TableRow key={cruiseLine}>
                        <TableCell className="font-medium">{cruiseLine}</TableCell>
                        <TableCell className="text-right">£{revenue.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          {((revenue / analytics.totalRevenue) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
