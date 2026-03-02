import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { useBookingsStore } from '../../../stores/bookingsStore';
import { useCruiseLinesStore } from '../../../stores/cruiseLinesStore';
import { useTerminalsStore } from '../../../stores/terminalsStore';
import { Button } from '../../../components/admin/ui/button';
import { Badge } from '../../../components/admin/ui/badge';
import { Spinner } from '../../../components/admin/ui/spinner';

// Components
import { CustomerInfoCard } from './components/CustomerInfoCard';
import { TripDetailsCard } from './components/TripDetailsCard';
import { VehicleInfoCard } from './components/VehicleInfoCard';
import { AddOnsCard } from './components/AddOnsCard';
import { PaymentCard } from './components/PaymentCard';
import { StatusCard } from './components/StatusCard';
import { TimelineCard } from './components/TimelineCard';
import { EditBookingDialog } from './components/EditBookingDialog';
import { CancelBookingDialog } from './components/CancelBookingDialog';

// Hooks & Utils
import { useBookingActions } from './hooks/useBookingActions';
import { getStatusColor, formatDateTime } from './utils';

export const BookingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loading, fetchBookings, bookings, updateBooking } = useBookingsStore();
  const { cruiseLines, fetchActiveCruiseLines } = useCruiseLinesStore();
  const { terminals, fetchActiveTerminals } = useTerminalsStore();

  const booking = bookings.find(b => b.id === id);

  // Custom hook for booking actions
  const {
    isEditDialogOpen,
    setIsEditDialogOpen,
    isCancelDialogOpen,
    setIsCancelDialogOpen,
    editForm,
    setEditForm,
    handleStatusChange,
    openEditDialog,
    openCancelDialog,
    handleEditSubmit,
    handleCancelBooking,
  } = useBookingActions(booking, updateBooking, fetchBookings);

  // Fetch data on mount
  useEffect(() => {
    if (bookings.length === 0) {
      fetchBookings();
    }
  }, [bookings.length, fetchBookings]);

  useEffect(() => {
    fetchActiveCruiseLines();
    fetchActiveTerminals();
  }, [fetchActiveCruiseLines, fetchActiveTerminals]);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Bookings', href: '/admin/bookings' },
    { label: booking?.booking_reference || 'Detail' }
  ];

  // Loading state
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

  // Not found state
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

        {/* Cancellation Banner */}
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
            <CustomerInfoCard booking={booking} />
            <TripDetailsCard booking={booking} formatDateTime={formatDateTime} />
            <VehicleInfoCard booking={booking} />
            {booking.add_ons && Array.isArray(booking.add_ons) && booking.add_ons.length > 0 && (
              <AddOnsCard addOns={booking.add_ons as string[]} />
            )}
          </div>

          {/* Right Column - Payment & Actions */}
          <div className="space-y-6">
            <PaymentCard booking={booking as any} />
            <StatusCard
              status={booking.status}
              onStatusChange={(newStatus) => handleStatusChange(newStatus, booking.id)}
              getStatusColor={getStatusColor}
            />
            <TimelineCard booking={booking} />

            {/* Actions */}
            <div className="space-y-2">
              <Button className="w-full cursor-pointer" variant="outline" onClick={openEditDialog}>
                Edit Booking
              </Button>
              {booking.status !== 'cancelled' && (
                <Button
                  className="w-full cursor-pointer"
                  variant="destructive"
                  onClick={openCancelDialog}
                >
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
        <EditBookingDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          bookingReference={booking.booking_reference}
          editForm={editForm}
          setEditForm={setEditForm}
          cruiseLines={cruiseLines as any}
          terminals={terminals}
          onSubmit={() => handleEditSubmit(booking.id)}
        />

        {/* Cancel Dialog */}
        <CancelBookingDialog
          isOpen={isCancelDialogOpen}
          onClose={() => setIsCancelDialogOpen(false)}
          bookingReference={booking.booking_reference}
          onConfirm={(reason) => handleCancelBooking(booking.id, reason)}
        />
      </div>
    </AdminLayout>
  );
};
