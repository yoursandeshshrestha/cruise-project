import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Layout } from '../../../components/client/Layout';
import { Button } from '../../../components/client/Button';
import { Input } from '../../../components/client/Input';
import { Select } from '../../../components/client/Select';
import { SearchableSelect } from '../../../components/client/SearchableSelect';
import { DatePicker } from '../../../components/client/DatePicker';
import { TimePicker } from '../../../components/client/TimePicker';
import { PassengerSelect } from '../../../components/client/PassengerSelect';
import { BookingState, BookingStep, ParkingType } from '../../../types';
import { useCruiseLinesStore } from '../../../stores/cruiseLinesStore';
import { useBookingsStore } from '../../../stores/bookingsStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import { useSystemSettingsStore } from '../../../stores/systemSettingsStore';
import { useTerminalsStore } from '../../../stores/terminalsStore';
import { usePromoCodesStore } from '../../../stores/promoCodesStore';
import { useBookingCartStore } from '../../../stores/bookingCartStore';
import { Check, ChevronRight, AlertCircle, Calendar, CreditCard, Lock, Ship, MapPin, Tag } from 'lucide-react';

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
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'google' | 'apple'>('card');
  const [bookingReference, setBookingReference] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [appliedPromoCode, setAppliedPromoCode] = useState<string>('');
  const [promoDiscount, setPromoDiscount] = useState<number>(0);
  const [promoMessage, setPromoMessage] = useState<string>('');
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Fetch cruise lines from store
  const { cruiseLines, loading, fetchActiveCruiseLines } = useCruiseLinesStore();

  // Bookings store
  const { createBooking, generateBookingReference } = useBookingsStore();

  // Settings store
  const { addOns, parsedSettings, fetchSettings, fetchAddOns } = useSettingsStore();

  // System settings store
  const { getCancellationPolicy } = useSystemSettingsStore();

  // Terminals store
  const { terminals, fetchActiveTerminals } = useTerminalsStore();

  // Promo codes store
  const { validatePromoCode, incrementPromoCodeUsage } = usePromoCodesStore();

  // Booking cart store
  const { getAddOns, clearCart } = useBookingCartStore();

  // Get today's date in YYYY-MM-DD format (local time)
  const getTodayLocal = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const today = getTodayLocal();

  // Fetch active cruise lines, terminals, and settings on mount (public view)
  useEffect(() => {
    fetchActiveCruiseLines();
    fetchActiveTerminals();
    fetchSettings();
    fetchAddOns();
  }, [fetchActiveCruiseLines, fetchActiveTerminals, fetchSettings, fetchAddOns]);

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
      console.log('[BookingFlow] Pre-populated add-ons from cart:', cartAddOns);
    }
  }, []);

  // Calculate Price
  const calculateTotal = () => {
    if (!booking.dropOffDate || !booking.returnDate) return 0;
    if (!parsedSettings) return 0; // Wait for settings to load

    const start = new Date(booking.dropOffDate);
    const end = new Date(booking.returnDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive

    // Use settings from database
    const dailyRate = parsedSettings.dailyRate || 12.50;
    const minStayCost = parsedSettings.minimumStayCost || 45.00;
    const vatRate = parsedSettings.vatRate || 0.20;

    let parkingCost = Math.max(diffDays * dailyRate, minStayCost);

    // Calculate add-ons cost from database
    const addOnsCost = booking.selectedAddOns.reduce((acc, slug) => {
      const addon = addOns.find(a => a.slug === slug);
      return acc + (addon ? addon.price : 0);
    }, 0);

    // Calculate base cost
    const baseCost = parkingCost + addOnsCost;

    // Add VAT to get subtotal (subtotal includes VAT)
    const subtotalWithVAT = baseCost * (1 + vatRate);

    // Apply promo discount to subtotal
    const finalTotal = Math.max(0, subtotalWithVAT - promoDiscount);

    return finalTotal;
  };

  // Validate promo code
  const handleApplyPromo = async () => {
    const code = booking.promoCode.trim().toUpperCase();

    if (!code) {
      setPromoMessage('Please enter a promo code');
      return;
    }

    // Calculate subtotal before discount
    const subtotal = calculateTotal() + promoDiscount; // Add back current discount to get original subtotal

    setIsValidatingPromo(true);
    setPromoMessage('');

    try {
      const result = await validatePromoCode(code, subtotal);

      if (result.is_valid) {
        setAppliedPromoCode(code);
        setPromoDiscount(result.discount_amount);
        setPromoMessage(`✓ ${result.message}`);
      } else {
        setAppliedPromoCode('');
        setPromoDiscount(0);
        setPromoMessage(`✗ ${result.message}`);
      }
    } catch (error) {
      setPromoMessage('✗ Error validating promo code');
    } finally {
      setIsValidatingPromo(false);
    }
  };

  // Remove promo code
  const handleRemovePromo = () => {
    setAppliedPromoCode('');
    setPromoDiscount(0);
    setPromoMessage('');
    updateBooking('promoCode', '');
  };

  useEffect(() => {
    setBooking(prev => ({ ...prev, totalPrice: calculateTotal() }));
  }, [booking.dropOffDate, booking.returnDate, booking.selectedAddOns, promoDiscount, parsedSettings, addOns]);

  const updateBooking = (field: keyof BookingState, value: any) => {
    setBooking(prev => ({ ...prev, [field]: value }));
  };

  const toggleAddOn = (id: string) => {
    setBooking(prev => {
      const current = prev.selectedAddOns;
      if (current.includes(id)) {
        return { ...prev, selectedAddOns: current.filter(item => item !== id) };
      }
      return { ...prev, selectedAddOns: [...current, id] };
    });
  };

  const nextStep = async () => {
    // If on payment step (step 4), create the booking
    if (step === 4) {
      await handleBookingSubmit();
    } else {
      setStep(prev => Math.min(prev + 1, 5) as BookingStep);
    }
  };

  const prevStep = () => setStep(prev => Math.max(prev - 1, 1) as BookingStep);

  // Validate Step 1 - All fields are required
  const isStep1Valid = () => {
    return (
      booking.dropOffDate !== '' &&
      booking.dropOffTime !== '' &&
      booking.returnDate !== '' &&
      booking.returnTime !== '' &&
      booking.cruiseLine !== '' &&
      booking.shipName !== '' &&
      booking.terminal !== '' &&
      booking.passengers > 0
    );
  };

  // Validate Step 3 - Personal details are required
  const isStep3Valid = () => {
    return (
      booking.firstName.trim() !== '' &&
      booking.lastName.trim() !== '' &&
      booking.email.trim() !== '' &&
      booking.mobile.trim() !== '' &&
      booking.vehicleReg.trim() !== '' &&
      booking.vehicleMake.trim() !== ''
    );
  };

  const handleBookingSubmit = async () => {
    setIsProcessing(true);

    try {
      // Generate booking reference
      const reference = generateBookingReference();

      // Prepare booking data
      const dropOffDateTime = new Date(`${booking.dropOffDate}T${booking.dropOffTime}`).toISOString();
      const returnDateTime = new Date(`${booking.returnDate}T${booking.returnTime}`).toISOString();

      // Calculate costs for database storage
      const vatRate = parsedSettings?.vatRate || 0.20;

      // Recalculate parking and add-ons cost
      const start = new Date(booking.dropOffDate);
      const end = new Date(booking.returnDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const dailyRate = parsedSettings?.dailyRate || 12.50;
      const minStayCost = parsedSettings?.minimumStayCost || 45.00;
      const parkingCost = Math.max(diffDays * dailyRate, minStayCost);

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
        payment_status: 'completed',
        status: 'confirmed' as const,
        cancellation_reason: null,
        refund_amount: null,
        refund_processed_at: null,
        internal_notes: null,
        confirmed_at: new Date().toISOString(),
        checked_in_at: null,
        completed_at: null,
        cancelled_at: null,
      };

      // Create booking in database
      const createdBooking = await createBooking(bookingData);

      if (createdBooking) {
        // Increment promo code usage if one was applied
        if (appliedPromoCode) {
          await incrementPromoCodeUsage(appliedPromoCode);
        }

        // Clear the booking cart after successful booking
        clearCart();

        setBookingReference(reference);
        setStep(5);
      } else {
        alert('Failed to create booking. Please try again.');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('An error occurred while creating your booking. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStep1 = () => {
    // Helper to convert date string to local Date object
    const parseLocalDate = (dateStr: string): Date => {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    };

    // Helper to format Date object to YYYY-MM-DD string (local time)
    const formatLocalDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-300">
        <h2 className="text-2xl font-bold text-brand-dark">Trip Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DatePicker
            label="Drop Off Date"
            placeholder="Select date..."
            value={booking.dropOffDate ? parseLocalDate(booking.dropOffDate) : undefined}
            onChange={(date) => updateBooking('dropOffDate', date ? formatLocalDate(date) : '')}
            minDate={new Date()}
            required
          />
          <TimePicker
            label="Drop Off Time (approx)"
            value={booking.dropOffTime}
            onChange={(time) => updateBooking('dropOffTime', time)}
            timeSlots={['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00']}
            required
          />
          <DatePicker
            label="Return Date"
            placeholder="Select date..."
            value={booking.returnDate ? parseLocalDate(booking.returnDate) : undefined}
            onChange={(date) => updateBooking('returnDate', date ? formatLocalDate(date) : '')}
            minDate={booking.dropOffDate ? parseLocalDate(booking.dropOffDate) : new Date()}
            required
          />
          <TimePicker
            label="Return Time (approx)"
            value={booking.returnTime}
            onChange={(time) => updateBooking('returnTime', time)}
            timeSlots={['06:00','07:00','08:00','09:00','10:00','11:00','12:00']}
            required
          />
        <SearchableSelect
          label="Cruise Line"
          placeholder="Select Cruise Line..."
          icon={<Ship size={16} className="text-primary" />}
          options={cruiseLines.map(c => ({ value: c.name, label: c.name }))}
          value={booking.cruiseLine}
          onChange={value => {
            updateBooking('cruiseLine', value);
            updateBooking('shipName', ''); // Reset ship when cruise line changes
          }}
          required
        />
        <SearchableSelect
          label="Ship Name"
          placeholder="Select Ship..."
          icon={<Ship size={16} className="text-primary" />}
          options={
            booking.cruiseLine
              ? (cruiseLines.find(c => c.name === booking.cruiseLine)?.ships.map(s => ({ value: s, label: s })) || [])
              : []
          }
          value={booking.shipName}
          onChange={value => updateBooking('shipName', value)}
          disabled={!booking.cruiseLine}
          required
        />
        <SearchableSelect
          label="Cruise Terminal"
          placeholder="Select Terminal..."
          icon={<MapPin size={16} className="text-primary" />}
          options={terminals.map(t => ({ value: t.name, label: t.name }))}
          value={booking.terminal || ''}
          onChange={value => updateBooking('terminal', value)}
          required
        />
          <PassengerSelect
            label="Passengers"
            value={booking.passengers}
            onChange={(count) => updateBooking('passengers', count)}
            min={1}
            max={15}
            required
          />
        </div>
      </div>
    );
  };

  const renderStep2 = () => (
    <div className="space-y-8 animate-in slide-in-from-right duration-300">
      <div>
        <h2 className="text-2xl font-bold text-brand-dark mb-4">Select Parking Option</h2>
        <div className="border-2 border-primary bg-blue-50 rounded-lg p-6 relative">
          <div className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-2 py-1 rounded">
            RECOMMENDED
          </div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold">{ParkingType.PARK_AND_RIDE}</h3>
            <span className="text-xl font-bold text-primary">Included</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">Secure parking at our monitored facility with free shuttle transfer to/from the terminal.</p>
          <ul className="text-sm space-y-2 text-gray-700">
            <li className="flex items-center gap-2"><Check size={16} className="text-green-600" /> 10 minute transfer time</li>
            <li className="flex items-center gap-2"><Check size={16} className="text-green-600" /> CCTV & Gated Security</li>
            <li className="flex items-center gap-2"><Check size={16} className="text-green-600" /> Keep your keys (optional)</li>
          </ul>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-brand-dark mb-4">Add Extras (Optional)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addOns.filter(a => a.is_active).map(addon => (
            <div
              key={addon.slug}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                booking.selectedAddOns.includes(addon.slug)
                  ? 'border-primary bg-blue-50 ring-1 ring-primary'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleAddOn(addon.slug)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-brand-dark">{addon.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">{addon.description}</p>
                </div>
                <span className="font-bold text-primary">+£{addon.price.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <h2 className="text-2xl font-bold text-brand-dark">Your Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label={<><span className="text-red-600">*</span> Vehicle Registration</>}
          value={booking.vehicleReg}
          onChange={e => updateBooking('vehicleReg', e.target.value.toUpperCase())}
          placeholder="AB12 CDE"
        />
        <Input
          label={<><span className="text-red-600">*</span> Vehicle Make/Model</>}
          value={booking.vehicleMake}
          onChange={e => updateBooking('vehicleMake', e.target.value)}
          placeholder="e.g. Ford Focus"
        />
        <Input
          label={<><span className="text-red-600">*</span> First Name</>}
          value={booking.firstName}
          onChange={e => updateBooking('firstName', e.target.value)}
        />
        <Input
          label={<><span className="text-red-600">*</span> Last Name</>}
          value={booking.lastName}
          onChange={e => updateBooking('lastName', e.target.value)}
        />
        <Input
          label={<><span className="text-red-600">*</span> Email Address</>}
          type="email"
          value={booking.email}
          onChange={e => updateBooking('email', e.target.value)}
        />
        <Input
          label={<><span className="text-red-600">*</span> Mobile Number</>}
          type="tel"
          value={booking.mobile}
          onChange={e => updateBooking('mobile', e.target.value)}
          helperText="For shuttle updates on the day."
        />
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Promo Code (Optional)
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                value={booking.promoCode}
                onChange={e => {
                  updateBooking('promoCode', e.target.value.toUpperCase());
                  if (appliedPromoCode) {
                    handleRemovePromo();
                  }
                }}
                placeholder="e.g. SAVE10"
                disabled={!!appliedPromoCode}
              />
            </div>
            {!appliedPromoCode ? (
              <Button
                onClick={handleApplyPromo}
                disabled={!booking.promoCode || isValidatingPromo}
                className="whitespace-nowrap"
              >
                {isValidatingPromo ? 'Checking...' : 'Apply'}
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={handleRemovePromo}
                className="whitespace-nowrap"
              >
                Remove
              </Button>
            )}
          </div>
          {promoMessage && (
            <p className={`text-sm mt-2 ${promoMessage.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
              {promoMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <h2 className="text-2xl font-bold text-brand-dark">Secure Payment</h2>
      
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="font-bold text-lg mb-4">Payment Method</h3>
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button 
            type="button"
            onClick={() => setPaymentMethod('card')}
            className={`py-3 px-2 border rounded flex items-center justify-center gap-2 transition-colors ${
              paymentMethod === 'card' 
                ? 'border-primary bg-blue-50 text-primary ring-1 ring-primary' 
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <CreditCard size={20} className="shrink-0" />
            <span className="font-medium text-sm sm:text-base hidden sm:inline">Card</span>
            <span className="font-medium text-sm sm:text-base sm:hidden">Card</span>
          </button>
          
           <button 
            type="button"
            onClick={() => setPaymentMethod('google')}
            className={`py-3 px-2 border rounded flex items-center justify-center gap-2 transition-colors ${
              paymentMethod === 'google' 
                ? 'border-primary bg-blue-50 text-primary ring-1 ring-primary' 
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            <span className="font-medium text-sm sm:text-base hidden sm:inline">Google Pay</span>
             <span className="font-medium text-sm sm:text-base sm:hidden">Google</span>
          </button>

          <button 
            type="button"
            onClick={() => setPaymentMethod('apple')}
            className={`py-3 px-2 border rounded flex items-center justify-center gap-2 transition-colors ${
              paymentMethod === 'apple' 
                ? 'border-primary bg-blue-50 text-primary ring-1 ring-primary' 
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
             <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.79-1.31.02-2.3-1.23-3.14-2.47-1.71-2.49-2.97-6.95-1.18-9.98 0.88-1.5 2.47-2.45 4.18-2.48 1.3 0 2.5 0.88 3.29 0.88 0.78 0 2.24-1.08 3.77-0.92 0.64 0.03 2.44 0.26 3.6 1.95-3.13 1.5-2.6 5.92 1.09 7.55zM15.5 5.55c.67-.82 1.13-1.96.96-3.1-1.02.04-2.27.68-3 1.54-.64.75-1.19 1.97-.94 3.14 1.13.09 2.3-0.77 2.98-1.58z"/></svg>
            <span className="font-medium text-sm sm:text-base hidden sm:inline">Apple Pay</span>
            <span className="font-medium text-sm sm:text-base sm:hidden">Apple</span>
          </button>
        </div>
        
        {paymentMethod === 'card' && (
          <div className="space-y-4 animate-in fade-in">
              <Input label="Card Number" placeholder="0000 0000 0000 0000" />
              <div className="grid grid-cols-2 gap-4">
                  <Input label="Expiry" placeholder="MM/YY" />
                  <Input label="CVC" placeholder="123" />
              </div>
          </div>
        )}

        {paymentMethod === 'google' && (
           <div className="text-center py-6 animate-in fade-in">
               <p className="text-gray-600 mb-4">You will be redirected to Google Pay to complete your purchase securely.</p>
           </div>
        )}

         {paymentMethod === 'apple' && (
           <div className="text-center py-6 animate-in fade-in">
               <p className="text-gray-600 mb-4">You will be redirected to Apple Pay to complete your purchase securely.</p>
           </div>
        )}
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

  const renderStep5 = () => (
    <div className="text-center py-12 animate-in zoom-in duration-300">
      <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check size={48} strokeWidth={3} />
      </div>
      <h2 className="text-3xl font-bold text-brand-dark mb-4">Booking Confirmed!</h2>
      <p className="text-gray-600 mb-8">
        Thank you {booking.firstName}. Your booking reference is <span className="font-bold text-brand-dark">{bookingReference}</span>.
      </p>
      <div className="max-w-md mx-auto bg-gray-50 p-6 rounded-lg text-left mb-8">
        <p className="text-sm text-gray-600 mb-2">We have sent a confirmation email to <span className="font-bold">{booking.email}</span> with directions and arrival instructions.</p>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-500">Drop Off:</div>
            <div className="font-semibold text-right">{booking.dropOffDate} at {booking.dropOffTime}</div>
            <div className="text-gray-500">Return:</div>
            <div className="font-semibold text-right">{booking.returnDate} at {booking.returnTime}</div>
            <div className="text-gray-500">Ship:</div>
            <div className="font-semibold text-right">{booking.shipName}</div>
            {booking.terminal && (
              <>
                <div className="text-gray-500">Terminal:</div>
                <div className="font-semibold text-right">{booking.terminal}</div>
              </>
            )}
            <div className="text-gray-500">Passengers:</div>
            <div className="font-semibold text-right">{booking.passengers}</div>
          </div>
        </div>
      </div>
      <Link to="/">
        <Button>Return to Home</Button>
      </Link>
    </div>
  );

  return (
    <Layout hideFooter>
      <div className="min-h-screen bg-neutral-light pb-20">

        {/* Progress Header - Hide on confirmation step */}
        {step < 5 && (
          <div className="bg-white border-b border-gray-200 sticky top-20 z-40">
            <div className="max-w-3xl mx-auto px-4 py-4">
              <div className="flex justify-between items-center text-sm font-medium text-gray-400">
                <span className={step >= 1 ? 'text-primary' : ''}>Trip</span>
                <ChevronRight size={16} />
                <span className={step >= 2 ? 'text-primary' : ''}>Options</span>
                <ChevronRight size={16} />
                <span className={step >= 3 ? 'text-primary' : ''}>Details</span>
                <ChevronRight size={16} />
                <span className={step >= 4 ? 'text-primary' : ''}>Payment</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full mt-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(step / 4) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation page - full width centered */}
        {step === 5 ? (
          <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-light">
              {renderStep5()}
            </div>
          </div>
        ) : (
          /* Booking steps - with sidebar */
          <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form Area */}
            <div className="lg:col-span-2">
              <div className="bg-white p-6 md:p-8 rounded-xl shadow-light">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-8 border-t border-gray-100">
                    {step > 1 ? (
                        <Button variant="secondary" onClick={prevStep} disabled={isProcessing}>Back</Button>
                    ) : (
                        <div></div>
                    )}
                    <Button
                      onClick={nextStep}
                      disabled={isProcessing || (step === 1 && !isStep1Valid()) || (step === 3 && !isStep3Valid()) || (step === 4 && !termsAccepted)}
                    >
                        {isProcessing ? 'Processing...' : step === 4 ? 'Complete Booking' : 'Next Step'}
                    </Button>
                </div>
              </div>
            </div>

            {/* Sidebar Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-xl shadow-light sticky top-40 border border-gray-200">
                <h3 className="text-xl font-bold text-brand-dark mb-4 pb-4 border-b border-gray-200">Booking Summary</h3>

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
                            )
                        })}
                     </div>
                  )}

                  <div className="pt-4 mt-4 space-y-2 border-t border-gray-200">
                    {(() => {
                      const vatRate = parsedSettings?.vatRate || 0.20;
                      const dailyRate = parsedSettings?.dailyRate || 12.50;
                      const minStayCost = parsedSettings?.minimumStayCost || 45.00;

                      // Calculate number of days
                      let numberOfDays = 0;
                      if (booking.dropOffDate && booking.returnDate) {
                        const start = new Date(booking.dropOffDate);
                        const end = new Date(booking.returnDate);
                        const diffTime = Math.abs(end.getTime() - start.getTime());
                        numberOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                      }

                      const calculatedParkingCost = numberOfDays * dailyRate;
                      const isMinimumApplied = calculatedParkingCost < minStayCost;
                      const parkingCost = Math.max(calculatedParkingCost, minStayCost);

                      const addOnsCost = booking.selectedAddOns.reduce((acc, slug) => {
                        const addon = addOns.find(a => a.slug === slug);
                        return acc + (addon ? addon.price : 0);
                      }, 0);

                      // Calculate subtotal (parking + addons + VAT, before discount)
                      const baseCost = parkingCost + addOnsCost;
                      const vatAmount = baseCost * vatRate;
                      const subtotalWithVAT = baseCost + vatAmount;

                      // Final total after discount
                      const finalTotal = booking.totalPrice;

                      return (
                        <>
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
                        </>
                      );
                    })()}
                  </div>
                </div>

                {(() => {
                  const cancellationPolicy = getCancellationPolicy();
                  return cancellationPolicy.show && cancellationPolicy.text ? (
                    <div className="mt-6 bg-blue-50 p-3 rounded flex gap-2 text-xs text-blue-800">
                      <Lock size={14} className="shrink-0 mt-0.5" />
                      <p>{cancellationPolicy.text}</p>
                    </div>
                  ) : null;
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};