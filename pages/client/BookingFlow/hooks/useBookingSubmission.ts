import { useState, useEffect } from 'react';
import { BookingState } from '../../../../types';
import { createCheckoutSession } from '../../../../lib/stripe';
import { calculateParkingPrice, ADDITIONAL_DAY_RATE } from '../../../../constants';
import { usePricingStore } from '../../../../stores/pricingStore';

interface Settings {
  dailyRate: number;
  minimumStayCost: number;
  vatRate: number;
}

interface AddOn {
  slug: string;
  price: number;
}

interface UseBookingSubmissionProps {
  booking: BookingState;
  bookingReference: string;
  appliedPromoCode: string;
  promoDiscount: number;
  parsedSettings: Settings | null;
  addOns: AddOn[];
  createBooking: (data: Record<string, unknown>) => Promise<{ id: string } | null>;
  incrementPromoCodeUsage: (code: string) => Promise<void>;
  generateBookingReference: () => string;
  activePricing?: { price_per_day?: number; van_multiplier?: number } | null;
}

export const useBookingSubmission = ({
  booking,
  bookingReference,
  appliedPromoCode,
  promoDiscount,
  parsedSettings,
  addOns,
  createBooking,
  incrementPromoCodeUsage,
  generateBookingReference,
  activePricing,
}: UseBookingSubmissionProps) => {
  const { getPricingForDate, fetchPricingRules, initialized, pricingRules } = usePricingStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string>('');

  // Fetch pricing rules on mount if not initialized
  useEffect(() => {
    if (!initialized) {
      fetchPricingRules();
    }
  }, [initialized, fetchPricingRules]);

  // Get standard pricing (priority 2) as fallback
  const standardPricing = pricingRules.find(rule => rule.priority === 2 && rule.is_active);

  const handleBookingSubmit = async () => {
    setIsProcessing(true);
    setPaymentError('');

    try {
      // Use the pre-generated booking reference
      const reference = bookingReference;

      // Prepare booking data
      const dropOffDateTime = new Date(`${booking.dropOffDate}T${booking.dropOffTime}`).toISOString();
      const returnDateTime = new Date(`${booking.returnDate}T${booking.returnTime}`).toISOString();

      // Calculate costs for database storage
      // Recalculate parking cost using day-by-day pricing
      const start = new Date(booking.dropOffDate);
      const end = new Date(booking.returnDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const isVan = booking.vehicleType === 'van';
      let parkingCost = 0;
      let firstDayPricing = null;

      // Calculate cost for each individual day using flat rate pricing
      let carParkingCost = 0;
      let vanMultiplier = standardPricing?.van_multiplier ?? 0;

      for (let i = 0; i < diffDays; i++) {
        const currentDate = new Date(start);
        currentDate.setDate(currentDate.getDate() + i);

        // Get pricing rule for this specific day, fallback to standard pricing
        const dayPricing = getPricingForDate(currentDate) || standardPricing;

        // Store first day's pricing rule for VAT rate and van multiplier
        if (i === 0) {
          firstDayPricing = dayPricing;
          vanMultiplier = dayPricing?.van_multiplier ?? standardPricing?.van_multiplier ?? 0;
        }

        // Flat rate pricing: always use car rate per day
        const dailyRate = dayPricing?.price_per_day ?? standardPricing?.price_per_day ?? 0;
        carParkingCost += dailyRate;
      }

      // Apply van multiplier to total if vehicle is a van
      parkingCost = isVan ? Math.round(carParkingCost * vanMultiplier) : carParkingCost;

      // Use VAT rate from first day's pricing rule, fallback to settings, then default to 0.00
      const vatRate = (firstDayPricing?.vat_rate ?? parsedSettings?.vatRate) ?? 0.00;

      const addOnsCost = booking.selectedAddOns.reduce((acc, slug) => {
        const addon = addOns.find(a => a.slug === slug);
        return acc + (addon ? addon.price : 0);
      }, 0);

      // Base subtotal (before VAT, before discount)
      const subtotal = parkingCost + addOnsCost;
      const vat = subtotal * vatRate;

      // Convert all prices from pounds to pence for database storage
      const subtotalInPence = Math.round(subtotal * 100);
      const vatInPence = Math.round(vat * 100);
      const totalInPence = Math.round(booking.totalPrice * 100);
      const discountInPence = Math.round(promoDiscount * 100);

      const bookingData = {
        booking_reference: reference,
        first_name: booking.firstName,
        last_name: booking.lastName,
        email: booking.email,
        phone: booking.mobile,
        vehicle_registration: booking.vehicleReg,
        vehicle_make: booking.vehicleMake,
        vehicle_type: booking.vehicleType,
        cruise_line: booking.cruiseLine,
        ship_name: booking.shipName,
        terminal: booking.terminal || null,
        drop_off_datetime: dropOffDateTime,
        return_datetime: returnDateTime,
        number_of_passengers: Number(booking.passengers),
        parking_type: 'park_and_ride' as const,
        add_ons: booking.selectedAddOns || [],
        subtotal: subtotalInPence,
        vat: vatInPence,
        total: totalInPence,
        discount: discountInPence,
        promo_code: appliedPromoCode || null,
        stripe_payment_intent_id: null,
        stripe_charge_id: null,
        stripe_checkout_session_id: null,
        payment_status: 'pending',
        status: 'pending' as const,
        cancellation_reason: null,
        refund_amount: null,
        refund_processed_at: null,
        internal_notes: null,
        confirmed_at: null,
        checked_in_at: null,
        completed_at: null,
        cancelled_at: null,
      };

      // Step 1: Create booking in database with 'pending' status
      const createdBooking = await createBooking(bookingData);

      if (!createdBooking) {
        setPaymentError('Failed to create booking. Please try again.');
        setIsProcessing(false);
        return false;
      }

      // Step 2: Increment promo code usage (non-blocking - fire and forget)
      if (appliedPromoCode) {
        incrementPromoCodeUsage(appliedPromoCode).catch(err => {
          console.error('Failed to increment promo code usage:', err);
          // Don't block checkout on promo code error
        });
      }

      // Step 3: Create Stripe Checkout Session
      const checkoutSession = await createCheckoutSession({
        amount: booking.totalPrice,
        booking_reference: reference,
        customer_email: booking.email,
        customer_name: `${booking.firstName} ${booking.lastName}`,
        booking_id: createdBooking.id,
      });

      // Step 4: Redirect to Stripe Checkout immediately
      console.log('Redirecting to Stripe Checkout:', checkoutSession.url);
      window.location.href = checkoutSession.url;
      // Don't set isProcessing to false - keep the overlay until redirect completes
      return true;
    } catch (error) {
      console.error('Error creating booking:', error);

      // Generate a new booking reference for retry
      const newReference = generateBookingReference();

      // Show detailed error message
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while creating your booking.';
      setPaymentError(errorMessage);
      alert(`${errorMessage}\n\nPlease try again.`);

      // Only close loading overlay on error
      setIsProcessing(false);
      return false;
    }
  };

  return {
    isProcessing,
    paymentError,
    handleBookingSubmit,
    setPaymentError,
  };
};
