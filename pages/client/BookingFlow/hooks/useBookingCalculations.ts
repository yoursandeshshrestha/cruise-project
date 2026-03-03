import { useMemo, useEffect } from 'react';
import { BookingState } from '../../../../types';
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

interface DailyRate {
  day: number;
  date: string;
  rate: number;
}

interface PricingBreakdownItem {
  name: string;
  days: number;
  total: number;
  dailyRates: DailyRate[];
}

interface CalculationResult {
  numberOfDays: number;
  parkingCost: number;
  isMinimumApplied: boolean;
  addOnsCost: number;
  baseCost: number;
  vatAmount: number;
  subtotalWithVAT: number;
  finalTotal: number;
  pricingBreakdown: PricingBreakdownItem[];
}

export const useBookingCalculations = (
  booking: BookingState,
  settings: Settings | null,
  addOns: AddOn[],
  promoDiscount: number,
  activePricing?: { base_car_price?: number; base_van_price?: number; additional_day_rate?: number; additional_day_rate_van?: number } | null
): CalculationResult => {
  const { getPricingForDate, fetchPricingRules, initialized } = usePricingStore();

  // Fetch pricing rules on mount if not initialized
  useEffect(() => {
    if (!initialized) {
      fetchPricingRules();
    }
  }, [initialized, fetchPricingRules]);

  return useMemo(() => {
    // Calculate number of days and breakdown by pricing period
    let numberOfDays = 0;
    let parkingCost = 0;
    const pricingBreakdown: PricingBreakdownItem[] = [];
    let firstDayPricing = null;

    if (booking.dropOffDate && booking.returnDate) {
      const start = new Date(booking.dropOffDate);
      const end = new Date(booking.returnDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      numberOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const isVan = booking.vehicleType === 'van';
      const dailyCosts: Array<{
        name: string;
        rate: number;
        ruleId: string;
        date: Date;
        dayNumber: number;
      }> = [];

      // Calculate cost for each individual day
      for (let i = 0; i < numberOfDays; i++) {
        const currentDate = new Date(start);
        currentDate.setDate(currentDate.getDate() + i);

        // Get pricing rule for this specific day
        const dayPricing = getPricingForDate(currentDate) || {
          id: 'default',
          name: 'Standard Pricing',
          base_car_price: 26.00,
          base_van_price: 36.00,
          additional_day_rate: ADDITIONAL_DAY_RATE,
          additional_day_rate_van: 18.00,
          vat_rate: settings?.vatRate ?? 0.20,
        };

        // Store first day's pricing rule for VAT rate
        if (i === 0) {
          firstDayPricing = dayPricing;
        }

        let dailyRate: number;

        if (i === 0) {
          // First day of booking: use base price
          dailyRate = isVan
            ? (dayPricing.base_van_price || 36.00)
            : (dayPricing.base_car_price || 26.00);
        } else {
          // All other days: use additional day rate
          dailyRate = isVan
            ? (dayPricing.additional_day_rate_van || 18.00)
            : (dayPricing.additional_day_rate || ADDITIONAL_DAY_RATE);
        }

        parkingCost += dailyRate;
        dailyCosts.push({
          name: dayPricing.name || 'Standard Pricing',
          rate: dailyRate,
          ruleId: dayPricing.id || 'default',
          date: new Date(currentDate),
          dayNumber: i + 1,
        });
      }

      // Group consecutive days with the same pricing rule for display
      interface PricingGroup {
        name: string;
        days: number;
        total: number;
        ruleId: string;
        dailyRates: DailyRate[];
      }

      const groups: PricingGroup[] = [];
      let currentGroup: PricingGroup | null = null;

      dailyCosts.forEach((day) => {
        if (currentGroup && currentGroup.ruleId === day.ruleId) {
          // Same pricing rule, add to current group
          currentGroup.days += 1;
          currentGroup.total += day.rate;
          currentGroup.dailyRates.push({
            day: day.dayNumber,
            date: day.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
            rate: day.rate,
          });
        } else {
          // Different pricing rule, start new group
          if (currentGroup) {
            groups.push(currentGroup);
          }
          currentGroup = {
            name: day.name,
            days: 1,
            total: day.rate,
            ruleId: day.ruleId,
            dailyRates: [{
              day: day.dayNumber,
              date: day.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
              rate: day.rate,
            }],
          };
        }
      });

      // Add the last group
      if (currentGroup) {
        groups.push(currentGroup);
      }

      // Build pricing breakdown for display
      groups.forEach(group => {
        pricingBreakdown.push({
          name: group.name,
          days: group.days,
          total: group.total,
          dailyRates: group.dailyRates,
        });
      });
    }

    const isMinimumApplied = false;

    // Calculate add-ons cost
    const addOnsCost = booking.selectedAddOns.reduce((acc, slug) => {
      const addon = addOns.find(a => a.slug === slug);
      return acc + (addon ? addon.price : 0);
    }, 0);

    // Use VAT rate from first day's pricing rule, fallback to settings, then default to 0.20
    const vatRate = (firstDayPricing?.vat_rate ?? settings?.vatRate) ?? 0.20;

    // Calculate base cost and VAT
    const baseCost = parkingCost + addOnsCost;
    const vatAmount = baseCost * vatRate;
    const subtotalWithVAT = baseCost + vatAmount;

    // Final total after discount
    const finalTotal = Math.max(0, subtotalWithVAT - promoDiscount);

    return {
      numberOfDays,
      parkingCost,
      isMinimumApplied,
      addOnsCost,
      baseCost,
      vatAmount,
      subtotalWithVAT,
      finalTotal,
      pricingBreakdown,
    };
  }, [booking.dropOffDate, booking.returnDate, booking.selectedAddOns, booking.vehicleType, settings, addOns, promoDiscount, getPricingForDate]);
};
