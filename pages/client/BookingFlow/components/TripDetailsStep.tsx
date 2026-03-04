import React from 'react';
import { Ship, MapPin } from 'lucide-react';
import { DatePicker } from '../../../../components/client/DatePicker';
import { TimePicker } from '../../../../components/client/TimePicker';
import { SearchableSelect } from '../../../../components/client/SearchableSelect';
import { PassengerSelect } from '../../../../components/client/PassengerSelect';
import { VehicleTypeSelect } from '../../../../components/client/VehicleTypeSelect';
import { BookingState, VehicleType } from '../../../../types';

interface CruiseLine {
  name: string;
  ships: string[];
}

interface Terminal {
  name: string;
}

interface TripDetailsStepProps {
  booking: BookingState;
  updateBooking: (field: keyof BookingState, value: string | number) => void;
  cruiseLines: CruiseLine[];
  terminals: Terminal[];
}

export const TripDetailsStep: React.FC<TripDetailsStepProps> = ({
  booking,
  updateBooking,
  cruiseLines,
  terminals,
}) => {
  // Helper to convert date string to local Date object
  const parseLocalDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Helper to format Date object to YYYY-MM-DD string (local time)
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <h2 className="text-2xl font-bold text-brand-dark">Trip Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DatePicker
          label="Drop Off Date"
          placeholder="Select date..."
          value={booking.dropOffDate ? parseLocalDate(booking.dropOffDate) : undefined}
          onChange={(date) => updateBooking('dropOffDate', date ? formatLocalDate(date) : '')}
          minDate={new Date()}
          required
        />
        <TimePicker
          label="Drop Off Time (approx)"
          value={booking.dropOffTime}
          onChange={(time) => updateBooking('dropOffTime', time)}
          timeSlots={['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00']}
          required
        />
        <DatePicker
          label="Return Date"
          placeholder="Select date..."
          value={booking.returnDate ? parseLocalDate(booking.returnDate) : undefined}
          onChange={(date) => updateBooking('returnDate', date ? formatLocalDate(date) : '')}
          minDate={booking.dropOffDate ? parseLocalDate(booking.dropOffDate) : new Date()}
          required
        />
        <TimePicker
          label="Return Time (approx)"
          value={booking.returnTime}
          onChange={(time) => updateBooking('returnTime', time)}
          timeSlots={['06:00','07:00','08:00','09:00','10:00','11:00','12:00']}
          required
        />
        <SearchableSelect
          label="Cruise Line"
          placeholder="Select Cruise Line..."
          icon={<Ship size={16} className="text-primary" />}
          options={cruiseLines.filter(c => c && c.name).map(c => ({ value: c.name, label: c.name }))}
          value={booking.cruiseLine}
          onChange={value => {
            updateBooking('cruiseLine', value);
            updateBooking('shipName', ''); // Reset ship when cruise line changes
          }}
          required
        />
        <SearchableSelect
          label="Ship Name"
          placeholder="Select Ship..."
          icon={<Ship size={16} className="text-primary" />}
          options={
            booking.cruiseLine
              ? (cruiseLines.find(c => c && c.name === booking.cruiseLine)?.ships?.filter(s => s).map(s => ({ value: s, label: s })) || [])
              : []
          }
          value={booking.shipName}
          onChange={value => updateBooking('shipName', value)}
          disabled={!booking.cruiseLine}
          required
        />
        <SearchableSelect
          label="Cruise Terminal"
          placeholder="Select Terminal..."
          icon={<MapPin size={16} className="text-primary" />}
          options={terminals.filter(t => t && t.name).map(t => ({ value: t.name, label: t.name }))}
          value={booking.terminal || ''}
          onChange={value => updateBooking('terminal', value)}
          required
        />
        <PassengerSelect
          label="Passengers"
          value={booking.passengers}
          onChange={(count) => updateBooking('passengers', count)}
          min={1}
          max={15}
          required
        />
      </div>

      {/* Vehicle Type Selection - Full Width */}
      <div className="mt-2">
        <VehicleTypeSelect
          label="Vehicle Type"
          value={booking.vehicleType}
          onChange={(vehicleType: VehicleType) => updateBooking('vehicleType', vehicleType)}
          required
        />
      </div>
    </div>
  );
};
