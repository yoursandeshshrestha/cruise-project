import React from 'react';
import { Car } from 'lucide-react';

interface Booking {
  vehicle_registration: string;
  vehicle_make: string;
  parking_type: string;
}

interface VehicleInfoCardProps {
  booking: Booking;
}

export const VehicleInfoCard: React.FC<VehicleInfoCardProps> = ({ booking }) => {
  return (
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
  );
};
