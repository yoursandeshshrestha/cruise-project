import React from 'react';
import { DollarSign, CreditCard } from 'lucide-react';

interface Booking {
  subtotal: number;
  vat: number;
  discount: number;
  total: number;
  promo_code: string | null;
  payment_status: string | null;
  stripe_payment_intent_id: string | null;
}

interface PaymentCardProps {
  booking: Booking;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({ booking }) => {
  return (
    <>
      {/* Payment Information */}
      <div className="bg-admin-card-bg border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Payment</h2>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Subtotal</span>
            <span className="font-medium">£{(booking.subtotal / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">VAT (20%)</span>
            <span className="font-medium">£{(booking.vat / 100).toFixed(2)}</span>
          </div>
          {booking.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span className="text-sm">Discount</span>
              <span className="font-medium">-£{(booking.discount / 100).toFixed(2)}</span>
            </div>
          )}
          <div className="border-t pt-3 flex justify-between">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold">£{(booking.total / 100).toFixed(2)}</span>
          </div>
          {booking.promo_code && (
            <div className="bg-green-50 border border-green-200 rounded px-3 py-2 text-sm">
              Promo code: <span className="font-medium">{booking.promo_code}</span>
            </div>
          )}
        </div>
      </div>

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
