import React, { useState } from 'react';
import { Layout } from '../../../components/client/Layout';
import { SEO } from '../../../components/client/SEO';
import { Button } from '../../../components/client/Button';
import { Input } from '../../../components/client/Input';
import { Select } from '../../../components/client/Select';
import { AlertCircle, Calendar, Car, Ship, CreditCard, Download, Edit, XCircle, CheckCircle, MapPin, History, X, Save, AlertTriangle, Loader2, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { useBookingsStore } from '../../../stores/bookingsStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import { useSystemSettingsStore } from '../../../stores/systemSettingsStore';
import { usePricingStore } from '../../../stores/pricingStore';
import { supabase } from '../../../lib/supabase';
import type { Database } from '../../../lib/supabase';
import { differenceInDays, differenceInCalendarDays, format, startOfDay, eachDayOfInterval } from 'date-fns';
import { formatDate, formatDateLong, formatDateTime, formatDateShort } from '../../../lib/dateUtils';
import { PricingNotice } from '../BookingFlow/components/PricingNotice';
import { FIRST_DAY_RATE, ADDITIONAL_DAY_RATE } from '../../../constants';

type Booking = Database['public']['Tables']['bookings']['Row'];

export const ManageBooking: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [reference, setReference] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'dashboard' | 'error'>('idle');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [previousBookings, setPreviousBookings] = useState<Booking[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAmendmentSuccess, setShowAmendmentSuccess] = useState(false);

  // Fetch stores
  const { fetchBookingByReference, fetchBookingsByEmail, updateBooking, cancelBooking: cancelBookingInStore } = useBookingsStore();
  const { addOns, fetchAddOns } = useSettingsStore();
  const { getSetting } = useSystemSettingsStore();
  const { getPricingForDate, fetchPricingRules } = usePricingStore();

  // Check for amendment success from URL params
  React.useEffect(() => {
    const amended = searchParams.get('amended');
    const bookingId = searchParams.get('booking_id');

    if (amended === 'true' && bookingId) {
      // Show success toast
      setShowAmendmentSuccess(true);
      // Auto-hide toast after 5 seconds
      setTimeout(() => setShowAmendmentSuccess(false), 5000);
      // Clean up URL params
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Load booking from URL params on mount (only run once)
  const hasLoadedFromUrl = React.useRef(false);
  React.useEffect(() => {
    if (hasLoadedFromUrl.current) return;

    const refFromUrl = searchParams.get('ref') || searchParams.get('reference');
    const emailFromUrl = searchParams.get('email');

    if (refFromUrl) {
      hasLoadedFromUrl.current = true;
      setReference(refFromUrl);

      if (emailFromUrl) {
        setEmail(emailFromUrl);
        // Auto-load booking
        setStatus('loading');
        fetchBookingByReference(refFromUrl.toUpperCase().trim())
          .then((foundBooking) => {
            if (!foundBooking) {
              setStatus('error');
              setErrorMessage('Booking not found. Please check your reference number.');
              return;
            }

            // Verify email matches
            if (foundBooking.email.toLowerCase() !== emailFromUrl.toLowerCase().trim()) {
              setStatus('error');
              setErrorMessage('Email address does not match this booking.');
              return;
            }

            // Set the booking
            setBooking(foundBooking as any);

            // Fetch all previous bookings for this email
            fetchBookingsByEmail(emailFromUrl.toLowerCase().trim()).then((allBookings) => {
              const previous = allBookings.filter(b =>
                b.id !== foundBooking.id &&
                (b.status === 'completed' || b.status === 'cancelled')
              );
              setPreviousBookings(previous as any);
            });

            setStatus('dashboard');
          })
          .catch((error) => {
            console.error('Error auto-loading booking:', error);
            setStatus('error');
            setErrorMessage('An error occurred while loading your booking.');
          });
      }
    }
  }, [searchParams, fetchBookingByReference, fetchBookingsByEmail]);

  // Fetch add-ons and pricing on mount
  React.useEffect(() => {
    fetchAddOns();
    fetchPricingRules();
  }, [fetchAddOns, fetchPricingRules]);

  // Update URL when viewing a booking (for persistence on refresh)
  React.useEffect(() => {
    if (status === 'dashboard' && booking) {
      const params: Record<string, string> = {
        ref: booking.booking_reference,
        email: booking.email,
      };
      setSearchParams(params, { replace: true });
    }
  }, [status, booking]);

  // Helper function to convert ISO string to datetime-local format
  const isoToDatetimeLocal = (isoString: string): string => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Helper function to convert datetime-local value to ISO string
  const datetimeLocalToISO = (datetimeLocalValue: string): string => {
    // datetime-local format: "2026-03-27T14:00"
    // We need to treat this as local time and convert to ISO
    const date = new Date(datetimeLocalValue);
    return date.toISOString();
  };

  // Check capacity for amended dates
  const checkCapacityForAmendedDates = async (newDropOff: string, newReturn: string, currentBookingId: string) => {
    try {
      const defaultCapacity = getSetting<number>('capacity', 'default_daily_capacity', 100) ?? 100;
      const startDate = startOfDay(new Date(newDropOff));
      const parkingDays = differenceInCalendarDays(new Date(newReturn), new Date(newDropOff)) + 1;

      // Generate dates for each parking day (including both drop-off and return dates)
      const datesInRange: Date[] = [];
      for (let i = 0; i < parkingDays; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        datesInRange.push(date);
      }
      const dateStrings = datesInRange.map(d => format(d, 'yyyy-MM-dd'));

      // Fetch custom capacities
      const { data: customCapacities } = await supabase
        .from('daily_capacities')
        .select('date, capacity')
        .in('date', dateStrings);

      const capacityMap = new Map<string, number>();
      customCapacities?.forEach((cap) => {
        capacityMap.set(cap.date, cap.capacity);
      });

      // Fetch bookings (excluding current booking)
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + parkingDays);

      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('drop_off_datetime, return_datetime')
        .lte('drop_off_datetime', endDate.toISOString())
        .gte('return_datetime', startDate.toISOString())
        .in('status', ['pending', 'confirmed', 'checked_in'])
        .neq('id', currentBookingId);

      if (error) throw error;

      const overCapacityDates: Date[] = [];

      for (const date of datesInRange) {
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayCapacity = capacityMap.get(dateStr) || defaultCapacity;

        const countOnDate = bookings?.filter((booking) => {
          const dropOff = format(startOfDay(new Date(booking.drop_off_datetime)), 'yyyy-MM-dd');
          const returnDateTime = format(startOfDay(new Date(booking.return_datetime)), 'yyyy-MM-dd');
          // Car occupies space from drop-off through return date (inclusive)
          return dateStr >= dropOff && dateStr <= returnDateTime;
        }).length || 0;

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

          const isConsecutive = currentDate &&
            Math.abs(currentDate.getTime() - prevDate.getTime()) === 86400000;

          if (isConsecutive) {
            rangeEnd = currentDate;
          } else {
            if (rangeStart.getTime() === rangeEnd.getTime()) {
              dateRanges.push(format(rangeStart, 'MMM dd, yyyy'));
            } else {
              const sameMonth = rangeStart.getMonth() === rangeEnd.getMonth() &&
                              rangeStart.getFullYear() === rangeEnd.getFullYear();
              if (sameMonth) {
                dateRanges.push(`${format(rangeStart, 'MMM dd')}-${format(rangeEnd, 'dd, yyyy')}`);
              } else {
                dateRanges.push(`${format(rangeStart, 'MMM dd')} - ${format(rangeEnd, 'MMM dd, yyyy')}`);
              }
            }

            if (currentDate) {
              rangeStart = currentDate;
              rangeEnd = currentDate;
            }
          }
        }

        return {
          available: false,
          message: `Sorry, we have reached maximum capacity for the following date(s): ${dateRanges.join(', ')}. Please select different dates.`,
          overCapacityDates: dateRanges,
        };
      }

      return { available: true, message: '', overCapacityDates: [] };
    } catch (error) {
      console.error('Error checking capacity:', error);
      return {
        available: false,
        message: 'Unable to check availability at this time. Please try again.',
        overCapacityDates: [],
      };
    }
  };

  // Calculate additional pricing for amended dates - follows EXACT main booking flow logic
  const calculateAdditionalPricing = (oldDropOff: string, oldReturn: string, newDropOff: string, newReturn: string) => {
    // Check if dates actually changed (not just time)
    const oldDropOffDate = format(new Date(oldDropOff), 'yyyy-MM-dd');
    const oldReturnDate = format(new Date(oldReturn), 'yyyy-MM-dd');
    const newDropOffDate = format(new Date(newDropOff), 'yyyy-MM-dd');
    const newReturnDate = format(new Date(newReturn), 'yyyy-MM-dd');
    const datesChanged = oldDropOffDate !== newDropOffDate || oldReturnDate !== newReturnDate;

    if (!datesChanged) {
      // Only time changed, no charge
      return {
        additionalDays: 0,
        additionalCharge: 0,
        dailyBreakdown: [],
        amendmentFee: 0,
        pricingReason: null,
        pricingPriority: null,
        vatRate: 0,
        additionalCost: 0,
        additionalVat: 0,
        oldBookingCost: 0,
        oldParkingCost: 0,
        addOnsCost: 0,
        newBookingCost: 0,
        newParkingCost: 0,
        priceDifference: 0,
        rawPriceDifference: 0,
      };
    }

    // Calculate days
    const oldDays = differenceInCalendarDays(new Date(oldReturn), new Date(oldDropOff)) + 1;
    const newDays = differenceInCalendarDays(new Date(newReturn), new Date(newDropOff)) + 1;

    // Get amendment extension fee from settings
    const amendmentFee = getSetting<number>('capacity', 'amendment_extension_fee', 5) ?? 5;

    // Determine if this is a car or van booking
    const isVan = booking?.vehicle_type === 'van';

    // Get standard pricing (priority 2) as fallback
    const { pricingRules } = usePricingStore.getState();
    const standardPricing = pricingRules.find(rule => rule.priority === 2 && rule.is_active);

    // Calculate add-ons cost (in pounds)
    let addOnsCost = 0;
    if (booking?.add_ons && Array.isArray(booking.add_ons) && booking.add_ons.length > 0) {
      (booking.add_ons as string[]).forEach((slug) => {
        const addon = addOns.find(a => a.slug === slug);
        if (addon) {
          addOnsCost += addon.price;
        }
      });
    }

    // Calculate OLD booking parking cost (recalculate to ensure consistency)
    let oldCarParkingCost = 0;
    const oldStartDate = new Date(oldDropOff);
    for (let i = 0; i < oldDays; i++) {
      const currentDate = new Date(oldStartDate);
      currentDate.setDate(currentDate.getDate() + i);
      const pricing = getPricingForDate(currentDate) || standardPricing;
      const dailyRate = pricing?.price_per_day ?? standardPricing?.price_per_day ?? 0;
      oldCarParkingCost += dailyRate;
    }
    // Get van multiplier for old booking dates
    const oldFirstDayPricing = getPricingForDate(oldStartDate) || standardPricing;
    const oldVanMultiplier = oldFirstDayPricing?.van_multiplier ?? standardPricing?.van_multiplier ?? 0;
    const oldParkingCost = isVan ? Math.round(oldCarParkingCost * oldVanMultiplier) : oldCarParkingCost;

    // Calculate NEW booking parking cost (following EXACT main booking flow)
    let carParkingCost = 0;
    let vanMultiplier = standardPricing?.van_multiplier ?? 0;
    const newStartDate = new Date(newDropOff);
    const dailyBreakdown: Array<{ day: number; date: string; rate: number }> = [];
    let highestPriority: number | null = null;
    let pricingReason: string | null = null;
    let firstDayPricing = null;

    for (let i = 0; i < newDays; i++) {
      const currentDate = new Date(newStartDate);
      currentDate.setDate(currentDate.getDate() + i);
      const pricing = getPricingForDate(currentDate) || standardPricing;

      // Store first day's pricing for VAT rate and van multiplier
      if (i === 0) {
        firstDayPricing = pricing;
        vanMultiplier = pricing?.van_multiplier ?? standardPricing?.van_multiplier ?? 0;
      }

      // Flat rate pricing: always use car rate per day
      const dailyRate = pricing?.price_per_day ?? standardPricing?.price_per_day ?? 0;
      carParkingCost += dailyRate;

      // Track priority 1 pricing
      if (pricing?.priority === 1) {
        if (highestPriority === null || pricing.priority < highestPriority) {
          highestPriority = pricing.priority;
          pricingReason = pricing.reason;
        }
      }

      dailyBreakdown.push({
        day: i + 1,
        date: format(currentDate, 'MMM dd, yyyy'),
        rate: dailyRate,
      });
    }

    // Apply van multiplier to total if vehicle is a van
    const newParkingCost = isVan ? Math.round(carParkingCost * vanMultiplier) : carParkingCost;

    // Get VAT rate from first day's pricing rule, fallback to standard pricing
    const VAT_RATE = firstDayPricing?.vat_rate ?? standardPricing?.vat_rate ?? 0;

    // FOLLOW EXACT MAIN BOOKING FLOW LOGIC:
    // baseCost = parkingCost + addOnsCost
    // vatAmount = baseCost * vatRate
    // subtotalWithVAT = baseCost + vatAmount

    // NEW booking baseCost (excl VAT)
    const newBaseCost = newParkingCost + addOnsCost;

    // OLD booking baseCost (excl VAT) - recalculated to ensure van multiplier is applied
    // Subtract weekly discount from old parking cost
    const oldWeeklyDiscountInPounds = (booking.weekly_discount_amount || 0) / 100;
    const oldBaseCost = oldParkingCost - oldWeeklyDiscountInPounds + addOnsCost;

    // Calculate difference in baseCost (excl VAT)
    const baseCostDifference = newBaseCost - oldBaseCost;



    // If difference is negative (user decreasing days), only charge amendment fee (no refund)
    // If positive (user increasing days), charge difference + amendment fee
    const chargeableDifference = Math.max(0, baseCostDifference);

    // Amendment baseCost (excl VAT) = chargeable price difference + amendment fee
    const amendmentBaseCost = chargeableDifference + amendmentFee;

    // Calculate VAT (following main booking flow)
    const amendmentVat = amendmentBaseCost * VAT_RATE;

    // Total amendment charge (following main booking flow) - keep in POUNDS
    const amendmentTotal = amendmentBaseCost + amendmentVat;

    return {
      additionalDays: newDays - oldDays,
      additionalCharge: amendmentTotal, // in POUNDS (not pence) - same as main booking flow
      additionalCost: amendmentBaseCost, // in pounds (excl VAT)
      additionalVat: amendmentVat, // in pounds (VAT only)
      dailyBreakdown,
      amendmentFee: amendmentFee, // in pounds
      pricingReason: highestPriority === 1 ? pricingReason : null,
      pricingPriority: highestPriority,
      oldBookingCost: oldBaseCost, // in pounds (excl VAT)
      oldParkingCost, // in pounds (excl VAT, parking only) - recalculated with van multiplier
      addOnsCost, // in pounds
      newBookingCost: newBaseCost, // in pounds (excl VAT)
      newParkingCost, // in pounds (parking only)
      priceDifference: chargeableDifference, // in pounds (excl VAT) - always 0 or positive (no refunds)
      rawPriceDifference: baseCostDifference, // raw difference (can be negative) - for display purposes
      vatRate: VAT_RATE, // VAT rate from pricing rules
    };
  };

  // Amend Modal State
  const [isAmendOpen, setIsAmendOpen] = useState(false);
  const [isSavingAmend, setIsSavingAmend] = useState(false);
  const [isCheckingAmendment, setIsCheckingAmendment] = useState(false);
  const [amendForm, setAmendForm] = useState({
      dropOffDateTime: '',
      returnDateTime: '',
      vehicleReg: '',
      vehicleMake: ''
  });

  // Amendment Confirmation Modal State
  const [showAmendConfirmation, setShowAmendConfirmation] = useState(false);
  const [isBreakdownExpanded, setIsBreakdownExpanded] = useState(false);
  const [amendmentDetails, setAmendmentDetails] = useState<{
    additionalDays: number;
    additionalCharge: number;
    additionalCost: number;
    additionalVat: number;
    unavailableDates: string[];
    dailyBreakdown: Array<{ day: number; date: string; rate: number }>;
    amendmentFee: number;
    pricingReason: string | null;
    pricingPriority: number | null;
    rawPriceDifference: number;
    oldBookingCost: number;
    oldParkingCost: number;
    addOnsCost: number;
    newBookingCost: number;
    newParkingCost: number;
    priceDifference: number;
    vatRate: number;
  } | null>(null);

  // Cancel Modal State
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelState, setCancelState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [cancelResult, setCancelResult] = useState<{
    message: string;
    non_refundable?: boolean;
    refund_amount?: number;
    refund_issued?: boolean;
  } | null>(null);

  // Receipt State
  const [isDownloading, setIsDownloading] = useState(false);

  // Breakdown State
  const [isParkingBreakdownExpanded, setIsParkingBreakdownExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      // Fetch booking by reference
      const foundBooking = await fetchBookingByReference(reference.toUpperCase().trim());

      if (!foundBooking) {
        setStatus('error');
        setErrorMessage('Booking not found. Please check your reference number.');
        return;
      }

      // Verify email matches
      if (foundBooking.email.toLowerCase() !== email.toLowerCase().trim()) {
        setStatus('error');
        setErrorMessage('Email address does not match this booking.');
        return;
      }

      // Set the booking
      setBooking(foundBooking as any);

      // Fetch all previous bookings for this email
      const allBookings = await fetchBookingsByEmail(email.toLowerCase().trim());
      // Filter out current booking and only show completed ones
      const previous = allBookings.filter(b =>
        b.id !== foundBooking.id &&
        (b.status === 'completed' || b.status === 'cancelled')
      );
      setPreviousBookings(previous as any);

      setStatus('dashboard');
    } catch (error) {
      console.error('Error fetching booking:', error);
      setStatus('error');
      setErrorMessage('An error occurred while fetching your booking. Please try again.');
    }
  };

  const handleLogout = () => {
    setStatus('idle');
    setBooking(null);
    setEmail('');
    setReference('');
  };

  const handleOpenAmend = () => {
      if (!booking) return;
      // Extract date and time from ISO datetime
      const dropOffDate = booking.drop_off_datetime.split('T')[0];
      const returnDate = booking.return_datetime.split('T')[0];

      setAmendForm({
          dropOffDateTime: booking.drop_off_datetime,
          returnDateTime: booking.return_datetime,
          vehicleReg: booking.vehicle_registration,
          vehicleMake: booking.vehicle_make
      });
      setIsAmendOpen(true);
  };

  const handleAmendSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!booking) return;

      setIsCheckingAmendment(true);
      try {
        // 0. Fetch latest pricing rules and settings
        await fetchPricingRules();
        await useSystemSettingsStore.getState().fetchSettings();

        // 1. Check capacity for new dates
        const capacityCheck = await checkCapacityForAmendedDates(
          amendForm.dropOffDateTime,
          amendForm.returnDateTime,
          booking.id
        );

        if (!capacityCheck.available) {
          alert(capacityCheck.message);
          setIsCheckingAmendment(false);
          return;
        }

        // 2. Calculate additional pricing
        const pricingDetails = calculateAdditionalPricing(
          booking.drop_off_datetime,
          booking.return_datetime,
          amendForm.dropOffDateTime,
          amendForm.returnDateTime
        );

        // 3. If there's an additional charge, show confirmation modal
        if (pricingDetails.additionalCharge > 0) {
          setAmendmentDetails({
            additionalDays: pricingDetails.additionalDays,
            additionalCharge: pricingDetails.additionalCharge,
            additionalCost: pricingDetails.additionalCost,
            additionalVat: pricingDetails.additionalVat,
            unavailableDates: [],
            dailyBreakdown: pricingDetails.dailyBreakdown,
            amendmentFee: pricingDetails.amendmentFee,
            pricingReason: pricingDetails.pricingReason,
            pricingPriority: pricingDetails.pricingPriority,
            oldBookingCost: pricingDetails.oldBookingCost,
            oldParkingCost: pricingDetails.oldParkingCost,
            addOnsCost: pricingDetails.addOnsCost,
            newBookingCost: pricingDetails.newBookingCost,
            newParkingCost: pricingDetails.newParkingCost,
            priceDifference: pricingDetails.priceDifference,
            rawPriceDifference: pricingDetails.rawPriceDifference,
            vatRate: pricingDetails.vatRate,
          });
          setIsBreakdownExpanded(false); // Reset breakdown to collapsed
          setShowAmendConfirmation(true);
          setIsCheckingAmendment(false);
        } else {
          // No additional charge, just update the booking
          setIsSavingAmend(true);
          await updateBooking(booking.id, {
            drop_off_datetime: amendForm.dropOffDateTime,
            return_datetime: amendForm.returnDateTime,
            vehicle_registration: amendForm.vehicleReg,
            vehicle_make: amendForm.vehicleMake
          });

          // Refresh booking data
          const updatedBooking = await fetchBookingByReference(booking.booking_reference);
          if (updatedBooking) {
            setBooking(updatedBooking as any);
          }

          setIsAmendOpen(false);
          setIsSavingAmend(false);
          setIsCheckingAmendment(false);
        }
      } catch (error) {
        console.error('Error updating booking:', error);
        alert('Failed to update booking. Please try again.');
        setIsCheckingAmendment(false);
        setIsSavingAmend(false);
      }
  };

  const handleAmendPayment = async () => {
    if (!booking || !amendmentDetails) return;

    try {
      setIsSavingAmend(true);

      // Calculate VAT breakdown if not already available
      const vatRate = amendmentDetails.vatRate ?? 0;
      const amendmentVat = amendmentDetails.additionalVat ??
        (vatRate > 0 ? (amendmentDetails.additionalCharge / (1 + vatRate) * vatRate) : 0);
      const amendmentSubtotal = amendmentDetails.additionalCost ??
        (amendmentDetails.additionalCharge - amendmentVat);



      // Validate numbers before sending
      if (isNaN(amendmentSubtotal) || isNaN(amendmentVat)) {
        throw new Error('Invalid amendment calculation - please try recalculating');
      }

      // Create Stripe checkout session for amendment
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          booking_id: booking.id,
          amount: amendmentDetails.additionalCharge, // In pounds (will be converted to pence by function)
          booking_reference: booking.booking_reference,
          customer_email: booking.email,
          isAmendment: true,
          amendmentData: {
            drop_off_datetime: amendForm.dropOffDateTime,
            return_datetime: amendForm.returnDateTime,
            vehicle_registration: amendForm.vehicleReg,
            vehicle_make: amendForm.vehicleMake,
            amendment_subtotal: amendmentSubtotal.toFixed(2), // Base cost before VAT (2 decimal places)
            amendment_vat: amendmentVat.toFixed(2), // VAT amount (2 decimal places)
            // Additional breakdown data
            daily_breakdown: JSON.stringify(amendmentDetails.dailyBreakdown),
            amendment_fee: amendmentDetails.amendmentFee.toFixed(2),
            old_parking_cost: amendmentDetails.oldParkingCost.toFixed(2),
            new_parking_cost: amendmentDetails.newParkingCost.toFixed(2),
            add_ons_cost: amendmentDetails.addOnsCost.toFixed(2),
            price_difference: amendmentDetails.priceDifference.toFixed(2), // Chargeable difference (0 or positive)
            raw_price_difference: amendmentDetails.rawPriceDifference.toFixed(2), // Actual difference (can be negative)
            vat_rate: amendmentDetails.vatRate.toString(),
            pricing_reason: amendmentDetails.pricingReason || '',
            // Previous booking weekly discount info
            previous_weekly_discount_percent: booking.weekly_discount_percent?.toString() || '0',
            previous_weekly_discount_amount: ((booking.weekly_discount_amount || 0) / 100).toFixed(2),
          },
        },
      });

      if (error) throw error;

      // Redirect to Stripe Checkout (same as booking flow)
      if (data && data.url) {
        window.location.href = data.url;
        // Don't set isSavingAmend to false - keep the loading state until redirect completes
      } else {
        throw new Error('No checkout URL received from server');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Failed to process payment. Please try again.');
      setIsSavingAmend(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (!booking) return;
    setIsDownloading(true);

    // Simulate generation delay
    setTimeout(() => {
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const totalInPounds = booking.total / 100;

            // Header Background
            doc.setFillColor(0, 169, 254); // Primary Blue
            doc.rect(0, 0, pageWidth, 40, 'F');

            // Header Text
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.text("SIMPLE CRUISE PARKING", 20, 25);
            doc.setFontSize(12);
            doc.text("Booking Receipt", 20, 35);

            // Reset Text Color
            doc.setTextColor(0, 24, 72); // Brand Dark

            // Booking Details
            doc.setFontSize(10);
            doc.text(`Reference: ${booking.booking_reference}`, 20, 55);
            doc.text(`Date Issued: ${formatDate(new Date())}`, 20, 60);
            doc.text(`Status: ${booking.status}`, 20, 65);

            // Customer
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text("Customer Details", 20, 80);
            doc.line(20, 82, 190, 82);

            doc.setFont(undefined, 'normal');
            doc.setFontSize(10);
            doc.text(`Name: ${booking.first_name} ${booking.last_name}`, 20, 90);
            doc.text(`Email: ${booking.email}`, 20, 96);
            doc.text(`Mobile: ${booking.phone}`, 20, 102);

            // Trip
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text("Itinerary", 20, 115);
            doc.line(20, 117, 190, 117);

            doc.setFont(undefined, 'normal');
            doc.setFontSize(10);
            doc.text(`Drop Off:`, 20, 125);
            doc.text(`${formatDateTime(booking.drop_off_datetime)}`, 50, 125);

            doc.text(`Return:`, 20, 131);
            doc.text(`${formatDateTime(booking.return_datetime)}`, 50, 131);

            doc.text(`Ship:`, 20, 137);
            doc.text(`${booking.ship_name}`, 50, 137);

            if (booking.terminal) {
              doc.text(`Terminal:`, 20, 143);
              doc.text(`${booking.terminal}`, 50, 143);
            }

            // Vehicle
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text("Vehicle", 20, 158);
            doc.line(20, 160, 190, 160);

            doc.setFont(undefined, 'normal');
            doc.setFontSize(10);
            doc.text(`Vehicle: ${booking.vehicle_make}`, 20, 168);
            doc.text(`Reg: ${booking.vehicle_registration}`, 20, 174);

            // Payment Summary
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text("Payment Summary", 20, 190);
            doc.line(20, 192, 190, 192);

            doc.setFont(undefined, 'normal');
            doc.setFontSize(10);

            let y = 200;

            doc.text("Parking & Services", 20, y);
            y += 6;

            if (booking.add_ons && Array.isArray(booking.add_ons) && booking.add_ons.length > 0) {
              (booking.add_ons as string[]).forEach(slug => {
                  const addon = addOns.find(a => a.slug === slug);
                  if (addon) {
                    doc.text(addon.name, 20, y);
                    y += 6;
                  }
              });
            }

            y += 4;
            doc.line(130, y, 190, y);
            y += 6;

            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text("Total Paid", 130, y);
            doc.text(`£${totalInPounds.toFixed(2)}`, 190, y, { align: 'right' });

            // Footer
            doc.setFontSize(8);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(150);
            doc.text("Thank you for choosing Simple Cruise Parking.", 105, 280, { align: "center" });

            doc.save(`Receipt-${booking.booking_reference}.pdf`);
        } catch (e) {
            console.error("PDF generation failed:", e);
            alert("Sorry, we couldn't generate your receipt at this time.");
        }
        setIsDownloading(false);
    }, 1500);
  };

  const handleCloseCancelModal = () => {
    setIsCancelOpen(false);
    // Reset state after modal closes (with a small delay for animation)
    setTimeout(() => {
      setCancelState('idle');
      setCancelResult(null);
    }, 300);
  };

  const handleCancelConfirm = async () => {
      if (!booking) return;

      setCancelState('loading');

      try {
        const result = await cancelBookingInStore(booking.id, 'Cancelled by customer via manage booking page');

        // Refresh booking data
        const updatedBooking = await fetchBookingByReference(booking.booking_reference);
        if (updatedBooking) {
          setBooking(updatedBooking as any);
        }

        // Prepare success message
        let message = '';
        if (result.non_refundable) {
          message = `Booking cancelled successfully. However, as per our cancellation policy, bookings cancelled within 48 hours of the scheduled drop-off time are non-refundable. You will receive a confirmation email shortly.`;
        } else if (result.refund_issued) {
          message = `Booking cancelled successfully! A refund of £${(result.refund_amount / 100).toFixed(2)} has been processed and will appear in your account within 5-10 business days. You will receive a confirmation email shortly.`;
        } else {
          message = 'Booking cancelled successfully. You will receive a confirmation email shortly.';
        }

        setCancelResult({
          message,
          non_refundable: result.non_refundable,
          refund_amount: result.refund_amount,
          refund_issued: result.refund_issued,
        });
        setCancelState('success');
      } catch (error) {
        console.error('Error cancelling booking:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to cancel booking. Please try again or contact support.';
        setCancelResult({ message: errorMessage });
        setCancelState('error');
      }
  };

  if (status === 'dashboard' && booking) {
    const isCancelled = booking.status === 'cancelled';
    const isCheckedIn = booking.status === 'checked_in' || booking.status === 'completed';
    const hasAmendments = booking.amendment_history && Array.isArray(booking.amendment_history) && booking.amendment_history.length > 0;
    const canCancel = !isCancelled && !isCheckedIn && !hasAmendments;

    // Helper to format time
    const formatTime = (dateTimeStr: string) => {
      return format(new Date(dateTimeStr), 'HH:mm');
    };

    // Calculate total in pounds
    const totalInPounds = booking.total / 100;
    const subtotalInPounds = booking.subtotal / 100;
    const vatInPounds = booking.vat / 100;
    const discountInPounds = booking.discount / 100;

    // Calculate detailed breakdown for Payment Summary
    const dropOffDate = new Date(booking.drop_off_datetime);
    const returnDate = new Date(booking.return_datetime);
    const diffTime = Math.abs(returnDate.getTime() - dropOffDate.getTime());
    const parkingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const isVan = booking.vehicle_type === 'van';
    const { pricingRules } = usePricingStore.getState();
    const standardPricing = pricingRules.find(rule => rule.priority === 2 && rule.is_active);

    // Calculate car parking cost by day with detailed breakdown
    let carParkingTotal = 0;
    let firstDayPricing = null;
    let vanMultiplier = standardPricing?.van_multiplier ?? 0;

    // Store daily breakdown for grouping
    interface DailyBreakdown {
      dayNumber: number;
      date: Date;
      rate: number;
      ruleId: string;
    }
    const dailyBreakdown: DailyBreakdown[] = [];

    for (let i = 0; i < parkingDays; i++) {
      const currentDate = new Date(dropOffDate);
      currentDate.setDate(currentDate.getDate() + i);
      const dayPricing = getPricingForDate(currentDate) || standardPricing;

      if (i === 0) {
        firstDayPricing = dayPricing;
        vanMultiplier = dayPricing?.van_multiplier ?? standardPricing?.van_multiplier ?? 0;
      }

      const dailyRate = dayPricing?.price_per_day ?? standardPricing?.price_per_day ?? 0;
      carParkingTotal += dailyRate;

      dailyBreakdown.push({
        dayNumber: i + 1,
        date: currentDate,
        rate: dailyRate,
        ruleId: dayPricing?.id || 'standard'
      });
    }

    // Group consecutive days with same pricing rule
    interface GroupedBreakdown {
      startDay: number;
      endDay: number;
      startDate: Date;
      endDate: Date;
      rate: number;
      days: number;
      subtotal: number;
    }
    const groupedBreakdown: GroupedBreakdown[] = [];

    if (dailyBreakdown.length > 0) {
      let currentGroup = {
        startDay: dailyBreakdown[0].dayNumber,
        endDay: dailyBreakdown[0].dayNumber,
        startDate: dailyBreakdown[0].date,
        endDate: dailyBreakdown[0].date,
        rate: dailyBreakdown[0].rate,
        ruleId: dailyBreakdown[0].ruleId,
        days: 1,
        subtotal: dailyBreakdown[0].rate
      };

      for (let i = 1; i < dailyBreakdown.length; i++) {
        const day = dailyBreakdown[i];

        // Check if this day has same rate and is consecutive
        if (day.rate === currentGroup.rate && day.ruleId === currentGroup.ruleId) {
          // Extend current group
          currentGroup.endDay = day.dayNumber;
          currentGroup.endDate = day.date;
          currentGroup.days += 1;
          currentGroup.subtotal += day.rate;
        } else {
          // Save current group and start new one
          groupedBreakdown.push({
            startDay: currentGroup.startDay,
            endDay: currentGroup.endDay,
            startDate: currentGroup.startDate,
            endDate: currentGroup.endDate,
            rate: currentGroup.rate,
            days: currentGroup.days,
            subtotal: currentGroup.subtotal
          });

          currentGroup = {
            startDay: day.dayNumber,
            endDay: day.dayNumber,
            startDate: day.date,
            endDate: day.date,
            rate: day.rate,
            ruleId: day.ruleId,
            days: 1,
            subtotal: day.rate
          };
        }
      }

      // Push the last group
      groupedBreakdown.push({
        startDay: currentGroup.startDay,
        endDay: currentGroup.endDay,
        startDate: currentGroup.startDate,
        endDate: currentGroup.endDate,
        rate: currentGroup.rate,
        days: currentGroup.days,
        subtotal: currentGroup.subtotal
      });
    }

    // Calculate add-ons cost
    let addOnsTotal = 0;
    if (booking.add_ons && Array.isArray(booking.add_ons) && booking.add_ons.length > 0) {
      (booking.add_ons as string[]).forEach((slug) => {
        const addon = addOns.find(a => a.slug === slug);
        if (addon) {
          addOnsTotal += addon.price;
        }
      });
    }

    return (
        <Layout>
            <SEO
                title="Manage Your Booking | Simple Cruise Parking Southampton"
                description="View, modify or cancel your Simple Cruise Parking booking. Enter your booking reference to manage your Southampton cruise parking reservation."
                canonicalPath="/manage-booking"
                breadcrumbs={[{ name: 'Home', path: '/' }, { name: 'Manage Booking', path: '/manage-booking' }]}
            />
            <div className="bg-neutral-light pb-12 relative">
                {/* Header Strip */}
                <div className="bg-white border-b border-gray-200 sticky top-20 z-30">
                    <div className="max-w-7xl mx-auto px-4 py-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wide font-medium mb-1">Booking Reference</p>
                                <h1 className="text-2xl sm:text-3xl font-bold text-brand-dark">{booking.booking_reference}</h1>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase flex items-center gap-1.5 ${
                                    isCancelled ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
                                }`}>
                                    {isCancelled ? <XCircle size={14} /> : <CheckCircle size={14} />} {booking.status}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    Look Up Another
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        {/* Left Column: Trip Details */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Trip Info Card */}
                            <div className={`bg-white rounded-lg border ${isCancelled ? 'border-gray-200 opacity-75 grayscale' : 'border-gray-200'} p-5`}>
                                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                                    <Calendar className="text-primary" size={20} />
                                    <h2 className="text-lg font-semibold text-brand-dark">Trip Itinerary</h2>
                                </div>
                                
                                <div className="flex flex-col md:flex-row gap-8 relative">
                                    {/* Line connecting dots on mobile */}
                                    <div className="absolute left-[11px] top-8 bottom-8 w-0.5 bg-gray-200 md:hidden"></div>

                                    <div className="flex-1 relative pl-8 md:pl-0">
                                         <div className="absolute left-0 top-1 w-6 h-6 bg-blue-50 text-primary rounded-full flex items-center justify-center md:hidden border-2 border-white z-10">
                                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                                        </div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Drop Off</p>
                                        <p className="text-lg font-bold text-brand-dark">{formatDateLong(booking.drop_off_datetime)}</p>
                                        <p className="text-gray-600 mb-2">Approx {formatTime(booking.drop_off_datetime)}</p>
                                        <div className="bg-gray-50 p-3 rounded text-sm text-gray-600 flex items-start gap-2">
                                            <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                                            <span>Unit 5, West Quay Industrial Estate, Southampton, SO15 1GZ</span>
                                        </div>
                                    </div>

                                    <div className="hidden md:flex items-center justify-center">
                                        <div className="h-12 w-px bg-gray-200"></div>
                                    </div>

                                    <div className="flex-1 relative pl-8 md:pl-0">
                                        <div className="absolute left-0 top-1 w-6 h-6 bg-blue-50 text-primary rounded-full flex items-center justify-center md:hidden border-2 border-white z-10">
                                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                                        </div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Return</p>
                                        <p className="text-lg font-bold text-brand-dark">{formatDateLong(booking.return_datetime)}</p>
                                        <p className="text-gray-600 mb-2">Approx {formatTime(booking.return_datetime)}</p>
                                        <div className="bg-gray-50 p-3 rounded text-sm text-gray-600 flex items-start gap-2">
                                            <Ship size={16} className="text-gray-400 mt-0.5 shrink-0" />
                                            <span>Arriving on <strong>{booking.ship_name}</strong>{booking.terminal && ` at ${booking.terminal}`}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle & Passenger Card */}
                            <div className={`bg-white rounded-lg border ${isCancelled ? 'border-gray-200 opacity-75 grayscale' : 'border-gray-200'} p-5`}>
                                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                                    <Car className="text-primary" size={20} />
                                    <h2 className="text-lg font-semibold text-brand-dark">Vehicle & Details</h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-2">Vehicle Registration</p>
                                        <p className="font-mono bg-yellow-100 px-3 py-1.5 rounded border border-yellow-300 w-fit font-semibold text-brand-dark">{booking.vehicle_registration}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-2">Make / Model</p>
                                        <p className="font-medium text-brand-dark">{booking.vehicle_make}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-2">Lead Passenger</p>
                                        <p className="font-medium text-brand-dark">{booking.first_name} {booking.last_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-2">Contact Number</p>
                                        <p className="font-medium text-brand-dark">{booking.phone}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Actions & Payment */}
                        <div className="lg:col-span-1 space-y-4">

                            {/* Action Buttons */}
                            <div className="bg-white rounded-lg border border-gray-200 p-5">
                                <h3 className="font-semibold text-brand-dark mb-4">Quick Actions</h3>
                                <div className="space-y-2">
                                    {!isCancelled && (!booking.amendment_history || (Array.isArray(booking.amendment_history) && booking.amendment_history.length === 0)) && (
                                        <button
                                            onClick={handleOpenAmend}
                                            className="w-full py-2 px-4 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                                        >
                                            <Edit size={16} /> Amend Booking
                                        </button>
                                    )}
                                    <button
                                        onClick={handleDownloadReceipt}
                                        disabled={isDownloading}
                                        className="w-full py-2 px-4 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors cursor-pointer"
                                    >
                                        {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                        {isDownloading ? 'Downloading...' : 'Download Receipt'}
                                    </button>
                                    {canCancel && (
                                        <button
                                            onClick={() => setIsCancelOpen(true)}
                                            className="w-full py-2 px-4 rounded-lg text-sm font-medium border border-red-300 text-red-600 hover:bg-red-50 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                                        >
                                            <XCircle size={16} /> Cancel Booking
                                        </button>
                                    )}
                                    {isCheckedIn && !isCancelled && (
                                        <div className="w-full py-3 px-4 rounded-lg text-xs bg-gray-50 border border-gray-200 text-gray-600 text-center">
                                            <p className="font-medium">Cannot cancel after check-in</p>
                                            <p className="mt-1">Please contact support for assistance</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment Summary */}
                            <div className="bg-white rounded-lg border border-gray-200 p-5">
                                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                                    <CreditCard size={18} className="text-primary" />
                                    <h3 className="font-semibold text-brand-dark">Payment Summary</h3>
                                </div>
                                <div className="space-y-4 text-sm">
                                    {/* Original Booking Section */}
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Original Booking</h4>

                                        {(() => {
                                          // Calculate original booking details
                                          const originalDropOff = booking.original_drop_off_datetime || booking.drop_off_datetime;
                                          const originalReturn = booking.original_return_datetime || booking.return_datetime;
                                          const origDropOffDate = new Date(originalDropOff);
                                          const origReturnDate = new Date(originalReturn);
                                          const origDiffTime = Math.abs(origReturnDate.getTime() - origDropOffDate.getTime());
                                          const origParkingDays = Math.ceil(origDiffTime / (1000 * 60 * 60 * 24)) + 1;

                                          // Calculate original parking cost breakdown
                                          let origCarParkingTotal = 0;
                                          let origFirstDayPricing = null;
                                          let origVanMultiplier = standardPricing?.van_multiplier ?? 1.5;
                                          let origVatRate = standardPricing?.vat_rate ?? 0;
                                          const origDailyBreakdown: DailyBreakdown[] = [];

                                          for (let i = 0; i < origParkingDays; i++) {
                                            const currentDate = new Date(origDropOffDate);
                                            currentDate.setDate(currentDate.getDate() + i);
                                            const dayPricing = getPricingForDate(currentDate) || standardPricing;

                                            if (i === 0) {
                                              origFirstDayPricing = dayPricing;
                                              origVanMultiplier = dayPricing?.van_multiplier ?? standardPricing?.van_multiplier ?? 1.5;
                                              origVatRate = dayPricing?.vat_rate ?? standardPricing?.vat_rate ?? 0;
                                            }

                                            const dailyRate = dayPricing?.price_per_day ?? standardPricing?.price_per_day ?? 0;
                                            origCarParkingTotal += dailyRate;

                                            origDailyBreakdown.push({
                                              dayNumber: i + 1,
                                              date: currentDate,
                                              rate: dailyRate,
                                              ruleId: dayPricing?.id || 'standard'
                                            });
                                          }

                                          // Group consecutive days for original booking
                                          const origGroupedBreakdown: GroupedBreakdown[] = [];
                                          if (origDailyBreakdown.length > 0) {
                                            let currentGroup = {
                                              startDay: origDailyBreakdown[0].dayNumber,
                                              endDay: origDailyBreakdown[0].dayNumber,
                                              startDate: origDailyBreakdown[0].date,
                                              endDate: origDailyBreakdown[0].date,
                                              rate: origDailyBreakdown[0].rate,
                                              ruleId: origDailyBreakdown[0].ruleId,
                                              days: 1,
                                              subtotal: origDailyBreakdown[0].rate
                                            };

                                            for (let i = 1; i < origDailyBreakdown.length; i++) {
                                              const day = origDailyBreakdown[i];
                                              if (day.rate === currentGroup.rate && day.ruleId === currentGroup.ruleId) {
                                                currentGroup.endDay = day.dayNumber;
                                                currentGroup.endDate = day.date;
                                                currentGroup.days += 1;
                                                currentGroup.subtotal += day.rate;
                                              } else {
                                                origGroupedBreakdown.push({
                                                  startDay: currentGroup.startDay,
                                                  endDay: currentGroup.endDay,
                                                  startDate: currentGroup.startDate,
                                                  endDate: currentGroup.endDate,
                                                  rate: currentGroup.rate,
                                                  days: currentGroup.days,
                                                  subtotal: currentGroup.subtotal
                                                });
                                                currentGroup = {
                                                  startDay: day.dayNumber,
                                                  endDay: day.dayNumber,
                                                  startDate: day.date,
                                                  endDate: day.date,
                                                  rate: day.rate,
                                                  ruleId: day.ruleId,
                                                  days: 1,
                                                  subtotal: day.rate
                                                };
                                              }
                                            }
                                            origGroupedBreakdown.push({
                                              startDay: currentGroup.startDay,
                                              endDay: currentGroup.endDay,
                                              startDate: currentGroup.startDate,
                                              endDate: currentGroup.endDate,
                                              rate: currentGroup.rate,
                                              days: currentGroup.days,
                                              subtotal: currentGroup.subtotal
                                            });
                                          }

                                          const origParkingSubtotalPence = isVan ? Math.round(origCarParkingTotal * origVanMultiplier * 100) : Math.round(origCarParkingTotal * 100);

                                          return (
                                            <>
                                              {/* Original Parking with Breakdown */}
                                              <div>
                                                <div className="flex justify-between font-semibold text-gray-700">
                                                  <span>Parking ({origParkingDays} {origParkingDays === 1 ? 'day' : 'days'})</span>
                                                  <span>£{origCarParkingTotal.toFixed(2)}</span>
                                                </div>

                                                {/* Collapsible breakdown */}
                                                <button
                                                  type="button"
                                                  onClick={() => setIsParkingBreakdownExpanded(!isParkingBreakdownExpanded)}
                                                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mt-1 cursor-pointer"
                                                >
                                                  {isParkingBreakdownExpanded ? (
                                                    <>
                                                      <ChevronUp size={14} />
                                                      Hide breakdown
                                                    </>
                                                  ) : (
                                                    <>
                                                      <ChevronDown size={14} />
                                                      Show breakdown
                                                    </>
                                                  )}
                                                </button>

                                                {isParkingBreakdownExpanded && origGroupedBreakdown.length > 0 && (
                                                  <div className="mt-2 space-y-1.5 pl-3 border-l-2 border-gray-200">
                                                    {origGroupedBreakdown.map((group, index) => {
                                                      const isSingleDay = group.startDay === group.endDay;
                                                      const dateRange = isSingleDay
                                                        ? format(group.startDate, 'd MMM')
                                                        : `${format(group.startDate, 'd MMM')} - ${format(group.endDate, 'd MMM')}`;
                                                      const dayRange = isSingleDay
                                                        ? `Day ${group.startDay}`
                                                        : `Days ${group.startDay}-${group.endDay}`;

                                                      return (
                                                        <div key={index} className="text-xs">
                                                          <div className="flex justify-between text-gray-600">
                                                            <span>{dayRange} ({dateRange})</span>
                                                            <span>£{group.rate.toFixed(2)}/day</span>
                                                          </div>
                                                          {!isSingleDay && (
                                                            <div className="flex justify-between text-gray-500 text-[11px] mt-0.5">
                                                              <span>{group.days} days × £{group.rate.toFixed(2)}</span>
                                                              <span>£{group.subtotal.toFixed(2)}</span>
                                                            </div>
                                                          )}
                                                        </div>
                                                      );
                                                    })}
                                                  </div>
                                                )}
                                              </div>

                                              {/* Original Van Surcharge */}
                                              {isVan && origVanMultiplier > 1 && (
                                                <div className="flex justify-between text-sm text-blue-700 items-center">
                                                  <span>Van Surcharge ({origVanMultiplier}×)</span>
                                                  <span>£{(Math.round(origCarParkingTotal * origVanMultiplier) - origCarParkingTotal).toFixed(2)}</span>
                                                </div>
                                              )}

                                              {/* Original Weekly Discount */}
                                              {(booking.weekly_discount_amount ?? 0) > 0 && (
                                                <>
                                                  <div className="flex justify-between text-sm text-green-600 items-center">
                                                    <span>Weekly Discount ({booking.weekly_discount_percent}%)</span>
                                                    <span>-£{(booking.weekly_discount_amount / 100).toFixed(2)}</span>
                                                  </div>
                                                  <div className="flex justify-between text-sm font-semibold text-gray-800 items-center pt-1 border-t border-gray-300">
                                                    <span>Parking Subtotal</span>
                                                    <span>£{((origParkingSubtotalPence - booking.weekly_discount_amount) / 100).toFixed(2)}</span>
                                                  </div>
                                                </>
                                              )}

                                              {/* Original Add-ons */}
                                              {addOnsTotal > 0 && (
                                                <div className="flex justify-between text-sm text-gray-600">
                                                  <span>Add-ons</span>
                                                  <span>£{addOnsTotal.toFixed(2)}</span>
                                                </div>
                                              )}

                                              {/* Original Subtotal */}
                                              <div className="flex justify-between pt-2 border-t border-gray-200">
                                                <span className="text-gray-600">Subtotal</span>
                                                <span className="font-medium">£{((booking.original_subtotal || booking.subtotal) / 100).toFixed(2)}</span>
                                              </div>

                                              {/* Original VAT */}
                                              {origVatRate > 0 && ((booking.original_vat || booking.vat) / 100) > 0 && (
                                                <div className="flex justify-between">
                                                  <span className="text-gray-600">VAT ({(origVatRate * 100).toFixed(0)}%)</span>
                                                  <span className="font-medium">£{((booking.original_vat || booking.vat) / 100).toFixed(2)}</span>
                                                </div>
                                              )}

                                              {/* Original Promo Discount */}
                                              {discountInPounds > 0 && (
                                                <div className="flex justify-between text-green-600">
                                                  <span>Promo Discount{booking.promo_code && ` (${booking.promo_code})`}</span>
                                                  <span className="font-medium">-£{discountInPounds.toFixed(2)}</span>
                                                </div>
                                              )}

                                              {/* Original Total */}
                                              <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold text-gray-800">
                                                <span>Original Total</span>
                                                <span>£{((booking.original_total || booking.total) / 100).toFixed(2)}</span>
                                              </div>
                                            </>
                                          );
                                        })()}
                                    </div>

                                    {/* Amendments Section */}
                                    {booking.amendment_history && Array.isArray(booking.amendment_history) && booking.amendment_history.length > 0 && (
                                      <>
                                        {(booking.amendment_history as any[]).map((amendment, idx) => {
                                          const amendNum = idx + 1;
                                          const amendmentSubtotal = amendment.amendment_subtotal || 0;
                                          const amendmentVat = amendment.amendment_vat || 0;
                                          const amendmentCharge = amendment.amendment_charge || 0;

                                          // Calculate NEW booking day-by-day pricing
                                          const newDropOffDate = new Date(amendment.new_drop_off_datetime);
                                          const newReturnDate = new Date(amendment.new_return_datetime);
                                          const newDiffTime = Math.abs(newReturnDate.getTime() - newDropOffDate.getTime());
                                          const newDays = Math.ceil(newDiffTime / (1000 * 60 * 60 * 24)) + 1;

                                          let newCarParkingTotal = 0;
                                          let newFirstDayPricing = null;
                                          for (let i = 0; i < newDays; i++) {
                                            const currentDate = new Date(newDropOffDate);
                                            currentDate.setDate(currentDate.getDate() + i);
                                            const dayPricing = getPricingForDate(currentDate) || standardPricing;
                                            if (i === 0) {
                                              newFirstDayPricing = dayPricing;
                                            }
                                            const dayPrice = dayPricing?.price_per_day || 0;
                                            newCarParkingTotal += dayPrice;
                                          }

                                          const newPricingRule = newFirstDayPricing || standardPricing;
                                          const newVanMultiplier = newPricingRule?.van_multiplier || 1.5;
                                          const newParkingTotal = isVan ? Math.round(newCarParkingTotal * newVanMultiplier) : newCarParkingTotal;
                                          const newParkingCostPence = newParkingTotal * 100;

                                          // Calculate PREVIOUS parking cost from dates
                                          const prevDropOffDate = new Date(amendment.previous_drop_off_datetime);
                                          const prevReturnDate = new Date(amendment.previous_return_datetime);
                                          const prevDiffTime = Math.abs(prevReturnDate.getTime() - prevDropOffDate.getTime());
                                          const prevDays = Math.ceil(prevDiffTime / (1000 * 60 * 60 * 24)) + 1;

                                          let prevCarParkingTotal = 0;
                                          for (let i = 0; i < prevDays; i++) {
                                            const currentDate = new Date(prevDropOffDate);
                                            currentDate.setDate(currentDate.getDate() + i);
                                            const dayPricing = getPricingForDate(currentDate) || standardPricing;
                                            const dayPrice = dayPricing?.price_per_day || 0;
                                            prevCarParkingTotal += dayPrice;
                                          }

                                          const prevPricingRule = getPricingForDate(prevDropOffDate) || standardPricing;
                                          const prevVanMultiplier = prevPricingRule?.van_multiplier || 1.5;
                                          const prevParkingSubtotal = isVan ? Math.round(prevCarParkingTotal * prevVanMultiplier) : prevCarParkingTotal;
                                          const prevParkingCostPence = prevParkingSubtotal * 100;

                                          // Use booking's weekly discount for previous parking
                                          const prevWeeklyDiscount = booking.weekly_discount_amount || 0;
                                          const prevParkingWithDiscount = prevParkingCostPence - prevWeeklyDiscount;
                                          const parkingDiff = (newParkingCostPence - prevParkingWithDiscount) / 100;

                                          // Calculate amendment fee from subtotal (only use positive parking diff, no refunds)
                                          const chargeableParkingDiff = Math.max(0, parkingDiff);
                                          const amendmentFeeAmount = amendmentSubtotal - (chargeableParkingDiff * 100);

                                          const prevDropOff = format(new Date(amendment.previous_drop_off_datetime), 'd MMM, yyyy');
                                          const prevReturn = format(new Date(amendment.previous_return_datetime), 'd MMM, yyyy');
                                          const newDropOff = format(new Date(amendment.new_drop_off_datetime), 'd MMM, yyyy');
                                          const newReturn = format(new Date(amendment.new_return_datetime), 'd MMM, yyyy');

                                          return (
                                            <div key={idx} className="space-y-2 pt-4 border-t-2 border-gray-300">
                                              <div className="flex justify-between items-baseline">
                                                <h4 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">
                                                  Amendment #{amendNum} <span className="text-blue-600">+£{(amendmentCharge / 100).toFixed(2)}</span>
                                                </h4>
                                              </div>

                                              <div className="text-xs text-gray-600 space-y-0.5">
                                                <div><span className="font-medium">Previous:</span> {prevDropOff} - {prevReturn}</div>
                                                <div><span className="font-medium">New:</span> {newDropOff} - {newReturn}</div>
                                              </div>

                                              {/* Previous Parking */}
                                              <div className="flex justify-between text-sm text-gray-600">
                                                <span>Previous Parking (with discount)</span>
                                                <span>£{(prevParkingWithDiscount / 100).toFixed(2)}</span>
                                              </div>

                                              {/* New Parking */}
                                              <div className="flex justify-between text-sm font-semibold text-gray-700">
                                                <span>New Parking ({newDays} days)</span>
                                                <span>£{(newParkingCostPence / 100).toFixed(2)}</span>
                                              </div>

                                              {/* New Parking Breakdown (if available) */}
                                              {amendment.daily_breakdown && Array.isArray(amendment.daily_breakdown) && amendment.daily_breakdown.length > 0 && (
                                                <div className="pl-3 border-l-2 border-gray-200 space-y-1">
                                                  {(() => {
                                                    // Group consecutive days with same rate
                                                    const grouped: any[] = [];
                                                    let current = { ...amendment.daily_breakdown[0], days: 1, total: amendment.daily_breakdown[0].rate };

                                                    for (let i = 1; i < amendment.daily_breakdown.length; i++) {
                                                      const day = amendment.daily_breakdown[i];
                                                      if (day.rate === current.rate) {
                                                        current.days += 1;
                                                        current.total += day.rate;
                                                      } else {
                                                        grouped.push(current);
                                                        current = { ...day, days: 1, total: day.rate };
                                                      }
                                                    }
                                                    grouped.push(current);

                                                    return grouped.map((group, gIdx) => (
                                                      <div key={gIdx} className="text-xs text-gray-600">
                                                        <div className="flex justify-between">
                                                          <span>
                                                            {group.days > 1 ? `${group.days} days × £${(group.rate / 100).toFixed(2)}` : `1 day`}
                                                          </span>
                                                          <span>£{(group.total / 100).toFixed(2)}</span>
                                                        </div>
                                                      </div>
                                                    ));
                                                  })()}
                                                </div>
                                              )}

                                              {/* Parking Difference */}
                                              <div className={`flex justify-between text-sm font-medium ${parkingDiff < 0 ? 'text-gray-600' : 'text-gray-700'}`}>
                                                <span>Parking Difference</span>
                                                <span>{parkingDiff < 0 ? '-' : ''}£{Math.abs(parkingDiff).toFixed(2)}</span>
                                              </div>

                                              {/* Amendment Fee */}
                                              {amendmentFeeAmount > 0 && (
                                                <div className="flex justify-between text-sm text-gray-600">
                                                  <span>Amendment Fee</span>
                                                  <span>£{(amendmentFeeAmount / 100).toFixed(2)}</span>
                                                </div>
                                              )}

                                              {/* Amendment Subtotal */}
                                              <div className="flex justify-between pt-1 border-t border-gray-200 text-sm">
                                                <span className="text-gray-600">Subtotal</span>
                                                <span className="font-medium">£{(amendmentSubtotal / 100).toFixed(2)}</span>
                                              </div>

                                              {/* Amendment VAT */}
                                              {amendmentVat > 0 && (
                                                <div className="flex justify-between text-sm">
                                                  <span className="text-gray-600">VAT {amendment.vat_rate ? `(${(amendment.vat_rate * 100).toFixed(0)}%)` : ''}</span>
                                                  <span className="font-medium">£{(amendmentVat / 100).toFixed(2)}</span>
                                                </div>
                                              )}

                                              {/* Amendment Total */}
                                              <div className="flex justify-between pt-1 border-t border-gray-200 text-sm font-semibold text-blue-700">
                                                <span>Amendment Total</span>
                                                <span>£{(amendmentCharge / 100).toFixed(2)}</span>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </>
                                    )}

                                    {/* Final Total Paid */}
                                    <div className="border-t-2 border-gray-300 pt-3 flex justify-between items-center">
                                        <span className="font-bold text-brand-dark text-base">Total Paid</span>
                                        <span className="font-bold text-brand-dark text-xl">£{totalInPounds.toFixed(2)}</span>
                                    </div>
                                </div>
                                {booking.payment_status === 'completed' && (
                                  <div className="mt-4 bg-green-50 text-green-700 text-xs px-3 py-2 rounded flex items-center gap-2">
                                      <CheckCircle size={14} /> Payment Completed
                                  </div>
                                )}
                            </div>
                            
                            {/* Need Help */}
                             <div className="bg-gray-50 rounded-lg border border-gray-200 p-5 text-center">
                                <h3 className="font-semibold text-brand-dark mb-2">Need Help?</h3>
                                <p className="text-sm text-gray-600 mb-4">Our support team is available 24/7 to assist with your booking.</p>
                                <Link to="/contact" className="inline-block bg-primary text-white hover:bg-primary-dark font-medium text-sm px-4 py-2 rounded-lg transition-colors cursor-pointer">
                                    Contact Support
                                </Link>
                             </div>

                        </div>
                    </div>

                    {/* Previous Bookings Section */}
                    {previousBookings.length > 0 && (
                      <div>
                          <div className="flex items-center gap-3 mb-4">
                              <History className="text-primary" size={20} />
                              <h2 className="text-xl font-semibold text-brand-dark">Previous Bookings</h2>
                          </div>
                          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                              <div className="overflow-x-auto">
                                  <table className="w-full text-left text-sm">
                                      <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                                          <tr>
                                              <th className="p-4">Reference</th>
                                              <th className="p-4">Dates</th>
                                              <th className="p-4">Ship</th>
                                              <th className="p-4">Total</th>
                                              <th className="p-4">Status</th>
                                          </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100">
                                          {previousBookings.map(prev => (
                                              <tr key={prev.id} className="hover:bg-gray-50">
                                                  <td className="p-4 font-medium text-brand-dark">{prev.booking_reference}</td>
                                                  <td className="p-4 text-gray-600">
                                                    {formatDateShort(prev.drop_off_datetime)} - {formatDateShort(prev.return_datetime)}
                                                  </td>
                                                  <td className="p-4 text-gray-600">{prev.ship_name}</td>
                                                  <td className="p-4 font-bold text-gray-800">£{(prev.total / 100).toFixed(2)}</td>
                                                  <td className="p-4">
                                                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold uppercase ${
                                                        prev.status === 'completed' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'
                                                      }`}>
                                                          {prev.status === 'completed' ? <CheckCircle size={10} /> : <XCircle size={10} />} {prev.status}
                                                      </span>
                                                  </td>
                                              </tr>
                                          ))}
                                      </tbody>
                                  </table>
                              </div>
                          </div>
                      </div>
                    )}
                </div>

                {/* Amend Booking Modal */}
                {isAmendOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-brand-dark/50 backdrop-blur-sm" onClick={() => setIsAmendOpen(false)}></div>
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative z-10 animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center p-6 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-brand-dark">Amend Booking</h2>
                                <button onClick={() => setIsAmendOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleAmendSubmit}>
                                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Drop Off Date & Time"
                                            type="datetime-local"
                                            value={isoToDatetimeLocal(amendForm.dropOffDateTime)}
                                            onChange={(e) => setAmendForm({...amendForm, dropOffDateTime: datetimeLocalToISO(e.target.value)})}
                                        />
                                        <Input
                                            label="Return Date & Time"
                                            type="datetime-local"
                                            value={isoToDatetimeLocal(amendForm.returnDateTime)}
                                            onChange={(e) => setAmendForm({...amendForm, returnDateTime: datetimeLocalToISO(e.target.value)})}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Vehicle Reg"
                                            value={amendForm.vehicleReg}
                                            onChange={(e) => setAmendForm({...amendForm, vehicleReg: e.target.value})}
                                        />
                                        <Input
                                            label="Make / Model"
                                            value={amendForm.vehicleMake}
                                            onChange={(e) => setAmendForm({...amendForm, vehicleMake: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                                    <button
                                        type="button"
                                        onClick={() => setIsAmendOpen(false)}
                                        disabled={isSavingAmend || isCheckingAmendment}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSavingAmend || isCheckingAmendment}
                                        className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                        {(isSavingAmend || isCheckingAmendment) ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                        {isCheckingAmendment ? 'Checking...' : isSavingAmend ? 'Saving...' : 'Continue'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Amendment Confirmation Modal */}
                {showAmendConfirmation && amendmentDetails && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-brand-dark/50 backdrop-blur-sm" onClick={() => setShowAmendConfirmation(false)}></div>
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col relative z-10 animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
                                <h2 className="text-xl font-bold text-brand-dark">Confirm Amendment</h2>
                                <button onClick={() => setShowAmendConfirmation(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto">
                                {/* New Booking Dates - Stat Card Style */}
                                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 p-4 rounded-lg mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-primary/10 p-2 rounded-lg">
                                            <Calendar className="text-primary" size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-600 uppercase tracking-wide font-medium mb-1">
                                                New Booking Period
                                            </p>
                                            <p className="text-base font-bold text-brand-dark">
                                                {amendForm.dropOffDateTime && format(new Date(amendForm.dropOffDateTime), 'MMM d')} - {amendForm.returnDateTime && format(new Date(amendForm.returnDateTime), 'MMM d, yyyy')}
                                            </p>
                                            <p className="text-xs text-gray-600 mt-0.5">
                                                {amendmentDetails.dailyBreakdown.length} {amendmentDetails.dailyBreakdown.length === 1 ? 'day' : 'days'} of parking
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    {/* Original Booking Summary */}
                                    <div className="bg-gray-50 p-3 rounded-lg text-xs space-y-1">
                                        <div className="text-gray-700 font-semibold mb-2">Original Booking</div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Parking</span>
                                            <span>£{amendmentDetails.oldParkingCost.toFixed(2)}</span>
                                        </div>
                                        {booking.weekly_discount_amount > 0 && (
                                            <>
                                                <div className="flex justify-between text-green-600">
                                                    <span>Weekly Discount ({booking.weekly_discount_percent}%)</span>
                                                    <span>-£{(booking.weekly_discount_amount / 100).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-gray-600 font-medium pt-1 border-t border-gray-300">
                                                    <span>Parking Subtotal</span>
                                                    <span>£{(amendmentDetails.oldParkingCost - (booking.weekly_discount_amount / 100)).toFixed(2)}</span>
                                                </div>
                                            </>
                                        )}
                                        {amendmentDetails.addOnsCost > 0 && (
                                            <div className="flex justify-between text-gray-600">
                                                <span>Add-ons</span>
                                                <span>£{amendmentDetails.addOnsCost.toFixed(2)}</span>
                                            </div>
                                        )}
                                        {amendmentDetails.vatRate > 0 && (
                                          <div className="flex justify-between text-gray-600">
                                              <span>VAT ({(amendmentDetails.vatRate * 100).toFixed(0)}%)</span>
                                              <span>£{(amendmentDetails.oldBookingCost * amendmentDetails.vatRate / (1 + amendmentDetails.vatRate)).toFixed(2)}</span>
                                          </div>
                                        )}
                                        <div className="flex justify-between text-gray-900 font-semibold pt-1 border-t border-gray-300">
                                            <span>Total Paid</span>
                                            <span>£{amendmentDetails.oldBookingCost.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* New Booking Calculation */}
                                    <div className="bg-blue-50 p-3 rounded-lg text-xs space-y-1">
                                        <div className="text-gray-700 font-semibold mb-2">New Booking</div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Parking</span>
                                            <span>£{amendmentDetails.newParkingCost.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-red-600">
                                            <span>Less: Old Parking</span>
                                            <span>-£{(amendmentDetails.oldParkingCost - (booking.weekly_discount_amount || 0) / 100).toFixed(2)}</span>
                                        </div>
                                        <div className={`flex justify-between font-semibold pt-1 border-t border-blue-200 ${(amendmentDetails.rawPriceDifference || 0) < 0 ? 'text-gray-600' : 'text-primary'}`}>
                                            <span>Parking Difference</span>
                                            <span>{(amendmentDetails.rawPriceDifference || 0) < 0 ? '-' : ''}£{Math.abs(amendmentDetails.rawPriceDifference || 0).toFixed(2)}</span>
                                        </div>
                                        {amendmentDetails.rawPriceDifference < 0 && (
                                            <div className="bg-orange-50 border border-orange-200 rounded p-2 mt-2">
                                                <div className="flex items-start gap-2">
                                                    <AlertCircle size={14} className="text-orange-600 mt-0.5 shrink-0" />
                                                    <p className="text-[11px] text-orange-700">
                                                        <span className="font-semibold">No refund available.</span> You're reducing your booking from {Math.ceil(Math.abs(new Date(booking.return_datetime).getTime() - new Date(booking.drop_off_datetime).getTime()) / (1000 * 60 * 60 * 24)) + 1} days to {amendmentDetails.dailyBreakdown.length} days. We don't provide refunds for decreased parking duration.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <div
                                            className="flex justify-between text-sm cursor-pointer hover:bg-gray-50 p-2 rounded -mx-2"
                                            onClick={() => setIsBreakdownExpanded(!isBreakdownExpanded)}
                                        >
                                            <span className="text-gray-700 font-medium flex items-center gap-1">
                                                New Booking Breakdown ({amendmentDetails.dailyBreakdown.length} {amendmentDetails.dailyBreakdown.length === 1 ? 'day' : 'days'})
                                                {isBreakdownExpanded ? (
                                                    <ChevronUp size={14} className="text-gray-400" />
                                                ) : (
                                                    <ChevronDown size={14} className="text-gray-400" />
                                                )}
                                            </span>
                                        </div>
                                        {isBreakdownExpanded && amendmentDetails.dailyBreakdown.length > 0 && (
                                            <div className="mt-2 space-y-1.5 pl-3 border-l-2 border-gray-200 max-h-48 overflow-y-auto">
                                                {(() => {
                                                    // Group consecutive days with same rate
                                                    const groups: Array<{
                                                        startDay: number;
                                                        endDay: number;
                                                        startDate: string;
                                                        endDate: string;
                                                        rate: number;
                                                        days: number;
                                                        subtotal: number;
                                                    }> = [];

                                                    if (amendmentDetails.dailyBreakdown.length > 0) {
                                                        let currentGroup = {
                                                            startDay: amendmentDetails.dailyBreakdown[0].day,
                                                            endDay: amendmentDetails.dailyBreakdown[0].day,
                                                            startDate: amendmentDetails.dailyBreakdown[0].date,
                                                            endDate: amendmentDetails.dailyBreakdown[0].date,
                                                            rate: amendmentDetails.dailyBreakdown[0].rate,
                                                            days: 1,
                                                            subtotal: amendmentDetails.dailyBreakdown[0].rate
                                                        };

                                                        for (let i = 1; i < amendmentDetails.dailyBreakdown.length; i++) {
                                                            const day = amendmentDetails.dailyBreakdown[i];

                                                            if (day.rate === currentGroup.rate) {
                                                                currentGroup.endDay = day.day;
                                                                currentGroup.endDate = day.date;
                                                                currentGroup.days += 1;
                                                                currentGroup.subtotal += day.rate;
                                                            } else {
                                                                groups.push({ ...currentGroup });
                                                                currentGroup = {
                                                                    startDay: day.day,
                                                                    endDay: day.day,
                                                                    startDate: day.date,
                                                                    endDate: day.date,
                                                                    rate: day.rate,
                                                                    days: 1,
                                                                    subtotal: day.rate
                                                                };
                                                            }
                                                        }
                                                        groups.push(currentGroup);
                                                    }

                                                    return groups.map((group, index) => {
                                                        const isSingleDay = group.startDay === group.endDay;
                                                        const dayRange = isSingleDay
                                                            ? `Day ${group.startDay}`
                                                            : `Days ${group.startDay}-${group.endDay}`;

                                                        // Parse dates to get just the day and month
                                                        const startParts = group.startDate.split(' ');
                                                        const endParts = group.endDate.split(' ');
                                                        const dateRange = isSingleDay
                                                            ? `${startParts[1]} ${startParts[0]}`
                                                            : `${startParts[1]} ${startParts[0]} - ${endParts[1]} ${endParts[0]}`;

                                                        return (
                                                            <div key={index} className="text-xs">
                                                                <div className="flex justify-between text-gray-600">
                                                                    <span>{dayRange} ({dateRange})</span>
                                                                    <span>£{group.rate.toFixed(2)}/day</span>
                                                                </div>
                                                                {!isSingleDay && (
                                                                    <div className="flex justify-between text-gray-500 text-[11px] mt-0.5">
                                                                        <span>{group.days} days × £{group.rate.toFixed(2)}</span>
                                                                        <span>£{group.subtotal.toFixed(2)}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    });
                                                })()}
                                            </div>
                                        )}
                                    </div>

                                    <div className="border-t border-gray-200 pt-3 space-y-2">
                                        <div className="text-xs text-gray-700 font-semibold mb-1">Amount to Pay</div>
                                        {amendmentDetails.priceDifference > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-700">Additional Parking</span>
                                                <span className="font-medium">£{amendmentDetails.priceDifference.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-700">Amendment Fee</span>
                                            <span className="font-medium">£{amendmentDetails.amendmentFee.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm pt-1 border-t border-gray-200">
                                            <span className="text-gray-600">Subtotal</span>
                                            <span className="font-medium">£{(amendmentDetails.priceDifference + amendmentDetails.amendmentFee).toFixed(2)}</span>
                                        </div>
                                    </div>
                                    {amendmentDetails.vatRate > 0 && (
                                      <div className="flex justify-between text-sm">
                                          <span className="text-gray-600">VAT ({(amendmentDetails.vatRate * 100).toFixed(0)}%)</span>
                                          <span className="font-medium">£{((amendmentDetails.priceDifference + amendmentDetails.amendmentFee) * amendmentDetails.vatRate).toFixed(2)}</span>
                                      </div>
                                    )}
                                </div>
                            </div>

                            {/* Fixed Footer with Total and Buttons */}
                            <div className="border-t border-gray-200 p-6 bg-white rounded-b-xl shrink-0">
                                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                                    <span className="font-bold text-brand-dark text-lg">Total to Pay</span>
                                    <span className="font-bold text-brand-dark text-2xl">£{amendmentDetails.additionalCharge.toFixed(2)}</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={handleAmendPayment}
                                        disabled={isSavingAmend}
                                        className="w-full py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors cursor-pointer"
                                    >
                                        {isSavingAmend ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" /> Processing...
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard size={16} /> Proceed to Payment
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setShowAmendConfirmation(false)}
                                        disabled={isSavingAmend}
                                        className="w-full py-2 px-4 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Cancel Confirmation Modal */}
                {isCancelOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-brand-dark/50 backdrop-blur-sm" onClick={cancelState === 'loading' ? undefined : handleCloseCancelModal}></div>
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden">
                            <div className="p-6 text-center">
                                {/* Loading State */}
                                {cancelState === 'loading' && (
                                    <>
                                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Loader2 size={32} className="animate-spin" />
                                        </div>
                                        <h2 className="text-xl font-bold text-brand-dark mb-2">Cancelling Booking...</h2>
                                        <p className="text-gray-600">
                                            Please wait while we process your cancellation request.
                                        </p>
                                    </>
                                )}

                                {/* Success State */}
                                {cancelState === 'success' && cancelResult && (
                                    <>
                                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle size={32} />
                                        </div>
                                        <h2 className="text-xl font-bold text-brand-dark mb-2">Booking Cancelled</h2>
                                        <p className="text-gray-600 mb-6 whitespace-pre-line">
                                            {cancelResult.message}
                                        </p>

                                        {cancelResult.refund_issued && (
                                            <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6 text-left">
                                                <p className="text-sm text-green-800 font-medium">
                                                    ✓ Refund Amount: £{((cancelResult.refund_amount || 0) / 100).toFixed(2)}
                                                </p>
                                            </div>
                                        )}

                                        <button
                                            onClick={handleCloseCancelModal}
                                            className="w-full py-2 px-4 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors cursor-pointer"
                                        >
                                            Close
                                        </button>
                                    </>
                                )}

                                {/* Error State */}
                                {cancelState === 'error' && cancelResult && (
                                    <>
                                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <XCircle size={32} />
                                        </div>
                                        <h2 className="text-xl font-bold text-brand-dark mb-2">Cancellation Failed</h2>
                                        <p className="text-gray-600 mb-6">
                                            {cancelResult.message}
                                        </p>

                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => {
                                                    setCancelState('idle');
                                                    setCancelResult(null);
                                                }}
                                                className="w-full py-2 px-4 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer"
                                            >
                                                Try Again
                                            </button>
                                            <button
                                                onClick={handleCloseCancelModal}
                                                className="w-full py-2 px-4 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </>
                                )}

                                {/* Idle/Confirmation State */}
                                {cancelState === 'idle' && (
                                    <>
                                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <AlertTriangle size={32} />
                                        </div>
                                        <h2 className="text-xl font-bold text-brand-dark mb-2">Cancel Booking?</h2>
                                        <p className="text-gray-600 mb-6">
                                            Are you sure you want to cancel booking <span className="font-bold">{booking?.booking_reference}</span>? This action cannot be undone.
                                        </p>

                                        <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6 text-left flex gap-3">
                                            <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
                                            <p className="text-sm text-red-800 font-medium">
                                                Warning: Bookings cancelled within 48 hours of arrival are non-refundable according to our terms of service.
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={handleCancelConfirm}
                                                className="w-full py-2 px-4 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer"
                                            >
                                                Yes, Cancel Booking
                                            </button>
                                            <button
                                                onClick={handleCloseCancelModal}
                                                className="w-full py-2 px-4 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                                            >
                                                No, Keep Booking
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Amendment Success Toast */}
                {showAmendmentSuccess && (
                    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
                        <div className="bg-green-600 text-white rounded-lg shadow-2xl px-6 py-4 flex items-center gap-3 max-w-md">
                            <div className="shrink-0">
                                <CheckCircle size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-sm">Booking Updated!</h3>
                                <p className="text-xs text-green-50 mt-1">
                                    Your booking has been successfully amended. Please enter your details below to view the updated booking.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowAmendmentSuccess(false)}
                                className="shrink-0 text-green-100 hover:text-white transition-colors cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </Layout>
    );
  }

  // Login UI (Fallback for idle/loading/error states)
  return (
    <Layout>
      <SEO
        title="Manage Your Booking | Simple Cruise Parking Southampton"
        description="View, modify or cancel your Simple Cruise Parking booking. Enter your booking reference to manage your Southampton cruise parking reservation."
        canonicalPath="/manage-booking"
        breadcrumbs={[{ name: 'Home', path: '/' }, { name: 'Manage Booking', path: '/manage-booking' }]}
      />
      <div className="bg-neutral-light py-12 flex items-center justify-center px-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200 w-full max-w-lg">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-brand-dark mb-2">Manage Booking</h1>
                <p className="text-gray-600 text-sm">Enter your booking reference and email to view, amend, or cancel your booking.</p>
            </div>

            {status === 'error' && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
                    <AlertCircle size={20} className="shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-sm">Booking not found</p>
                        <p className="text-xs mt-1">{errorMessage || 'Please check your reference number and email address and try again.'}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <Input
                        label="Booking Reference"
                        placeholder="e.g. SCP-1234"
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1.5">Your reference was emailed to you after booking</p>
                </div>
                <Input
                    label="Email Address"
                    type="email"
                    placeholder="e.g. name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                    {status === 'loading' ? (
                        <>
                            <Loader2 size={18} className="animate-spin" /> Finding your booking...
                        </>
                    ) : (
                        <>Find My Booking <ArrowRight size={18} /></>
                    )}
                </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-200">
                <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Can't find your booking reference?</p>
                    <Link to="/contact" className="text-primary font-medium text-sm hover:text-brand-dark transition-colors cursor-pointer">
                        Contact Support
                    </Link>
                </div>
            </div>
        </div>
      </div>
    </Layout>
  );
};