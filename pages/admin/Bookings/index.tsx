import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { KPICard } from '../../../components/admin/KPICard';
import { useBookingsStore } from '../../../stores/bookingsStore';
import { Search, Filter, Download, Calendar, Ship, User, Mail, Phone, Car } from 'lucide-react';
import { format } from 'date-fns';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/admin/ui/select';

export const Bookings: React.FC = () => {
  const navigate = useNavigate();
  const { bookings, stats, loading, error, fetchBookings, fetchStats, resetPagination, initialized, hasMore, page } = useBookingsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showPending, setShowPending] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Fetch bookings and stats on mount and when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      resetPagination();
      fetchBookings(0, 50, { search: searchQuery, status: statusFilter, showPending });
    }, searchQuery ? 500 : 0); // 500ms debounce only for search

    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, showPending, fetchBookings, resetPagination]);

  // Fetch stats only on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Load more handler for infinite scroll
  const handleLoadMore = async () => {
    if (!hasMore || loading || isLoadingMore) return;

    setIsLoadingMore(true);
    await fetchBookings(page + 1, 50, { search: searchQuery, status: statusFilter, showPending });
    setIsLoadingMore(false);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-100';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-100';
      case 'checked_in':
        return 'bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-100';
      case 'completed':
        return 'bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-100';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-100';
      default:
        return 'bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-100';
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Bookings' }
  ];

  // Loading state - only show full loading screen on initial load
  if (!initialized) {
    return (
      <AdminLayout showSidebar showHeader breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-full p-8">
          <div className="text-center">
            <Spinner className="h-8 w-8 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading bookings...</p>
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
            <h1 className="text-2xl font-semibold mb-2">Bookings</h1>
            <p className="text-muted-foreground">
              Manage all parking bookings
            </p>
          </div>
          <Button variant="outline" className="cursor-pointer">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <KPICard
            title="Total Bookings"
            value={stats?.total || 0}
            loading={!stats}
          />
          <KPICard
            title="Pending"
            value={stats?.pending || 0}
            loading={!stats}
          />
          <KPICard
            title="Confirmed"
            value={stats?.confirmed || 0}
            loading={!stats}
          />
          <KPICard
            title="Checked In"
            value={stats?.checked_in || 0}
            loading={!stats}
          />
          <KPICard
            title="Completed"
            value={stats?.completed || 0}
            loading={!stats}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              type="text"
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px] cursor-pointer">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">All Status</SelectItem>
              <SelectItem value="pending" className="cursor-pointer">Pending</SelectItem>
              <SelectItem value="confirmed" className="cursor-pointer">Confirmed</SelectItem>
              <SelectItem value="checked_in" className="cursor-pointer">Checked In</SelectItem>
              <SelectItem value="completed" className="cursor-pointer">Completed</SelectItem>
              <SelectItem value="cancelled" className="cursor-pointer">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <label className="flex items-center gap-2 cursor-pointer border rounded-md px-3 py-2 hover:bg-muted/50 transition-colors">
            <input
              type="checkbox"
              checked={showPending}
              onChange={(e) => setShowPending(e.target.checked)}
              className="cursor-pointer w-4 h-4"
            />
            <span className="text-sm whitespace-nowrap">Show Pending</span>
          </label>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Bookings Table */}
        <div className="border rounded-lg overflow-hidden relative">
          {loading && bookings.length > 0 && (
            <div className="absolute top-0 left-0 right-0 z-10 bg-blue-50 border-b border-blue-200 px-4 py-2 flex items-center gap-2">
              <Spinner className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">Updating results...</span>
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Trip Details</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className={loading && bookings.length > 0 ? 'opacity-60 pointer-events-none' : ''}>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    {loading ? 'Loading bookings...' : 'No bookings found'}
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow
                    key={booking.id}
                    onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">
                      <div>{booking.booking_reference}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(booking.created_at), 'MMM dd, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="font-medium">
                          {booking.first_name} {booking.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail size={10} />
                          {booking.email}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone size={10} />
                          {booking.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="font-medium flex items-center gap-1">
                          <Ship size={12} />
                          {booking.ship_name}
                        </div>
                        <div className="text-xs text-muted-foreground">{booking.cruise_line}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDateTime(booking.drop_off_datetime)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          → {formatDateTime(booking.return_datetime)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {booking.number_of_passengers} passenger{booking.number_of_passengers !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="font-medium">{booking.vehicle_registration}</div>
                        <div className="text-xs text-muted-foreground">{booking.vehicle_make}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">£{(booking.total / 100).toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">
                        VAT: £{(booking.vat / 100).toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Load More / Pagination */}
        {hasMore && bookings.length > 0 && (
          <div className="flex justify-center py-6">
            <Button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              variant="outline"
              className="cursor-pointer"
            >
              {isLoadingMore ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Loading more...
                </>
              ) : (
                'Load More Bookings'
              )}
            </Button>
          </div>
        )}

        {/* End of results message */}
        {!hasMore && bookings.length > 0 && (
          <div className="text-center py-6 text-sm text-muted-foreground">
            You've reached the end of the list
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
