import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Lock } from 'lucide-react';

interface PaymentStepProps {
  paymentError: string;
  termsAccepted: boolean;
  setTermsAccepted: (accepted: boolean) => void;
}

export const PaymentStep: React.FC<PaymentStepProps> = ({
  paymentError,
  termsAccepted,
  setTermsAccepted,
}) => {
  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <h2 className="text-2xl font-bold text-brand-dark">Secure Payment</h2>

      {paymentError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm">{paymentError}</p>
        </div>
      )}

      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={32} className="text-primary" />
          </div>
          <h3 className="font-bold text-xl mb-2">Secure Payment with Stripe</h3>
          <p className="text-gray-600 mb-4">
            You'll be redirected to our secure payment partner Stripe to complete your booking.
          </p>
          <p className="text-sm text-gray-500">
            Stripe supports all major credit and debit cards, Apple Pay, and Google Pay.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <input
          type="checkbox"
          id="terms"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className="mt-1 cursor-pointer w-4 h-4"
          required
        />
        <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
          <span className="text-red-600">*</span> I accept the{' '}
          <Link to="/terms" target="_blank" className="text-primary underline hover:text-primary-dark">
            Terms and Conditions
          </Link>
          {' '}and{' '}
          <Link to="/privacy" target="_blank" className="text-primary underline hover:text-primary-dark">
            Privacy Policy
          </Link>
          .
        </label>
      </div>
    </div>
  );
};
