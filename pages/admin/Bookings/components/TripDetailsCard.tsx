import React from 'react';
import { Ship, Calendar } from 'lucide-react';

interface Booking {
  cruise_line: string;
  ship_name: string;
  terminal: string | null;
  drop_off_datetime: string;
  return_datetime: string;
}

interface TripDetailsCardProps {
  booking: Booking;
  formatDateTime: (dateString: string) => string;
}

export const TripDetailsCard: React.FC<TripDetailsCardProps> = ({ booking, formatDateTime }) => {
  return (
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
  );
};
