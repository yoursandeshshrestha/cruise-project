import { BookingState } from '../../../../types';
import { useSystemSettingsStore } from '../../../../stores/systemSettingsStore';

export const useStepValidation = (booking: BookingState) => {
  const { getSetting } = useSystemSettingsStore();
  const isMinimumDaysRequired = getSetting<boolean>('features', 'minimum_days_required', true) ?? true;

  const isStep1Valid = () => {
    // Basic field validation
    const hasAllFields = (
      booking.dropOffDate !== '' &&
      booking.dropOffTime !== '' &&
      booking.returnDate !== '' &&
      booking.returnTime !== '' &&
      booking.cruiseLine !== '' &&
      booking.shipName !== '' &&
      booking.terminal !== '' &&
      booking.passengers > 0
    );

    if (!hasAllFields) {
      console.log('[useStepValidation] Missing required fields');
      return false;
    }

    // If minimum days requirement is disabled, skip the check
    if (!isMinimumDaysRequired) {
      console.log('[useStepValidation] Minimum days requirement is disabled');
      return true;
    }

    // Calculate number of days (inclusive of both drop-off and return dates)
    const start = new Date(booking.dropOffDate);
    const end = new Date(booking.returnDate);
    const diffTime = end.getTime() - start.getTime();
    const numberOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both dates

    console.log('[useStepValidation] Checking days:', {
      dropOffDate: booking.dropOffDate,
      returnDate: booking.returnDate,
      numberOfDays,
      meetsMinimum: numberOfDays >= 7,
      isMinimumDaysRequired
    });

    // Check 7-day minimum
    return numberOfDays >= 7;
  };

  const isStep3Valid = () => {
    return (
      booking.firstName.trim() !== '' &&
      booking.lastName.trim() !== '' &&
      booking.email.trim() !== '' &&
      booking.mobile.trim() !== '' &&
      booking.vehicleReg.trim() !== '' &&
      booking.vehicleMake.trim() !== ''
    );
  };

  return {
    isStep1Valid,
    isStep3Valid,
  };
};
