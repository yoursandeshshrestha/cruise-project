import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Layout } from '../../../components/client/Layout';
import { Button } from '../../../components/client/Button';
import { BookingState, BookingStep } from '../../../types';
import { useCruiseLinesStore } from '../../../stores/cruiseLinesStore';
import { useBookingsStore } from '../../../stores/bookingsStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import { useSystemSettingsStore } from '../../../stores/systemSettingsStore';
import { useTerminalsStore } from '../../../stores/terminalsStore';
import { usePromoCodesStore } from '../../../stores/promoCodesStore';
import { useBookingCartStore } from '../../../stores/bookingCartStore';
import { usePricingStore } from '../../../stores/pricingStore';
import { getStripe } from '../../../lib/stripe';
import { supabase } from '../../../lib/supabase';
import { startOfDay, eachDayOfInterval, format } from 'date-fns';

// Hooks
import { useBookingCalculations } from './hooks/useBookingCalculations';
import { usePromoCode } from './hooks/usePromoCode';
import { useStepValidation } from './hooks/useStepValidation';
import { useBookingSubmission } from './hooks/useBookingSubmission';

// Components
import { ProgressHeader } from './components/ProgressHeader';
import { LoadingOverlay } from './components/LoadingOverlay';
import { BookingSidebar } from './components/BookingSidebar';
import { TripDetailsStep } from './components/TripDetailsStep';
import { ParkingOptionsStep } from './components/ParkingOptionsStep';
import { CustomerDetailsStep } from './components/CustomerDetailsStep';
import { PaymentStep } from './components/PaymentStep';
import { ConfirmationStep } from './components/ConfirmationStep';
import { Modal } from '../../../components/client/Modal';
import { WeeklyDiscountInfo } from './components/WeeklyDiscountInfo';

const INITIAL_STATE: BookingState = {
  dropOffDate: '',
  dropOffTime: '11:00',
  returnDate: '',
  returnTime: '09:00',
  passengers: 2,
  cruiseLine: '',
  shipName: '',
  terminal: '',
  selectedAddOns: [],
  vehicleType: 'car',
  vehicleReg: '',
  vehicleMake: '',
  firstName: '',
  lastName: '',
  email: '',
  mobile: '',
  promoCode: '',
  totalPrice: 0,
};

// Helper function to check capacity for date range
const checkCapacityForDateRange = async (
  dropOffDate: string,
  returnDate: string,
  defaultCapacity: number
): Promise<{ available: boolean; message: string; overCapacityDates: string[] }> => {
  try {
    // Convert dates to Date objects
    const startDate = startOfDay(new Date(dropOffDate));
    const endDate = startOfDay(new Date(returnDate));

    // Get all dates in the range
    const datesInRange = eachDayOfInterval({ start: startDate, end: endDate });

    // Fetch custom capacities for the date range
    const dateStrings = datesInRange.map(d => format(d, 'yyyy-MM-dd'));
    const { data: customCapacities } = await supabase
      .from('daily_capacities')
      .select('date, capacity')
      .in('date', dateStrings);

    // Build map of custom capacities
    const capacityMap = new Map<string, number>();
    customCapacities?.forEach((cap) => {
      capacityMap.set(cap.date, cap.capacity);
    });

    // Fetch bookings that overlap with any date in this range
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('drop_off_datetime, return_datetime')
      .lte('drop_off_datetime', endDate.toISOString())
      .gte('return_datetime', startDate.toISOString())
      .in('status', ['pending', 'confirmed', 'checked_in']);

    if (error) throw error;

    const overCapacityDates: Date[] = [];

    // Check each date in the range
    for (const date of datesInRange) {
      const dateStr = format(date, 'yyyy-MM-dd');

      // Get capacity for this date (custom or default)
      const dayCapacity = capacityMap.get(dateStr) || defaultCapacity;

      // Count how many bookings are active on this date
      const countOnDate = bookings?.filter((booking) => {
        const dropOff = format(startOfDay(new Date(booking.drop_off_datetime)), 'yyyy-MM-dd');
        const returnDateTime = format(startOfDay(new Date(booking.return_datetime)), 'yyyy-MM-dd');

        // Check if the date falls within the booking period
        return dateStr >= dropOff && dateStr <= returnDateTime;
      }).length || 0;

      // Check if this date is over capacity
      if (countOnDate >= dayCapacity) {
        overCapacityDates.push(date);
      }
    }

    if (overCapacityDates.length > 0) {
      // Group consecutive dates into ranges
      const dateRanges: string[] = [];
      let rangeStart = overCapacityDates[0];
      let rangeEnd = overCapacityDates[0];

      for (let i = 1; i <= overCapacityDates.length; i++) {
        const currentDate = overCapacityDates[i];
        const prevDate = overCapacityDates[i - 1];

        // Check if current date is consecutive (1 day after previous)
        const isConsecutive = currentDate &&
          Math.abs(currentDate.getTime() - prevDate.getTime()) === 86400000; // 1 day in ms

        if (isConsecutive) {
          rangeEnd = currentDate;
        } else {
          // End of consecutive sequence, format the range
          if (rangeStart.getTime() === rangeEnd.getTime()) {
            // Single date
            dateRanges.push(format(rangeStart, 'MMM dd, yyyy'));
          } else {
            // Date range
            const sameMonth = rangeStart.getMonth() === rangeEnd.getMonth() &&
                            rangeStart.getFullYear() === rangeEnd.getFullYear();
            if (sameMonth) {
              dateRanges.push(`${format(rangeStart, 'MMM dd')}-${format(rangeEnd, 'dd, yyyy')}`);
            } else {
              dateRanges.push(`${format(rangeStart, 'MMM dd')} - ${format(rangeEnd, 'MMM dd, yyyy')}`);
            }
          }

          // Start new range
          if (currentDate) {
            rangeStart = currentDate;
            rangeEnd = currentDate;
          }
        }
      }

      const datesList = dateRanges.join(', ');
      const formattedDates = overCapacityDates.map(d => format(d, 'MMM dd, yyyy'));

      return {
        available: false,
        message: `Sorry, we have reached maximum capacity for the following date(s): ${datesList}. Please select different dates.`,
        overCapacityDates: formattedDates,
      };
    }

    return {
      available: true,
      message: '',
      overCapacityDates: [],
    };
  } catch (error) {
    console.error('Error checking capacity:', error);
    return {
      available: false,
      message: 'Unable to check availability at this time. Please try again or contact us for assistance.',
      overCapacityDates: [],
    };
  }
};

export const BookingFlow: React.FC = () => {
  const location = useLocation();
  const [step, setStep] = useState<BookingStep>(1);
  const [booking, setBooking] = useState<BookingState>(INITIAL_STATE);
  const [bookingReference, setBookingReference] = useState<string>('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);
  const [unavailableMessage, setUnavailableMessage] = useState('');

  // Stores
  const { cruiseLines, fetchActiveCruiseLines } = useCruiseLinesStore();
  const { createBooking, generateBookingReference } = useBookingsStore();
  const { addOns, parsedSettings, fetchSettings, fetchAddOns } = useSettingsStore();
  const { getCancellationPolicy, fetchSettings: fetchSystemSettings, isBookingEnabled, isMaintenanceMode, isPromoCodeEnabled, getSetting } = useSystemSettingsStore();
  const { terminals, fetchActiveTerminals } = useTerminalsStore();
  const { validatePromoCode: validatePromoCodeStore, incrementPromoCodeUsage } = usePromoCodesStore();
  const { getAddOns, clearCart } = useBookingCartStore();
  const { getPricingForDate, fetchPricingRules } = usePricingStore();

  // Get active pricing for selected date
  const activePricing = useMemo(() => {
    if (!booking.dropOffDate) return null;
    return getPricingForDate(new Date(booking.dropOffDate));
  }, [booking.dropOffDate, getPricingForDate]);

  // Custom hooks
  const {
    appliedPromoCode,
    promoDiscount,
    promoMessage,
    isValidatingPromo,
    handleApplyPromo,
    handleRemovePromo,
  } = usePromoCode(validatePromoCodeStore);

  const calculations = useBookingCalculations(booking, parsedSettings, addOns, promoDiscount, activePricing);
  const { isStep1Valid, isStep3Valid } = useStepValidation(booking);

  const {
    isProcessing,
    paymentError,
    handleBookingSubmit,
    setPaymentError,
  } = useBookingSubmission({
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
  });

  // Initialize Stripe on mount
  useEffect(() => {
    getStripe();
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchActiveCruiseLines();
    fetchActiveTerminals();
    fetchSettings();
    fetchAddOns();
    fetchPricingRules();
    fetchSystemSettings(); // Fetch system settings to check if booking is enabled
  }, [fetchActiveCruiseLines, fetchActiveTerminals, fetchSettings, fetchAddOns, fetchPricingRules, fetchSystemSettings]);

  // Parse query params on load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('dropOffDate')) {
      setBooking(prev => ({
        ...prev,
        dropOffDate: params.get('dropOffDate') || '',
        returnDate: params.get('returnDate') || '',
        cruiseLine: params.get('cruiseLine') || '',
      }));
    }
  }, [location.search]);

  // Load add-ons from cart on mount
  useEffect(() => {
    const cartAddOns = getAddOns();
    if (cartAddOns.length > 0) {
      setBooking(prev => ({
        ...prev,
        selectedAddOns: cartAddOns,
      }));
    }
  }, [getAddOns]);

  // Generate booking reference when reaching step 4
  useEffect(() => {
    if (step === 4 && !bookingReference) {
      const reference = generateBookingReference();
      setBookingReference(reference);
    }
  }, [step, bookingReference, generateBookingReference]);

  // Update total price when calculations change
  useEffect(() => {
    setBooking(prev => ({ ...prev, totalPrice: calculations.finalTotal }));
  }, [calculations.finalTotal]);

  // Update booking field
  const updateBooking = (field: keyof BookingState, value: string | number | string[]) => {
    setBooking(prev => ({ ...prev, [field]: value }));
  };

  // Toggle add-on selection
  const toggleAddOn = (slug: string) => {
    setBooking(prev => {
      const current = prev.selectedAddOns;
      if (current.includes(slug)) {
        return { ...prev, selectedAddOns: current.filter(item => item !== slug) };
      }
      return { ...prev, selectedAddOns: [...current, slug] };
    });
  };

  // Handle promo code application
  const handleApplyPromoClick = () => {
    // Check if promo codes are enabled
    if (!isPromoCodeEnabled()) {
      setUnavailableMessage('Promo codes are currently disabled. Please proceed without a promo code or contact us for assistance.');
      setShowUnavailableModal(true);
      return;
    }

    // Calculate subtotal before discount
    const subtotal = calculations.finalTotal + promoDiscount;
    handleApplyPromo(booking.promoCode, subtotal);
  };

  // Handle promo code removal
  const handleRemovePromoClick = () => {
    handleRemovePromo();
    updateBooking('promoCode', '');
  };

  // Navigation
  const nextStep = async () => {
    // Check booking availability before every step transition
    setIsCheckingAvailability(true);

    // Refetch settings to ensure we have the latest data
    await fetchSystemSettings();
    const stillEnabled = isBookingEnabled();
    const inMaintenanceMode = isMaintenanceMode();

    if (!stillEnabled || inMaintenanceMode) {
      setIsCheckingAvailability(false);
      if (inMaintenanceMode) {
        if (step === 4) {
          setUnavailableMessage('The system is currently undergoing maintenance. Your payment was not processed. Please try again later or contact us for assistance.');
        } else {
          setUnavailableMessage('The system is currently undergoing maintenance. Please try again later or contact us for assistance.');
        }
      } else {
        if (step === 4) {
          setUnavailableMessage('Booking has been temporarily disabled. Your payment was not processed. Please contact us directly for assistance.');
        } else {
          setUnavailableMessage('Booking has been temporarily disabled. Please contact us directly for assistance.');
        }
      }
      setShowUnavailableModal(true);
      return;
    }

    // Check capacity when moving from step 1 to step 2
    if (step === 1 && booking.dropOffDate && booking.returnDate) {
      const defaultCapacity = getSetting<number>('capacity', 'default_daily_capacity', 100) ?? 100;

      const capacityCheck = await checkCapacityForDateRange(
        booking.dropOffDate,
        booking.returnDate,
        defaultCapacity
      );

      if (!capacityCheck.available) {
        setIsCheckingAvailability(false);
        setUnavailableMessage(capacityCheck.message);
        setShowUnavailableModal(true);
        return;
      }
    }

    // If we're at step 4, proceed with payment submission
    if (step === 4) {
      await handleBookingSubmit();
      setIsCheckingAvailability(false);
    } else {
      // Otherwise, just move to next step
      setIsCheckingAvailability(false);
      setStep(prev => Math.min(prev + 1, 5) as BookingStep);
    }
  };

  const prevStep = () => setStep(prev => Math.max(prev - 1, 1) as BookingStep);

  // Determine if next button should be disabled
  const isNextDisabled = () => {
    if (isProcessing || isCheckingAvailability) return true;
    if (step === 1 && !isStep1Valid()) return true;
    if (step === 3 && !isStep3Valid()) return true;
    if (step === 4 && !termsAccepted) return true;
    return false;
  };

  // Check if booking is enabled and not in maintenance mode on page load
  const bookingEnabled = isBookingEnabled();
  const maintenanceMode = isMaintenanceMode();

  // Show booking unavailable page if disabled or in maintenance
  if (!bookingEnabled || maintenanceMode) {
    return (
      <>
      <Layout hideFooter>
        <div className="min-h-screen bg-neutral-light flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-light text-center">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-brand-dark mb-4">
              {maintenanceMode ? 'System Maintenance' : 'Booking Currently Unavailable'}
            </h2>
            <p className="text-gray-600 mb-6">
              {maintenanceMode
                ? 'The system is currently undergoing maintenance. Please check back later or contact us directly for assistance.'
                : "We're sorry, but online booking is temporarily unavailable. Please check back later or contact us directly for assistance."
              }
            </p>
            <div className="space-y-3">
              <a href="/" className="block">
                <Button className="w-full cursor-pointer">Return to Home</Button>
              </a>
              <a href="/contact" className="block">
                <Button variant="secondary" className="w-full cursor-pointer">Contact Us</Button>
              </a>
            </div>
          </div>
        </div>
      </Layout>
      </>
    );
  }

  return (
    <>
    <Layout hideFooter>
      <div className="min-h-screen bg-neutral-light pb-20">
        <LoadingOverlay isVisible={isProcessing} />

        {step < 5 && <ProgressHeader currentStep={step} />}

        {step === 5 ? (
          /* Confirmation page - full width centered */
          <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-light">
              <ConfirmationStep booking={booking} bookingReference={bookingReference} />
            </div>
          </div>
        ) : (
          /* Booking steps - with sidebar */
          <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form Area */}
            <div className="lg:col-span-2">
              {/* Weekly Discount Information */}
              <WeeklyDiscountInfo
                dropOffDate={booking.dropOffDate}
                returnDate={booking.returnDate}
              />
              <div className="bg-white p-6 md:p-8 rounded-xl shadow-light">
                {step === 1 && (
                  <TripDetailsStep
                    booking={booking}
                    updateBooking={updateBooking}
                    cruiseLines={cruiseLines as any}
                    terminals={terminals}
                  />
                )}
                {step === 2 && (
                  <ParkingOptionsStep
                    booking={booking}
                    addOns={addOns}
                    toggleAddOn={toggleAddOn}
                  />
                )}
                {step === 3 && (
                  <CustomerDetailsStep
                    booking={booking}
                    updateBooking={updateBooking}
                    appliedPromoCode={appliedPromoCode}
                    promoMessage={promoMessage}
                    isValidatingPromo={isValidatingPromo}
                    isPromoCodeEnabled={isPromoCodeEnabled()}
                    onApplyPromo={handleApplyPromoClick}
                    onRemovePromo={handleRemovePromoClick}
                  />
                )}
                {step === 4 && (
                  <PaymentStep
                    paymentError={paymentError}
                    termsAccepted={termsAccepted}
                    setTermsAccepted={setTermsAccepted}
                  />
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-8 border-t border-gray-100">
                  {step > 1 ? (
                    <Button variant="secondary" onClick={prevStep} disabled={isProcessing}>
                      Back
                    </Button>
                  ) : (
                    <div></div>
                  )}
                  <Button onClick={nextStep} disabled={isNextDisabled()}>
                    {isCheckingAvailability
                      ? 'Checking availability...'
                      : isProcessing
                      ? 'Redirecting to Payment...'
                      : step === 4
                      ? 'Proceed to Payment'
                      : 'Next Step'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Sidebar Summary */}
            <div className="lg:col-span-1">
              <BookingSidebar
                booking={booking}
                addOns={addOns}
                calculations={calculations}
                settings={parsedSettings}
                appliedPromoCode={appliedPromoCode}
                promoDiscount={promoDiscount}
                cancellationPolicy={getCancellationPolicy()}
                pricingReason={activePricing?.reason}
                pricingPriority={activePricing?.priority}
                vanMultiplier={activePricing?.van_multiplier}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>

    {/* Booking Unavailable Modal */}
    {showUnavailableModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
            {unavailableMessage.includes('Promo code')
              ? 'Promo Code Unavailable'
              : unavailableMessage.includes('maintenance')
              ? 'System Maintenance'
              : 'Booking Unavailable'}
          </h3>

          {/* Message */}
          <p className="text-sm text-gray-600 text-center mb-6">
            {unavailableMessage}
          </p>

          {/* Actions */}
          {unavailableMessage.includes('Promo code') ? (
            <Button
              onClick={() => setShowUnavailableModal(false)}
              className="w-full cursor-pointer"
            >
              Continue Without Promo Code
            </Button>
          ) : (
            <div className="flex gap-3">
              <a href="/" className="flex-1">
                <Button variant="secondary" className="w-full cursor-pointer">
                  Return Home
                </Button>
              </a>
              {unavailableMessage.includes('capacity') && (
                <Button
                  onClick={() => setShowUnavailableModal(false)}
                  variant="primary"
                  className="flex-1 cursor-pointer"
                >
                  Choose Dates
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    )}
    </>
  );
};
