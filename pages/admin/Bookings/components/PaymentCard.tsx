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
  payment_status: string | null;
  stripe_payment_intent_id: string | null;
  amendment_history?: AmendmentHistoryEntry[];
}

interface PaymentCardProps {
  booking: Booking;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({ booking }) => {
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [isPricingExpanded, setIsPricingExpanded] = useState(true);
  const [isDailyBreakdownExpanded, setIsDailyBreakdownExpanded] = useState(false);
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
  const dropOffDate = new Date(booking.drop_off_datetime);
  const returnDate = new Date(booking.return_datetime);
  const parkingDays = Math.max(1, differenceInDays(returnDate, dropOffDate));

  // Get pricing rule for drop-off date (for VAT and van multiplier)
  const pricingRule = getPricingForDate(dropOffDate);
  const vanMultiplier = pricingRule?.van_multiplier || 1.5;
  const vatRate = pricingRule?.vat_rate || 0;

  // Calculate day-by-day pricing
  const dailyBreakdown: { date: Date; dayNumber: number; pricePerDay: number; pricingRuleName: string; isVan: boolean }[] = [];
  const isVan = booking.vehicle_type?.toLowerCase() === 'van';

  for (let i = 0; i < parkingDays; i++) {
    const currentDate = addDays(dropOffDate, i);
    const dayPricingRule = getPricingForDate(currentDate);
    const dayPrice = dayPricingRule?.price_per_day || 0;

    dailyBreakdown.push({
      date: currentDate,
      dayNumber: i + 1,
      pricePerDay: dayPrice,
      pricingRuleName: dayPricingRule?.name || 'Default',
      isVan,
    });
  }

  // Calculate parking costs (prices from DB are in pounds, convert to pence)
  const carParkingTotal = dailyBreakdown.reduce((sum, day) => sum + day.pricePerDay, 0);
  const parkingSubtotalPounds = isVan ? Math.round(carParkingTotal * vanMultiplier) : carParkingTotal;
  const parkingSubtotalPence = Math.round(parkingSubtotalPounds * 100); // Convert to pence

  // Calculate add-ons total (prices from DB are already in pence)
  const selectedAddOns = booking.add_ons || [];
  const addOnsTotal = selectedAddOns.reduce((total, slug) => {
    const addOn = addOns.find(a => a.slug === slug);
    return total + (addOn?.price || 0);
  }, 0);

  // Calculate totals (all in pence)
  const orderSubtotal = parkingSubtotalPence + addOnsTotal;
  const orderVAT = Math.round(orderSubtotal * vatRate);
  const orderDiscount = booking.discount || 0;
  const orderTotal = orderSubtotal + orderVAT - orderDiscount;

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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">
                      Parking ({parkingDays} {parkingDays === 1 ? 'day' : 'days'}) {isVan && `× ${vanMultiplier}`}
                    </span>
                    <button
                      onClick={() => setIsDailyBreakdownExpanded(!isDailyBreakdownExpanded)}
                      className="text-blue-600 hover:text-blue-700 cursor-pointer"
                      title="View daily breakdown"
                    >
                      {isDailyBreakdownExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <span className="text-sm font-semibold">£{parkingSubtotalPounds.toFixed(2)}</span>
                </div>

                {/* Daily breakdown */}
                {isDailyBreakdownExpanded && (
                  <div className="ml-4 pl-4 border-l-2 border-gray-200 space-y-1.5 mt-2">
                    {dailyBreakdown.map((day) => (
                      <div key={day.dayNumber} className="flex justify-between text-xs text-gray-600">
                        <span>{format(day.date, 'EEE, MMM dd')} ({day.pricingRuleName})</span>
                        <span>£{day.pricePerDay.toFixed(2)}</span>
                      </div>
                    ))}
                    {isVan && (
                      <div className="flex justify-between text-xs text-blue-700 font-medium pt-1 border-t border-gray-200">
                        <span>Van Multiplier ({vanMultiplier}x)</span>
                        <span>£{parkingSubtotalPounds.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
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

                <div className="space-y-2">
                  {booking.amendment_history!.map((amendment, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">
                        Amendment #{booking.amendment_history!.length - index}
                      </span>
                      <span className="font-semibold text-gray-900">+£{(amendment.amendment_charge / 100).toFixed(2)}</span>
                    </div>
                  ))}
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
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-lg p-5">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total Paid</span>
                <span className="text-2xl font-bold text-green-700">
                  £{((orderTotal + (hasAmendments ? booking.amendment_history!.reduce((sum, a) => sum + a.amendment_charge, 0) : 0)) / 100).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Stored Payment Info Comparison - only show if there's a discrepancy */}
            {(() => {
              // When amendments exist, use the first amendment's previous values for comparison
              // Otherwise, use the current booking values
              const storedSubtotal = hasAmendments
                ? booking.amendment_history![booking.amendment_history!.length - 1].previous_subtotal
                : booking.subtotal;
              const storedVAT = hasAmendments
                ? booking.amendment_history![booking.amendment_history!.length - 1].previous_vat
                : booking.vat;
              const storedTotal = hasAmendments
                ? booking.amendment_history![booking.amendment_history!.length - 1].previous_total
                : booking.total;

              const hasDiscrepancy = Math.abs(storedSubtotal - orderSubtotal) > 1 ||
                Math.abs(storedVAT - orderVAT) > 1 ||
                Math.abs(storedTotal - orderTotal) > 1;

              if (!hasDiscrepancy) return null;

              return (
                <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                  <div className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>Price Calculation Difference Detected</span>
                  </div>
                  <div className="text-xs text-amber-800 mb-3">
                    The stored payment record differs from the recalculated amount. This may occur if pricing rules changed after booking.
                  </div>
                  <div className="space-y-1.5 text-xs bg-white rounded p-3 border border-amber-200">
                    <div className="flex justify-between font-semibold text-amber-900 mb-1">
                      <span>Stored Values:</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">£{(storedSubtotal / 100).toFixed(2)}</span>
                    </div>
                    {storedVAT > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">VAT:</span>
                        <span className="font-medium">£{(storedVAT / 100).toFixed(2)}</span>
                      </div>
                    )}
                    {booking.discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Discount:</span>
                        <span className="font-medium text-green-700">-£{(booking.discount / 100).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-1.5 border-t border-amber-200 font-semibold">
                      <span>Original Booking Total:</span>
                      <span>£{(storedTotal / 100).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
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
