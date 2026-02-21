import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { useBookingsStore } from '../../../stores/bookingsStore';
import { useCruiseLinesStore } from '../../../stores/cruiseLinesStore';
import { useTerminalsStore } from '../../../stores/terminalsStore';
import { format } from 'date-fns';
import { ArrowLeft, User, Mail, Phone, Car, Ship, Calendar, DollarSign, CreditCard, FileText } from 'lucide-react';
import { Button } from '../../../components/admin/ui/button';
import { Badge } from '../../../components/admin/ui/badge';
import { Spinner } from '../../../components/admin/ui/spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/admin/ui/dialog';
import { Input } from '../../../components/admin/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/admin/ui/select';
import { DatePicker } from '../../../components/admin/ui/date-picker';
import { toast } from 'sonner';

interface EditFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  vehicle_registration: string;
  vehicle_make: string;
  cruise_line: string;
  ship_name: string;
  terminal: string | null;
  drop_off_datetime: Date | undefined;
  return_datetime: Date | undefined;
  number_of_passengers: string;
  status: string;
  internal_notes: string | null;
}

export const BookingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentBooking, loading, error, fetchBookings, bookings, updateBooking } = useBookingsStore();
  const { cruiseLines, fetchActiveCruiseLines } = useCruiseLinesStore();
  const { terminals, fetchActiveTerminals } = useTerminalsStore();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    vehicle_registration: '',
    vehicle_make: '',
    cruise_line: '',
    ship_name: '',
    terminal: null,
    drop_off_datetime: undefined,
    return_datetime: undefined,
    number_of_passengers: '2',
    status: 'confirmed',
    internal_notes: null,
  });

  useEffect(() => {
    if (bookings.length === 0) {
      fetchBookings();
    }
  }, [bookings.length, fetchBookings]);

  useEffect(() => {
    fetchActiveCruiseLines();
    fetchActiveTerminals();
  }, [fetchActiveCruiseLines, fetchActiveTerminals]);

  const booking = bookings.find(b => b.id === id);

  const handleStatusChange = async (newStatus: string) => {
    if (!booking || !id) return;

    try {
      await updateBooking(id, {
        status: newStatus as any,
      });

      toast.success('Booking status updated successfully');
      fetchBookings(); // Refresh bookings
    } catch (error) {
      toast.error('Failed to update booking status');
      console.error('Error updating booking status:', error);
    }
  };

  const openEditDialog = () => {
    if (!booking) return;

    setEditForm({
      first_name: booking.first_name,
      last_name: booking.last_name,
      email: booking.email,
      phone: booking.phone,
      vehicle_registration: booking.vehicle_registration,
      vehicle_make: booking.vehicle_make,
      cruise_line: booking.cruise_line,
      ship_name: booking.ship_name,
      terminal: booking.terminal,
      drop_off_datetime: new Date(booking.drop_off_datetime),
      return_datetime: new Date(booking.return_datetime),
      number_of_passengers: booking.number_of_passengers.toString(),
      status: booking.status,
      internal_notes: booking.internal_notes,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!booking || !id) return;

    try {
      await updateBooking(id, {
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        email: editForm.email,
        phone: editForm.phone,
        vehicle_registration: editForm.vehicle_registration,
        vehicle_make: editForm.vehicle_make,
        cruise_line: editForm.cruise_line,
        ship_name: editForm.ship_name,
        terminal: editForm.terminal,
        drop_off_datetime: editForm.drop_off_datetime?.toISOString(),
        return_datetime: editForm.return_datetime?.toISOString(),
        number_of_passengers: parseInt(editForm.number_of_passengers),
        internal_notes: editForm.internal_notes,
      });

      toast.success('Booking updated successfully');
      setIsEditDialogOpen(false);
      fetchBookings(); // Refresh bookings
    } catch (error) {
      toast.error('Failed to update booking');
      console.error('Error updating booking:', error);
    }
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
      return format(new Date(dateString), 'EEEE, MMMM dd, yyyy - HH:mm');
    } catch {
      return dateString;
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Bookings', href: '/admin/bookings' },
    { label: booking?.booking_reference || 'Detail' }
  ];

  if (loading && bookings.length === 0) {
    return (
      <AdminLayout showSidebar showHeader breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-full p-8">
          <div className="text-center">
            <Spinner className="h-8 w-8 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading booking details...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!booking) {
    return (
      <AdminLayout showSidebar showHeader breadcrumbs={breadcrumbs}>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
            Booking not found
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout showSidebar showHeader breadcrumbs={breadcrumbs}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/bookings')}
              className="cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">{booking.booking_reference}</h1>
              <p className="text-sm text-muted-foreground">
                Created on {format(new Date(booking.created_at), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(booking.status)}>
            {booking.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>

        {/* Cancellation Info - Show at top if cancelled */}
        {booking.cancellation_reason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-2 text-red-900">Cancellation Reason</h2>
            <p className="text-sm text-red-800">{booking.cancellation_reason}</p>
            {booking.refund_amount && (
              <div className="mt-3">
                <span className="text-sm text-red-900">Refund Amount: </span>
                <span className="font-semibold text-red-900">£{(booking.refund_amount / 100).toFixed(2)}</span>
                {booking.refund_processed_at && (
                  <span className="text-sm text-red-800 ml-2">
                    (Processed on {format(new Date(booking.refund_processed_at), 'MMM dd, yyyy')})
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-admin-card-bg border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Customer Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Full Name</label>
                  <p className="font-medium">{booking.first_name} {booking.last_name}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    Email
                  </label>
                  <p className="font-medium">{booking.email}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    Phone
                  </label>
                  <p className="font-medium">{booking.phone}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Passengers</label>
                  <p className="font-medium">{booking.number_of_passengers}</p>
                </div>
              </div>
            </div>

            {/* Trip Details */}
            <div className="bg-admin-card-bg border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Ship className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Trip Details</h2>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Cruise Line</label>
                    <p className="font-medium">{booking.cruise_line}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Ship Name</label>
                    <p className="font-medium">{booking.ship_name}</p>
                  </div>
                  {booking.terminal && (
                    <div>
                      <label className="text-sm text-muted-foreground">Terminal</label>
                      <p className="font-medium">{booking.terminal}</p>
                    </div>
                  )}
                </div>
                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Drop-off Date & Time
                      </label>
                      <p className="font-medium">{formatDateTime(booking.drop_off_datetime)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Return Date & Time
                      </label>
                      <p className="font-medium">{formatDateTime(booking.return_datetime)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="bg-admin-card-bg border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Car className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Vehicle Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Registration</label>
                  <p className="font-medium">{booking.vehicle_registration}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Make/Model</label>
                  <p className="font-medium">{booking.vehicle_make}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Parking Type</label>
                  <p className="font-medium">{booking.parking_type}</p>
                </div>
              </div>
            </div>

            {/* Add-ons */}
            {booking.add_ons && Array.isArray(booking.add_ons) && booking.add_ons.length > 0 && (
              <div className="bg-admin-card-bg border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">Add-ons</h2>
                </div>
                <ul className="space-y-2">
                  {booking.add_ons.map((addon, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>{addon}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column - Payment & Actions */}
          <div className="space-y-6">
            {/* Payment Information */}
            <div className="bg-admin-card-bg border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Payment</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="font-medium">£{(booking.subtotal / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">VAT (20%)</span>
                  <span className="font-medium">£{(booking.vat / 100).toFixed(2)}</span>
                </div>
                {booking.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="text-sm">Discount</span>
                    <span className="font-medium">-£{(booking.discount / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold">£{(booking.total / 100).toFixed(2)}</span>
                </div>
                {booking.promo_code && (
                  <div className="bg-green-50 border border-green-200 rounded px-3 py-2 text-sm">
                    Promo code: <span className="font-medium">{booking.promo_code}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Status */}
            {booking.payment_status && (
              <div className="bg-admin-card-bg border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">Payment Status</h2>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm text-muted-foreground">Status</label>
                    <p className="font-medium">{booking.payment_status}</p>
                  </div>
                  {booking.stripe_payment_intent_id && (
                    <div>
                      <label className="text-sm text-muted-foreground">Payment Intent</label>
                      <p className="font-mono text-xs">{booking.stripe_payment_intent_id}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status Change */}
            <div className="bg-admin-card-bg border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Booking Status</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Current Status</label>
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Change Status</label>
                  <Select
                    value={booking.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending" className="cursor-pointer">Pending</SelectItem>
                      <SelectItem value="confirmed" className="cursor-pointer">Confirmed</SelectItem>
                      <SelectItem value="checked_in" className="cursor-pointer">Checked In</SelectItem>
                      <SelectItem value="completed" className="cursor-pointer">Completed</SelectItem>
                      <SelectItem value="cancelled" className="cursor-pointer">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="bg-admin-card-bg border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Timeline</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-muted-foreground">Created</label>
                  <p className="font-medium">{format(new Date(booking.created_at), 'MMM dd, yyyy HH:mm')}</p>
                </div>
                {booking.confirmed_at && (
                  <div>
                    <label className="text-muted-foreground">Confirmed</label>
                    <p className="font-medium">{format(new Date(booking.confirmed_at), 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                )}
                {booking.checked_in_at && (
                  <div>
                    <label className="text-muted-foreground">Checked In</label>
                    <p className="font-medium">{format(new Date(booking.checked_in_at), 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                )}
                {booking.completed_at && (
                  <div>
                    <label className="text-muted-foreground">Completed</label>
                    <p className="font-medium">{format(new Date(booking.completed_at), 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                )}
                {booking.cancelled_at && (
                  <div>
                    <label className="text-muted-foreground">Cancelled</label>
                    <p className="font-medium">{format(new Date(booking.cancelled_at), 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button className="w-full cursor-pointer" variant="outline" onClick={openEditDialog}>
                Edit Booking
              </Button>
              {booking.status !== 'cancelled' && (
                <Button className="w-full cursor-pointer" variant="destructive">
                  Cancel Booking
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Internal Notes */}
        {booking.internal_notes && (
          <div className="bg-admin-card-bg border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Internal Notes</h2>
            <p className="text-sm text-muted-foreground">{booking.internal_notes}</p>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
            <DialogHeader className="px-6 py-4 border-b border-slate-200 shrink-0">
              <DialogTitle>Edit Booking - {booking.booking_reference}</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 overflow-y-auto px-6 py-4 flex-1">
              {/* Customer Information */}
              <div>
                <h3 className="font-semibold text-sm mb-3 text-slate-700">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      First Name
                    </label>
                    <Input
                      value={editForm.first_name}
                      onChange={e => setEditForm({ ...editForm, first_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Last Name
                    </label>
                    <Input
                      value={editForm.last_name}
                      onChange={e => setEditForm({ ...editForm, last_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={editForm.email}
                      onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Phone
                    </label>
                    <Input
                      value={editForm.phone}
                      onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Passengers
                    </label>
                    <Input
                      type="number"
                      value={editForm.number_of_passengers}
                      onChange={e => setEditForm({ ...editForm, number_of_passengers: e.target.value })}
                      min="1"
                    />
                  </div>
                </div>
              </div>

              {/* Trip Details */}
              <div>
                <h3 className="font-semibold text-sm mb-3 text-slate-700">Trip Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Cruise Line
                    </label>
                    <Select
                      value={editForm.cruise_line}
                      onValueChange={value => {
                        setEditForm({ ...editForm, cruise_line: value, ship_name: '' });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select cruise line" />
                      </SelectTrigger>
                      <SelectContent>
                        {cruiseLines.map(cl => (
                          <SelectItem key={cl.id} value={cl.name}>
                            {cl.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Ship Name
                    </label>
                    <Select
                      value={editForm.ship_name}
                      onValueChange={value => setEditForm({ ...editForm, ship_name: value })}
                      disabled={!editForm.cruise_line}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select ship" />
                      </SelectTrigger>
                      <SelectContent>
                        {cruiseLines
                          .find(cl => cl.name === editForm.cruise_line)
                          ?.ships.map((ship, idx) => (
                            <SelectItem key={idx} value={ship}>
                              {ship}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Terminal
                    </label>
                    <Select
                      value={editForm.terminal || ''}
                      onValueChange={value => setEditForm({ ...editForm, terminal: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select terminal" />
                      </SelectTrigger>
                      <SelectContent>
                        {terminals.map(t => (
                          <SelectItem key={t.id} value={t.name}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Drop-off Date & Time
                    </label>
                    <DatePicker
                      date={editForm.drop_off_datetime}
                      onSelect={date => setEditForm({ ...editForm, drop_off_datetime: date })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Return Date & Time
                    </label>
                    <DatePicker
                      date={editForm.return_datetime}
                      onSelect={date => setEditForm({ ...editForm, return_datetime: date })}
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div>
                <h3 className="font-semibold text-sm mb-3 text-slate-700">Vehicle Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Registration
                    </label>
                    <Input
                      value={editForm.vehicle_registration}
                      onChange={e => setEditForm({ ...editForm, vehicle_registration: e.target.value.toUpperCase() })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Make/Model
                    </label>
                    <Input
                      value={editForm.vehicle_make}
                      onChange={e => setEditForm({ ...editForm, vehicle_make: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Internal Notes */}
              <div>
                <h3 className="font-semibold text-sm mb-3 text-slate-700">Internal Notes</h3>
                <textarea
                  className="w-full min-h-[100px] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#00A9FE] focus:ring-1 focus:ring-[#00A9FE] transition-colors"
                  value={editForm.internal_notes || ''}
                  onChange={e => setEditForm({ ...editForm, internal_notes: e.target.value })}
                  placeholder="Add internal notes..."
                />
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="px-6 py-4 border-t border-slate-200 shrink-0 bg-white rounded-b-lg">
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEditSubmit}
                  className="cursor-pointer"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};
