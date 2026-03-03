import React, { useState } from 'react';
import { DollarSign, CreditCard, ChevronDown, ChevronUp, History } from 'lucide-react';
import { format } from 'date-fns';

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
  const hasAmendments = booking.amendment_history && booking.amendment_history.length > 0;

  return (
    <>
      {/* Payment Information */}
      <div className="bg-admin-card-bg border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Payment Summary</h2>
          {hasAmendments && (
            <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {booking.amendment_history!.length} Amendment{booking.amendment_history!.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Subtotal</span>
            <span className="font-medium">£{(booking.subtotal / 100).toFixed(2)}</span>
          </div>
          {booking.vat > 0 && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                VAT ({booking.subtotal > 0 ? ((booking.vat / booking.subtotal) * 100).toFixed(0) : '0'}%)
              </span>
              <span className="font-medium">£{(booking.vat / 100).toFixed(2)}</span>
            </div>
          )}
          {booking.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span className="text-sm">Discount</span>
              <span className="font-medium">-£{(booking.discount / 100).toFixed(2)}</span>
            </div>
          )}
          <div className="border-t pt-3 flex justify-between">
            <span className="font-semibold">Total Paid</span>
            <span className="text-xl font-bold">£{(booking.total / 100).toFixed(2)}</span>
          </div>
          {booking.promo_code && (
            <div className="bg-green-50 border border-green-200 rounded px-3 py-2 text-sm">
              Promo code: <span className="font-medium">{booking.promo_code}</span>
            </div>
          )}
        </div>
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
              {booking.amendment_history!.map((amendment, index) => (
                <div key={index} className="border-t pt-4 first:border-t-0 first:pt-0">
                  <div className="text-xs text-muted-foreground mb-3">
                    {format(new Date(amendment.amended_at), 'MMM dd, yyyy - hh:mm a')}
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

                  {/* Payment Changes */}
                  <div className="bg-blue-50 p-3 rounded-lg space-y-2">
                    <div className="text-xs font-semibold text-gray-700 mb-2">Payment Breakdown</div>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amendment Charge:</span>
                        <span className="font-medium">£{(amendment.amendment_subtotal / 100).toFixed(2)}</span>
                      </div>
                      {amendment.amendment_vat > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            VAT ({amendment.amendment_subtotal > 0 ? ((amendment.amendment_vat / amendment.amendment_subtotal) * 100).toFixed(0) : '0'}%):
                          </span>
                          <span className="font-medium">£{(amendment.amendment_vat / 100).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-blue-700 font-semibold pt-1 border-t border-blue-200">
                        <span>Amendment Total:</span>
                        <span>£{(amendment.amendment_charge / 100).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2 font-mono">
                      Payment ID: {amendment.stripe_payment_intent_id?.slice(-12) || 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
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
