import React from 'react';
import { Lock, Tag } from 'lucide-react';
import { BookingState } from '../../../../types';
import { PricingNotice } from './PricingNotice';

interface AddOn {
  slug: string;
  name: string;
  price: number;
}

interface BookingSidebarProps {
  booking: BookingState;
  addOns: AddOn[];
  calculations: {
    numberOfDays: number;
    parkingCost: number;
    isMinimumApplied: boolean;
    addOnsCost: number;
    vatAmount: number;
    subtotalWithVAT: number;
    finalTotal: number;
  };
  settings: {
    dailyRate: number;
    minimumStayCost: number;
    vatRate: number;
  } | null;
  appliedPromoCode: string;
  promoDiscount: number;
  cancellationPolicy: {
    show: boolean;
    text: string;
  };
  pricingReason?: string | null;
  pricingPriority?: number;
}

export const BookingSidebar: React.FC<BookingSidebarProps> = ({
  booking,
  addOns,
  calculations,
  settings,
  appliedPromoCode,
  promoDiscount,
  cancellationPolicy,
  pricingReason,
  pricingPriority,
}) => {
  const dailyRate = settings?.dailyRate || 12.50;
  const minStayCost = settings?.minimumStayCost || 45.00;
  const vatRate = settings?.vatRate || 0.20;

  const {
    numberOfDays,
    parkingCost,
    isMinimumApplied,
    addOnsCost,
    vatAmount,
    subtotalWithVAT,
    finalTotal,
  } = calculations;

  return (
    <div className="bg-white p-6 rounded-xl shadow-light sticky top-40 border border-gray-200">
      <h3 className="text-xl font-bold text-brand-dark mb-4 pb-4 border-b border-gray-200">
        Booking Summary
      </h3>

      {/* Pricing Notice */}
      {pricingReason && pricingPriority === 1 && (
        <div className="mb-4">
          <PricingNotice reason={pricingReason} priority={pricingPriority} />
        </div>
      )}

      <div className="space-y-4 text-sm">
        {booking.dropOffDate && (
          <div>
            <p className="text-gray-500 text-xs">Drop Off</p>
            <p className="font-semibold">{booking.dropOffDate} at {booking.dropOffTime}</p>
          </div>
        )}
        {booking.returnDate && (
          <div>
            <p className="text-gray-500 text-xs">Return</p>
            <p className="font-semibold">{booking.returnDate} at {booking.returnTime}</p>
          </div>
        )}
        {booking.shipName && (
          <div>
            <p className="text-gray-500 text-xs">Ship</p>
            <p className="font-semibold">{booking.shipName}</p>
          </div>
        )}
        {booking.terminal && (
          <div>
            <p className="text-gray-500 text-xs">Terminal</p>
            <p className="font-semibold">{booking.terminal}</p>
          </div>
        )}

        {booking.selectedAddOns.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-gray-500 text-xs mb-2">Add Ons</p>
            {booking.selectedAddOns.map(slug => {
              const addon = addOns.find(a => a.slug === slug);
              return (
                <div key={slug} className="flex justify-between mb-1">
                  <span>{addon?.name}</span>
                  <span>£{addon?.price.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-4 mt-4 space-y-2 border-t border-gray-200">
          {numberOfDays > 0 && (
            <>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Parking ({numberOfDays} {numberOfDays === 1 ? 'day' : 'days'} × £{dailyRate.toFixed(2)})</span>
                <span>£{parkingCost.toFixed(2)}</span>
              </div>
              {isMinimumApplied && (
                <div className="text-xs text-gray-500 -mt-1 mb-1">
                  Minimum charge of £{minStayCost.toFixed(2)} applied
                </div>
              )}
            </>
          )}
          {addOnsCost > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Add-ons</span>
              <span>£{addOnsCost.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-gray-600">
            <span>VAT ({(vatRate * 100).toFixed(0)}%)</span>
            <span>£{vatAmount.toFixed(2)}</span>
          </div>
          {(numberOfDays > 0 || addOnsCost > 0) && (
            <div className="flex justify-between text-sm text-gray-600 pt-2 border-t border-gray-200">
              <span>Subtotal</span>
              <span>£{subtotalWithVAT.toFixed(2)}</span>
            </div>
          )}
          {promoDiscount > 0 && (
            <div className="flex justify-between text-sm text-green-600 items-center gap-2">
              <span className="flex items-center gap-1">
                <Tag size={14} />
                Promo Discount ({appliedPromoCode})
              </span>
              <span>-£{promoDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-lg font-bold text-brand-dark pt-2 border-t border-gray-200">
            <span>Total</span>
            <span>£{finalTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {cancellationPolicy.show && cancellationPolicy.text && (
        <div className="mt-6 bg-blue-50 p-3 rounded flex gap-2 text-xs text-blue-800">
          <Lock size={14} className="shrink-0 mt-0.5" />
          <p>{cancellationPolicy.text}</p>
        </div>
      )}
    </div>
  );
};
