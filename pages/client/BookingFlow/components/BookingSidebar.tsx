import React, { useState } from 'react';
import { Lock, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { BookingState } from '../../../../types';
import { PricingNotice } from './PricingNotice';
import { formatDate } from '../../../../lib/dateUtils';

interface AddOn {
  slug: string;
  name: string;
  price: number;
}

interface DailyRate {
  day: number;
  date: string;
  rate: number;
}

interface PricingBreakdownItem {
  name: string;
  days: number;
  total: number;
  dailyRates: DailyRate[];
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
    pricingBreakdown: PricingBreakdownItem[];
    weeklyDiscountPercent: number;
    weeklyDiscountAmount: number;
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
  vanMultiplier?: number;
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
  vanMultiplier,
}) => {
  const minStayCost = settings?.minimumStayCost || 45.00;
  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>({});

  const {
    numberOfDays,
    parkingCost,
    isMinimumApplied,
    addOnsCost,
    vatAmount,
    subtotalWithVAT,
    finalTotal,
    pricingBreakdown,
  } = calculations;

  // Calculate VAT rate from the actual VAT amount and base cost
  const baseCost = parkingCost + addOnsCost;
  const vatRate = baseCost > 0 ? vatAmount / baseCost : 0;

  const toggleGroup = (index: number) => {
    setExpandedGroups(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

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
            <p className="font-semibold">{formatDate(booking.dropOffDate)} at {booking.dropOffTime}</p>
          </div>
        )}
        {booking.returnDate && (
          <div>
            <p className="text-gray-500 text-xs">Return</p>
            <p className="font-semibold">{formatDate(booking.returnDate)} at {booking.returnTime}</p>
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
        {booking.vehicleType && (
          <div>
            <p className="text-gray-500 text-xs">Vehicle Type</p>
            <p className="font-semibold">
              {booking.vehicleType === 'car'
                ? 'Car'
                : `Van (${vanMultiplier?.toFixed(1) || '1.5'}× car price)`}
            </p>
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
              {pricingBreakdown.length > 0 ? (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm font-semibold text-gray-700">
                    <span>Parking ({numberOfDays} {numberOfDays === 1 ? 'day' : 'days'})</span>
                    <span>£{(parkingCost + calculations.weeklyDiscountAmount).toFixed(2)}</span>
                  </div>
                  {pricingBreakdown.map((item, index) => (
                    <div key={index} className="pl-3">
                      <div
                        className="flex justify-between items-center text-xs text-gray-500 cursor-pointer hover:text-gray-700"
                        onClick={() => toggleGroup(index)}
                      >
                        <span className="flex items-center gap-1">
                          {item.name}: {item.days} {item.days === 1 ? 'day' : 'days'}
                          {expandedGroups[index] ? (
                            <ChevronUp size={14} className="text-gray-400" />
                          ) : (
                            <ChevronDown size={14} className="text-gray-400" />
                          )}
                        </span>
                        <span>£{item.total.toFixed(2)}</span>
                      </div>
                      {expandedGroups[index] && (
                        <div className="mt-1 space-y-0.5 pl-4 pb-1">
                          {item.dailyRates.map((daily, dayIndex) => (
                            <div key={dayIndex} className="flex justify-between text-xs text-gray-400">
                              <span>Day {daily.day} ({daily.date})</span>
                              <span>£{daily.rate.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Parking ({numberOfDays} {numberOfDays === 1 ? 'day' : 'days'})</span>
                  <span>£{(parkingCost + calculations.weeklyDiscountAmount).toFixed(2)}</span>
                </div>
              )}
              {calculations.weeklyDiscountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600 items-center">
                  <span className="flex items-center gap-1">
                    Weekly Discount ({calculations.weeklyDiscountPercent}%)
                  </span>
                  <span>-£{calculations.weeklyDiscountAmount.toFixed(2)}</span>
                </div>
              )}
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
          {vatRate > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>VAT ({(vatRate * 100).toFixed(0)}%)</span>
              <span>£{vatAmount.toFixed(2)}</span>
            </div>
          )}
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
