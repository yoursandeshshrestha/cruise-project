import React, { useState, useEffect } from 'react';
import { DollarSign, CreditCard, ChevronDown, ChevronUp, History } from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';
import { usePricingStore } from '../../../../stores/pricingStore';
import { useAddOnsStore } from '../../../../stores/addOnsStore';

interface AmendmentHistoryEntry {
  amended_at: string;
  previous_drop_off_datetime: string;
  previous_return_datetime: string;
  previous_vehicle_registration: string;
  previous_vehicle_make: string;
  previous_subtotal: number;
  previous_vat: number;
  previous_total: number;
  new_drop_off_datetime: string;
  new_return_datetime: string;
  new_vehicle_registration: string;
  new_vehicle_make: string;
  amendment_charge: number;
  amendment_vat: number;
  amendment_subtotal: number;
  stripe_payment_intent_id: string;
  stripe_checkout_session_id: string;
  // Additional breakdown fields
  daily_breakdown?: Array<{ day: number; date: string; rate: number }> | null;
  amendment_fee?: number | null;
  old_parking_cost?: number | null;
  new_parking_cost?: number | null;
  add_ons_cost?: number | null;
  price_difference?: number | null;
  vat_rate?: number | null;
  pricing_reason?: string | null;
  previous_weekly_discount_percent?: number | null;
  previous_weekly_discount_amount?: number | null;
}

interface Booking {
  drop_off_datetime: string;
  return_datetime: string;
  vehicle_type: string;
  add_ons: string[] | null;
  subtotal: number;
  vat: number;
  discount: number;
  total: number;
  promo_code: string | null;
  weekly_discount_percent: number | null;
  weekly_discount_amount: number | null;
  payment_status: string | null;
  stripe_payment_intent_id: string | null;
  amendment_history?: AmendmentHistoryEntry[];
  // Original booking fields (immutable after creation)
  original_subtotal?: number;
  original_vat?: number;
  original_total?: number;
  original_drop_off_datetime?: string;
  original_return_datetime?: string;
}

interface PaymentCardProps {
  booking: Booking;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({ booking }) => {
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [isPricingExpanded, setIsPricingExpanded] = useState(true);
  const [isDailyBreakdownExpanded, setIsDailyBreakdownExpanded] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>({});
  const hasAmendments = booking.amendment_history && booking.amendment_history.length > 0;

  const { getPricingForDate, pricingRules, fetchPricingRules } = usePricingStore();
  const { addOns, fetchActiveAddOns } = useAddOnsStore();

  // Fetch data on mount
  useEffect(() => {
    if (pricingRules.length === 0) {
      fetchPricingRules();
    }
    if (addOns.length === 0) {
      fetchActiveAddOns();
    }
  }, [pricingRules.length, addOns.length, fetchPricingRules, fetchActiveAddOns]);

  // Calculate parking details
  // Use ORIGINAL booking fields if available, otherwise fallback to amendment history or current values
  const originalDropOff = booking.original_drop_off_datetime
    ? booking.original_drop_off_datetime
    : hasAmendments
    ? booking.amendment_history![booking.amendment_history!.length - 1].previous_drop_off_datetime
    : booking.drop_off_datetime;
  const originalReturn = booking.original_return_datetime
    ? booking.original_return_datetime
    : hasAmendments
    ? booking.amendment_history![booking.amendment_history!.length - 1].previous_return_datetime
    : booking.return_datetime;

  const dropOffDate = new Date(originalDropOff);
  const returnDate = new Date(originalReturn);
  // Match the exact calculation from booking submission
  const diffTime = Math.abs(returnDate.getTime() - dropOffDate.getTime());
  const parkingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  // Get pricing rule for drop-off date (for VAT and van multiplier)
  const pricingRule = getPricingForDate(dropOffDate);
  const vanMultiplier = pricingRule?.van_multiplier || 1.5;
  const vatRate = pricingRule?.vat_rate || 0;

  // Calculate day-by-day pricing
  const isVan = booking.vehicle_type?.toLowerCase() === 'van';

  interface DailyCost {
    name: string;
    rate: number;
    ruleId: string;
    date: Date;
    dayNumber: number;
  }

  interface PricingGroup {
    name: string;
    days: number;
    total: number;
    ruleId: string;
    dailyRates: Array<{
      day: number;
      date: string;
      rate: number;
    }>;
  }

  const dailyCosts: DailyCost[] = [];
  let carParkingTotal = 0;

  for (let i = 0; i < parkingDays; i++) {
    const currentDate = addDays(dropOffDate, i);
    const dayPricingRule = getPricingForDate(currentDate);
    const dayPrice = dayPricingRule?.price_per_day || 0;
    carParkingTotal += dayPrice;

    dailyCosts.push({
      name: dayPricingRule?.name || 'Default',
      rate: dayPrice,
      ruleId: dayPricingRule?.id || 'default',
      date: currentDate,
      dayNumber: i + 1,
    });
  }

  // Calculate parking costs (prices from DB are in pounds, convert to pence)
  const parkingSubtotalPounds = isVan ? Math.round(carParkingTotal * vanMultiplier) : carParkingTotal;
  const parkingSubtotalPence = Math.round(parkingSubtotalPounds * 100); // Convert to pence

  // Group consecutive days with the same pricing rule for display
  const pricingBreakdown: PricingGroup[] = [];
  let currentGroup: PricingGroup | null = null;

  dailyCosts.forEach((day) => {
    if (currentGroup && currentGroup.ruleId === day.ruleId) {
      // Same pricing rule, add to current group
      currentGroup.days += 1;
      currentGroup.total += day.rate;
      currentGroup.dailyRates.push({
        day: day.dayNumber,
        date: format(day.date, 'dd MMM'),
        rate: day.rate,
      });
    } else {
      // Different pricing rule, start new group
      if (currentGroup) {
        pricingBreakdown.push(currentGroup);
      }
      currentGroup = {
        name: day.name,
        days: 1,
        total: day.rate,
        ruleId: day.ruleId,
        dailyRates: [{
          day: day.dayNumber,
          date: format(day.date, 'dd MMM'),
          rate: day.rate,
        }],
      };
    }
  });

  // Add the last group
  if (currentGroup) {
    pricingBreakdown.push(currentGroup);
  }

  // Calculate add-ons total (prices from DB are already in pence)
  const selectedAddOns = booking.add_ons || [];
  const addOnsTotal = selectedAddOns.reduce((total, slug) => {
    const addOn = addOns.find(a => a.slug === slug);
    return total + (addOn?.price || 0);
  }, 0);

  // Calculate totals (all in pence)
  // Apply weekly discount to parking before adding add-ons
  const parkingAfterWeeklyDiscount = parkingSubtotalPence - (booking.weekly_discount_amount || 0);
  const calculatedSubtotal = parkingAfterWeeklyDiscount + addOnsTotal;
  const calculatedVAT = Math.round(calculatedSubtotal * vatRate);
  const orderDiscount = booking.discount || 0;
  const calculatedTotal = calculatedSubtotal + calculatedVAT - orderDiscount;

  // Use original booking values if available, otherwise use calculated values
  const orderSubtotal = booking.original_subtotal ?? calculatedSubtotal;
  const orderVAT = booking.original_vat ?? calculatedVAT;
  const orderTotal = booking.original_total ?? calculatedTotal;

  const toggleGroup = (index: number) => {
    setExpandedGroups(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <>
      {/* Detailed Pricing Breakdown */}
      <div className="bg-admin-card-bg border border-border rounded-lg p-6">
        <div
          className="flex items-center gap-2 mb-4 cursor-pointer"
          onClick={() => setIsPricingExpanded(!isPricingExpanded)}
        >
          <DollarSign className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold flex-1">Pricing Breakdown</h2>
          {isPricingExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>

        {isPricingExpanded && (
          <div className="space-y-4">
            {/* SECTION 1: ORIGINAL BOOKING */}
            <div className="bg-white border-2 border-gray-300 rounded-lg p-5">
              <h3 className="text-base font-bold text-gray-900 mb-4">Original Booking</h3>

              {/* Parking */}
              <div className="space-y-2 mb-4">
                {pricingBreakdown.length > 0 ? (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm font-semibold text-gray-700">
                      <span>Parking ({parkingDays} {parkingDays === 1 ? 'day' : 'days'})</span>
                      <span>£{carParkingTotal.toFixed(2)}</span>
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
                    <span>Parking ({parkingDays} {parkingDays === 1 ? 'day' : 'days'})</span>
                    <span>£{carParkingTotal.toFixed(2)}</span>
                  </div>
                )}

                {/* Van Multiplier */}
                {isVan && (
                  <div className="flex justify-between text-sm text-blue-700 items-center">
                    <span>Van Surcharge ({vanMultiplier}×)</span>
                    <span>£{(Math.round(carParkingTotal * vanMultiplier) - carParkingTotal).toFixed(2)}</span>
                  </div>
                )}

                {/* Weekly discount */}
                {(booking.weekly_discount_amount ?? 0) > 0 && (
                  <>
                    <div className="flex justify-between text-sm text-green-600 items-center">
                      <span className="flex items-center gap-1">
                        Weekly Discount ({booking.weekly_discount_percent}%)
                      </span>
                      <span>-£{(booking.weekly_discount_amount / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-800 font-semibold items-center pt-1 border-t border-gray-300">
                      <span>Parking Subtotal</span>
                      <span>£{((parkingSubtotalPence - booking.weekly_discount_amount) / 100).toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Add-ons */}
              {selectedAddOns.length > 0 && (
                <div className="space-y-2 mb-4">
                  {selectedAddOns.map(slug => {
                    const addOn = addOns.find(a => a.slug === slug);
                    return addOn ? (
                      <div key={slug} className="flex justify-between text-sm">
                        <span className="text-gray-700">{addOn.name}</span>
                        <span className="font-semibold">£{(addOn.price / 100).toFixed(2)}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              )}

              {/* Subtotal, Promo, VAT */}
              <div className="space-y-2 pt-3 border-t border-gray-300">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>£{(orderSubtotal / 100).toFixed(2)}</span>
                </div>

                {booking.promo_code && orderDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-700">
                    <span>Promo ({booking.promo_code})</span>
                    <span>-£{(orderDiscount / 100).toFixed(2)}</span>
                  </div>
                )}

                {vatRate > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">VAT ({(vatRate * 100).toFixed(0)}%)</span>
                    <span>£{(orderVAT / 100).toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between pt-2 border-t-2 border-gray-400">
                  <span className="font-bold text-gray-900">Original Booking Total</span>
                  <span className="text-lg font-bold text-gray-900">£{(orderTotal / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* SECTION 2: AMENDMENTS */}
            {hasAmendments && (
              <div className="bg-white border-2 border-blue-300 rounded-lg p-5">
                <h3 className="text-base font-bold text-gray-900 mb-4">Amendments</h3>

                <div className="space-y-4">
                  {booking.amendment_history!.map((amendment, index) => {
                    const amendmentNumber = booking.amendment_history!.length - index;

                    // Calculate new booking day-by-day pricing
                    const newDropOff = new Date(amendment.new_drop_off_datetime);
                    const newReturn = new Date(amendment.new_return_datetime);
                    const newDiffTime = Math.abs(newReturn.getTime() - newDropOff.getTime());
                    const newDays = Math.ceil(newDiffTime / (1000 * 60 * 60 * 24)) + 1;

                    const newDailyCosts: Array<{ name: string; rate: number; ruleId: string; }> = [];
                    let newCarParkingTotal = 0;
                    for (let i = 0; i < newDays; i++) {
                      const currentDate = addDays(newDropOff, i);
                      const dayPricingRule = getPricingForDate(currentDate);
                      const dayPrice = dayPricingRule?.price_per_day || 0;
                      newCarParkingTotal += dayPrice;
                      newDailyCosts.push({
                        name: dayPricingRule?.name || 'Default',
                        rate: dayPrice,
                        ruleId: dayPricingRule?.id || 'default',
                      });
                    }

                    // Group consecutive days
                    const newPricingBreakdown: Array<{ name: string; days: number; total: number; ruleId: string }> = [];
                    let newCurrentGroup: { name: string; days: number; total: number; ruleId: string } | null = null;
                    newDailyCosts.forEach((day) => {
                      if (newCurrentGroup && newCurrentGroup.ruleId === day.ruleId) {
                        newCurrentGroup.days += 1;
                        newCurrentGroup.total += day.rate;
                      } else {
                        if (newCurrentGroup) {
                          newPricingBreakdown.push(newCurrentGroup);
                        }
                        newCurrentGroup = {
                          name: day.name,
                          days: 1,
                          total: day.rate,
                          ruleId: day.ruleId,
                        };
                      }
                    });
                    if (newCurrentGroup) {
                      newPricingBreakdown.push(newCurrentGroup);
                    }

                    const newPricingRule = getPricingForDate(newDropOff);
                    const newVanMultiplier = newPricingRule?.van_multiplier || 1.5;
                    const newParkingTotal = isVan ? Math.round(newCarParkingTotal * newVanMultiplier) : newCarParkingTotal;

                    // Calculate previous parking from dates
                    const prevDropOff = new Date(amendment.previous_drop_off_datetime);
                    const prevReturn = new Date(amendment.previous_return_datetime);
                    const prevDiffTime = Math.abs(prevReturn.getTime() - prevDropOff.getTime());
                    const prevDays = Math.ceil(prevDiffTime / (1000 * 60 * 60 * 24)) + 1;

                    let prevCarParkingTotal = 0;
                    for (let i = 0; i < prevDays; i++) {
                      const currentDate = addDays(prevDropOff, i);
                      const dayPricingRule = getPricingForDate(currentDate);
                      const dayPrice = dayPricingRule?.price_per_day || 0;
                      prevCarParkingTotal += dayPrice;
                    }

                    const prevPricingRule = getPricingForDate(prevDropOff);
                    const prevVanMultiplier = prevPricingRule?.van_multiplier || 1.5;
                    const prevParkingSubtotal = isVan ? Math.round(prevCarParkingTotal * prevVanMultiplier) : prevCarParkingTotal;
                    const prevParkingCost = prevParkingSubtotal * 100; // Convert to pence

                    // Use booking's weekly discount for previous parking
                    const prevWeeklyDiscount = booking.weekly_discount_amount || 0;
                    const prevParkingWithDiscount = prevParkingCost - prevWeeklyDiscount;

                    return (
                      <div key={index} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold text-blue-900">Amendment #{amendmentNumber}</span>
                          <span className="font-bold text-blue-700 text-lg">+£{(amendment.amendment_charge / 100).toFixed(2)}</span>
                        </div>

                        {/* Date Changes */}
                        <div className="text-xs text-gray-600 mb-3 bg-white rounded p-2">
                          <div className="flex justify-between">
                            <span>Previous:</span>
                            <span className="font-mono">{format(new Date(amendment.previous_drop_off_datetime), 'dd MMM')} - {format(new Date(amendment.previous_return_datetime), 'dd MMM, yyyy')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>New:</span>
                            <span className="font-mono text-blue-600">{format(newDropOff, 'dd MMM')} - {format(newReturn, 'dd MMM, yyyy')}</span>
                          </div>
                        </div>

                        {/* Amendment Calculation */}
                        <div className="space-y-1 text-sm bg-white rounded-lg p-3">
                          {/* Previous Parking with discount */}
                          <div className="flex justify-between text-gray-600">
                            <span>Previous Parking (with discount)</span>
                            <span>£{(prevParkingWithDiscount / 100).toFixed(2)}</span>
                          </div>

                          {/* New Parking with breakdown */}
                          <div className="border-t border-gray-200 pt-2 mt-2">
                            <div className="flex justify-between font-semibold text-gray-700 mb-1">
                              <span>New Parking ({newDays} {newDays === 1 ? 'day' : 'days'})</span>
                              <span>£{newCarParkingTotal.toFixed(2)}</span>
                            </div>
                            {newPricingBreakdown.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-xs text-gray-500 pl-3">
                                <span>{item.name}: {item.days} {item.days === 1 ? 'day' : 'days'}</span>
                                <span>£{item.total.toFixed(2)}</span>
                              </div>
                            ))}

                            {/* Van Surcharge */}
                            {isVan && (
                              <div className="flex justify-between text-xs text-blue-700 pl-3">
                                <span>Van Surcharge ({newVanMultiplier}×)</span>
                                <span>£{(Math.round(newCarParkingTotal * newVanMultiplier) - newCarParkingTotal).toFixed(2)}</span>
                              </div>
                            )}

                            <div className="flex justify-between font-medium text-gray-800 mt-1 pt-1 border-t border-gray-200">
                              <span>New Parking Total</span>
                              <span>£{newParkingTotal.toFixed(2)}</span>
                            </div>
                          </div>

                          {(() => {
                            // Calculate parking difference once
                            const parkingDiff = newParkingTotal - prevParkingWithDiscount / 100;
                            // Only use positive parking difference for fee calculation (no refunds)
                            const chargeableParkingDiff = Math.max(0, parkingDiff);
                            const amendmentFeeAmount = amendment.amendment_subtotal - (chargeableParkingDiff * 100);

                            return (
                              <>
                                {/* Parking Difference */}
                                <div className={`flex justify-between font-semibold border-t border-blue-200 pt-2 mt-2 ${parkingDiff < 0 ? 'text-gray-600' : 'text-blue-600'}`}>
                                  <span>Parking Difference</span>
                                  <span>{parkingDiff < 0 ? '-' : ''}£{Math.abs(parkingDiff).toFixed(2)}</span>
                                </div>

                                {/* Amendment Fee */}
                                {amendmentFeeAmount > 0 && (
                                  <div className="flex justify-between text-gray-600">
                                    <span>Amendment Fee</span>
                                    <span>£{(amendmentFeeAmount / 100).toFixed(2)}</span>
                                  </div>
                                )}
                              </>
                            );
                          })()}

                          {/* Subtotal */}
                          <div className="flex justify-between text-gray-700 font-semibold border-t border-gray-300 pt-2 mt-2">
                            <span>Subtotal</span>
                            <span>£{(amendment.amendment_subtotal / 100).toFixed(2)}</span>
                          </div>

                          {/* VAT */}
                          {amendment.amendment_vat > 0 && (
                            <div className="flex justify-between text-gray-600">
                              <span>VAT {amendment.vat_rate ? `(${(amendment.vat_rate * 100).toFixed(0)}%)` : ''}</span>
                              <span>£{(amendment.amendment_vat / 100).toFixed(2)}</span>
                            </div>
                          )}

                          {/* Total */}
                          <div className="flex justify-between text-blue-900 font-bold text-base pt-2 border-t-2 border-blue-400">
                            <span>Amendment Total</span>
                            <span>£{(amendment.amendment_charge / 100).toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Pricing Reason */}
                        {amendment.pricing_reason && (
                          <div className="mt-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                            <span className="font-medium">Special Pricing:</span> {amendment.pricing_reason}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-4 mt-4 border-t-2 border-blue-400">
                  <span className="font-bold text-gray-900">Total Amendments</span>
                  <span className="text-lg font-bold text-blue-700">
                    +£{(booking.amendment_history!.reduce((sum, a) => sum + a.amendment_charge, 0) / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* SECTION 3: FINAL TOTAL */}
            <div className="bg-linear-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-lg p-5">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total Paid</span>
                <span className="text-2xl font-bold text-green-700">
                  £{((orderTotal + (hasAmendments ? booking.amendment_history!.reduce((sum, a) => sum + a.amendment_charge, 0) : 0)) / 100).toFixed(2)}
                </span>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Amendment History */}
      {hasAmendments && (
        <div className="bg-admin-card-bg border border-border rounded-lg p-6">
          <div
            className="flex items-center gap-2 mb-4 cursor-pointer"
            onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
          >
            <History className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold flex-1">Amendment History</h2>
            {isHistoryExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>

          {isHistoryExpanded && (
            <div className="space-y-4">
              {booking.amendment_history!.map((amendment, index) => {

                return (
                  <div key={index} className="border-t pt-4 first:border-t-0 first:pt-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(amendment.amended_at), 'MMM dd, yyyy - hh:mm a')}
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                        Amendment #{booking.amendment_history!.length - index}
                      </span>
                    </div>

                    {/* Date Changes */}
                    <div className="bg-gray-50 p-3 rounded-lg mb-3 space-y-2">
                      <div className="text-xs font-semibold text-gray-700 mb-2">Date Changes</div>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Previous:</span>
                          <span className="font-mono">
                            {format(new Date(amendment.previous_drop_off_datetime), 'MMM dd')} - {format(new Date(amendment.previous_return_datetime), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">New:</span>
                          <span className="font-mono text-blue-600">
                            {format(new Date(amendment.new_drop_off_datetime), 'MMM dd')} - {format(new Date(amendment.new_return_datetime), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Changes (if any) */}
                    {(amendment.previous_vehicle_registration !== amendment.new_vehicle_registration ||
                      amendment.previous_vehicle_make !== amendment.new_vehicle_make) && (
                      <div className="bg-gray-50 p-3 rounded-lg mb-3 space-y-2">
                        <div className="text-xs font-semibold text-gray-700 mb-2">Vehicle Changes</div>
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Previous:</span>
                            <span className="font-mono">{amendment.previous_vehicle_registration} - {amendment.previous_vehicle_make}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">New:</span>
                            <span className="font-mono text-blue-600">{amendment.new_vehicle_registration} - {amendment.new_vehicle_make}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Payment Breakdown */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="text-xs space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-700">Subtotal:</span>
                          <span className="font-semibold">£{(amendment.amendment_subtotal / 100).toFixed(2)}</span>
                        </div>
                        {amendment.amendment_vat > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-700">VAT:</span>
                            <span className="font-semibold">£{(amendment.amendment_vat / 100).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between pt-2 border-t border-blue-300">
                          <span className="text-blue-900 font-bold">Total:</span>
                          <span className="text-blue-900 font-bold">£{(amendment.amendment_charge / 100).toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 pt-2 mt-2 border-t border-blue-200 font-mono">
                        Payment ID: {amendment.stripe_payment_intent_id?.slice(-12) || 'N/A'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Payment Status */}
      {booking.payment_status && (
        <div className="bg-admin-card-bg border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Payment Status</h2>
          </div>
          <div className="space-y-2">
            <div>
              <label className="text-sm text-muted-foreground">Status</label>
              <p className="font-medium">{booking.payment_status}</p>
            </div>
            {booking.stripe_payment_intent_id && (
              <div>
                <label className="text-sm text-muted-foreground">Payment Intent</label>
                <p className="font-mono text-xs">{booking.stripe_payment_intent_id}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
