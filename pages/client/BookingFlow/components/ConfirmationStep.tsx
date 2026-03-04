import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '../../../../components/client/Button';
import { BookingState } from '../../../../types';
import { formatDate } from '../../../../lib/dateUtils';

interface ConfirmationStepProps {
  booking: BookingState;
  bookingReference: string;
}

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  booking,
  bookingReference,
}) => {
  return (
    <div className="text-center py-12 animate-in zoom-in duration-300">
      <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check size={48} strokeWidth={3} />
      </div>
      <h2 className="text-3xl font-bold text-brand-dark mb-4">Booking Confirmed!</h2>
      <p className="text-gray-600 mb-8">
        Thank you {booking.firstName}. Your booking reference is{' '}
        <span className="font-bold text-brand-dark">{bookingReference}</span>.
      </p>
      <div className="max-w-md mx-auto bg-gray-50 p-6 rounded-lg text-left mb-8">
        <p className="text-sm text-gray-600 mb-2">
          We have sent a confirmation email to <span className="font-bold">{booking.email}</span> with
          directions and arrival instructions.
        </p>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-500">Drop Off:</div>
            <div className="font-semibold text-right">
              {formatDate(booking.dropOffDate)} at {booking.dropOffTime}
            </div>
            <div className="text-gray-500">Return:</div>
            <div className="font-semibold text-right">
              {formatDate(booking.returnDate)} at {booking.returnTime}
            </div>
            <div className="text-gray-500">Ship:</div>
            <div className="font-semibold text-right">{booking.shipName}</div>
            {booking.terminal && (
              <>
                <div className="text-gray-500">Terminal:</div>
                <div className="font-semibold text-right">{booking.terminal}</div>
              </>
            )}
            <div className="text-gray-500">Passengers:</div>
            <div className="font-semibold text-right">{booking.passengers}</div>
          </div>
        </div>
      </div>
      <Link to="/">
        <Button>Return to Home</Button>
      </Link>
    </div>
  );
};
