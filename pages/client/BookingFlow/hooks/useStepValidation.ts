import { BookingState } from '../../../../types';

export const useStepValidation = (booking: BookingState) => {
  const isStep1Valid = () => {
    return (
      booking.dropOffDate !== '' &&
      booking.dropOffTime !== '' &&
      booking.returnDate !== '' &&
      booking.returnTime !== '' &&
      booking.cruiseLine !== '' &&
      booking.shipName !== '' &&
      booking.terminal !== '' &&
      booking.passengers > 0
    );
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
