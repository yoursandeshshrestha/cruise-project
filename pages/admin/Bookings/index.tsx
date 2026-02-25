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
  const { bookings, loading, error, fetchBookings, initialized } = useBookingsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch bookings on mount
  useEffect(() => {
    fetchBookings(searchQuery, statusFilter);
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBookings(searchQuery, statusFilter);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, fetchBookings]);

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-100';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-100';
      case 'checked_in':
        return 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-100';
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

  // Loading state
  if (!initialized || loading) {
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
            value={bookings.length}
            loading={loading}
          />
          <KPICard
            title="Pending"
            value={bookings.filter(b => b.status === 'pending').length}
            loading={loading}
          />
          <KPICard
            title="Confirmed"
            value={bookings.filter(b => b.status === 'confirmed').length}
            loading={loading}
          />
          <KPICard
            title="Checked In"
            value={bookings.filter(b => b.status === 'checked_in').length}
            loading={loading}
          />
          <KPICard
            title="Completed"
            value={bookings.filter(b => b.status === 'completed').length}
            loading={loading}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-4">
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
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Bookings Table */}
        <div className="border rounded-lg overflow-hidden">
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
            <TableBody>
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
                      <div className="font-semibold">£{booking.total.toFixed(2)}</div>
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
      </div>
    </AdminLayout>
  );
};
