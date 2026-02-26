import React from 'react';
import { Input } from '../../../../components/client/Input';
import { Button } from '../../../../components/client/Button';
import { BookingState } from '../../../../types';

interface CustomerDetailsStepProps {
  booking: BookingState;
  updateBooking: (field: keyof BookingState, value: string) => void;
  appliedPromoCode: string;
  promoMessage: string;
  isValidatingPromo: boolean;
  onApplyPromo: () => void;
  onRemovePromo: () => void;
}

export const CustomerDetailsStep: React.FC<CustomerDetailsStepProps> = ({
  booking,
  updateBooking,
  appliedPromoCode,
  promoMessage,
  isValidatingPromo,
  onApplyPromo,
  onRemovePromo,
}) => {
  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <h2 className="text-2xl font-bold text-brand-dark">Your Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label={<><span className="text-red-600">*</span> Vehicle Registration</>}
          value={booking.vehicleReg}
          onChange={e => updateBooking('vehicleReg', e.target.value.toUpperCase())}
          placeholder="AB12 CDE"
        />
        <Input
          label={<><span className="text-red-600">*</span> Vehicle Make/Model</>}
          value={booking.vehicleMake}
          onChange={e => updateBooking('vehicleMake', e.target.value)}
          placeholder="e.g. Ford Focus"
        />
        <Input
          label={<><span className="text-red-600">*</span> First Name</>}
          value={booking.firstName}
          onChange={e => updateBooking('firstName', e.target.value)}
        />
        <Input
          label={<><span className="text-red-600">*</span> Last Name</>}
          value={booking.lastName}
          onChange={e => updateBooking('lastName', e.target.value)}
        />
        <Input
          label={<><span className="text-red-600">*</span> Email Address</>}
          type="email"
          value={booking.email}
          onChange={e => updateBooking('email', e.target.value)}
        />
        <Input
          label={<><span className="text-red-600">*</span> Mobile Number</>}
          type="tel"
          value={booking.mobile}
          onChange={e => updateBooking('mobile', e.target.value)}
          helperText="For shuttle updates on the day."
        />
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Promo Code (Optional)
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                value={booking.promoCode}
                onChange={e => {
                  updateBooking('promoCode', e.target.value.toUpperCase());
                  if (appliedPromoCode) {
                    onRemovePromo();
                  }
                }}
                placeholder="e.g. SAVE10"
                disabled={!!appliedPromoCode}
              />
            </div>
            {!appliedPromoCode ? (
              <Button
                onClick={onApplyPromo}
                disabled={!booking.promoCode || isValidatingPromo}
                className="whitespace-nowrap"
              >
                {isValidatingPromo ? 'Checking...' : 'Apply'}
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={onRemovePromo}
                className="whitespace-nowrap"
              >
                Remove
              </Button>
            )}
          </div>
          {promoMessage && (
            <p className={`text-sm mt-2 ${promoMessage.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
              {promoMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
