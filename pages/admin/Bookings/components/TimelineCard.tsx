import React from 'react';
import { format } from 'date-fns';
import { formatDateTime } from '../../../../lib/dateUtils';

interface Booking {
  created_at: string;
  confirmed_at: string | null;
  checked_in_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
}

interface TimelineCardProps {
  booking: Booking;
}

export const TimelineCard: React.FC<TimelineCardProps> = ({ booking }) => {
  return (
    <div className="bg-admin-card-bg border border-border rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Timeline</h2>
      <div className="space-y-3 text-sm">
        <div>
          <label className="text-muted-foreground">Created</label>
          <p className="font-medium">{formatDateTime(booking.created_at)}</p>
        </div>
        {booking.confirmed_at && (
          <div>
            <label className="text-muted-foreground">Confirmed</label>
            <p className="font-medium">{formatDateTime(booking.confirmed_at)}</p>
          </div>
        )}
        {booking.checked_in_at && (
          <div>
            <label className="text-muted-foreground">Checked In</label>
            <p className="font-medium">{formatDateTime(booking.checked_in_at)}</p>
          </div>
        )}
        {booking.completed_at && (
          <div>
            <label className="text-muted-foreground">Completed</label>
            <p className="font-medium">{formatDateTime(booking.completed_at)}</p>
          </div>
        )}
        {booking.cancelled_at && (
          <div>
            <label className="text-muted-foreground">Cancelled</label>
            <p className="font-medium">{formatDateTime(booking.cancelled_at)}</p>
          </div>
        )}
      </div>
    </div>
  );
};
