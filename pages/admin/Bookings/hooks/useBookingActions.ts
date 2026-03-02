import { useState } from 'react';
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

interface Booking {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  vehicle_registration: string;
  vehicle_make: string;
  cruise_line: string;
  ship_name: string;
  terminal: string | null;
  drop_off_datetime: string;
  return_datetime: string;
  number_of_passengers: number;
  status: string;
  internal_notes: string | null;
}

export const useBookingActions = (
  booking: Booking | undefined,
  updateBooking: (id: string, data: Record<string, unknown>) => Promise<void>,
  fetchBookings: () => Promise<void>
) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
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

  const handleStatusChange = async (newStatus: string, bookingId: string) => {
    try {
      await updateBooking(bookingId, {
        status: newStatus,
      });
      toast.success('Booking status updated successfully');
      fetchBookings();
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

  const handleEditSubmit = async (bookingId: string) => {
    try {
      await updateBooking(bookingId, {
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
      fetchBookings();
    } catch (error) {
      toast.error('Failed to update booking');
      console.error('Error updating booking:', error);
    }
  };

  const openCancelDialog = () => {
    setIsCancelDialogOpen(true);
  };

  const handleCancelBooking = async (bookingId: string, reason: string) => {
    try {
      await updateBooking(bookingId, {
        status: 'cancelled',
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString(),
      });

      toast.success('Booking cancelled successfully');
      setIsCancelDialogOpen(false);
      fetchBookings();
    } catch (error) {
      toast.error('Failed to cancel booking');
      console.error('Error cancelling booking:', error);
    }
  };

  return {
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
  };
};
