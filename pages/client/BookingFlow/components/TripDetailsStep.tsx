import React, { useMemo } from 'react';
import { Ship, MapPin, AlertCircle } from 'lucide-react';
import { DatePicker } from '../../../../components/client/DatePicker';
import { TimePicker } from '../../../../components/client/TimePicker';
import { SearchableSelect } from '../../../../components/client/SearchableSelect';
import { PassengerSelect } from '../../../../components/client/PassengerSelect';
import { VehicleTypeSelect } from '../../../../components/client/VehicleTypeSelect';
import { BookingState, VehicleType } from '../../../../types';
import { useSystemSettingsStore } from '../../../../stores/systemSettingsStore';

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
  const { getSetting } = useSystemSettingsStore();
  const isMinimumDaysRequired = getSetting<boolean>('features', 'minimum_days_required', true) ?? true;

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

  // Calculate number of days selected (inclusive of both drop-off and return dates)
  const numberOfDays = useMemo(() => {
    if (!booking.dropOffDate || !booking.returnDate) {
      return 0;
    }
    const start = parseLocalDate(booking.dropOffDate);
    const end = parseLocalDate(booking.returnDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    return diffDays;
  }, [booking.dropOffDate, booking.returnDate]);

  const hasValidDates = booking.dropOffDate && booking.returnDate;
  const meetsMinimumDays = hasValidDates && numberOfDays >= 7;

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <h2 className="text-2xl font-bold text-brand-dark">Trip Details</h2>

      {/* Minimum days requirement info */}
      {isMinimumDaysRequired && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <AlertCircle size={20} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">Minimum Booking Requirement</p>
            <p className="text-sm text-blue-700 mt-1">
              A minimum of 7 days parking is required for all bookings.
            </p>
          </div>
        </div>
      )}

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

      {/* Show warning if dates are selected but don't meet minimum */}
      {isMinimumDaysRequired && hasValidDates && numberOfDays > 0 && numberOfDays < 7 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
          <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900">Insufficient Parking Duration</p>
            <p className="text-sm text-amber-700 mt-1">
              You have selected {numberOfDays} day{numberOfDays !== 1 ? 's' : ''}. Please select at least 7 days to continue.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
