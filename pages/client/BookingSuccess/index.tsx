import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Layout } from '../../../components/client/Layout';
import { Button } from '../../../components/client/Button';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { formatDateTime } from '../../../lib/dateUtils';
import { useBookingsStore } from '../../../stores/bookingsStore';

export function BookingSuccess() {
  const [searchParams] = useSearchParams();
  const bookingRef = searchParams.get('booking_ref');
  const [booking, setBooking] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchBookingByReference } = useBookingsStore();

  useEffect(() => {
    const loadBooking = async () => {
      if (!bookingRef) {
        setError('No booking reference provided');
        setLoading(false);
        return;
      }

      try {
        const bookingData = await fetchBookingByReference(bookingRef);

        if (!bookingData) {
          setError('Booking not found');
          setLoading(false);
          return;
        }

        setBooking(bookingData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading booking:', err);
        setError('Failed to load booking details');
        setLoading(false);
      }
    };

    loadBooking();
  }, [bookingRef, fetchBookingByReference]);

  const formatDate = (dateString: string): string => {
    return formatDateTime(dateString);
  };

  const formatPrice = (pence: number): string => {
    return `£${(pence / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600">Loading booking details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !booking) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="max-w-md w-full bg-white p-8 rounded-lg border border-gray-200 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'Unable to load booking details'}</p>
            <Link to="/">
              <Button>Return to Home</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-2xl mx-auto">
          {/* Success Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            {/* Success Icon */}
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-16 h-16 text-green-600" strokeWidth={2.5} />
            </div>

            {/* Main Message */}
            <h1 className="text-3xl font-bold text-brand-dark mb-3">Booking Confirmed!</h1>
            <p className="text-gray-600 mb-6">
              Thank you {booking.first_name as string}. Your booking has been confirmed.
            </p>

            {/* Booking Reference */}
            <div className="border border-gray-300 rounded-lg p-5 mb-6 inline-block">
              <p className="text-sm text-gray-600 mb-1">Your booking reference</p>
              <p className="text-3xl font-bold text-gray-900">{booking.booking_reference as string}</p>
            </div>

            {/* Email Notice */}
            <div className="border border-gray-300 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                A confirmation email has been sent to <strong>{booking.email as string}</strong>
              </p>
            </div>

            {/* Summary Box */}
            <div className="border border-gray-200 rounded-lg p-5 mb-6 text-left">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Ship</p>
                  <p className="font-semibold text-gray-900">{booking.ship_name as string}</p>
                </div>
                <div>
                  <p className="text-gray-500">Terminal</p>
                  <p className="font-semibold text-gray-900">{booking.terminal as string}</p>
                </div>
                <div>
                  <p className="text-gray-500">Drop Off</p>
                  <p className="font-semibold text-gray-900">{formatDate(booking.drop_off_datetime as string)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Return</p>
                  <p className="font-semibold text-gray-900">{formatDate(booking.return_datetime as string)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Vehicle</p>
                  <p className="font-semibold text-gray-900">{booking.vehicle_registration as string}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total Paid</p>
                  <p className="font-semibold text-primary text-lg">{formatPrice(booking.total as number)}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Link to="/" onClick={() => window.scrollTo(0, 0)}>
                <Button variant="primary" className="py-2 px-4 text-sm">
                  Return to Home
                </Button>
              </Link>
              <Link to={`/manage-booking?ref=${booking.booking_reference as string}`} onClick={() => window.scrollTo(0, 0)}>
                <Button variant="secondary" className="py-2 px-4 text-sm">
                  View Booking
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
