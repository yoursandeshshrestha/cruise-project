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
  const { getCancellationPolicy, fetchSettings: fetchSystemSettings, isBookingEnabled, isMaintenanceMode, isPromoCodeEnabled } = useSystemSettingsStore();
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
              <div className="bg-white p-6 md:p-8 rounded-xl shadow-light">
                {step === 1 && (
                  <TripDetailsStep
                    booking={booking}
                    updateBooking={updateBooking}
                    cruiseLines={cruiseLines}
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
              />
            </div>
          </div>
        )}
      </div>
    </Layout>

    {/* Booking Unavailable Modal */}
    <Modal
      isOpen={showUnavailableModal}
      onClose={() => setShowUnavailableModal(false)}
      title={
        unavailableMessage.includes('Promo code')
          ? 'Promo Codes Unavailable'
          : unavailableMessage.includes('maintenance')
          ? 'System Maintenance'
          : 'Booking Currently Unavailable'
      }
      showCloseButton={unavailableMessage.includes('Promo code')}
    >
      <p className="mb-6">{unavailableMessage}</p>
      {!unavailableMessage.includes('Promo code') && (
        <div className="flex flex-col gap-3">
          <a href="/" className="block">
            <Button className="w-full cursor-pointer">Return to Home</Button>
          </a>
          <a href="/contact" className="block">
            <Button variant="secondary" className="w-full cursor-pointer">Contact Us</Button>
          </a>
        </div>
      )}
    </Modal>
    </>
  );
};
