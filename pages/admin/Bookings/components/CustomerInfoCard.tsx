import React from 'react';
import { User, Mail, Phone } from 'lucide-react';

interface Booking {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  number_of_passengers: number;
}

interface CustomerInfoCardProps {
  booking: Booking;
}

export const CustomerInfoCard: React.FC<CustomerInfoCardProps> = ({ booking }) => {
  return (
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
  );
};
