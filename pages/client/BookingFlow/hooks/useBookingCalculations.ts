import { useMemo, useEffect } from 'react';
import { format } from 'date-fns';
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
  weeklyDiscountPercent: number;
  weeklyDiscountAmount: number;
}

export const useBookingCalculations = (
  booking: BookingState,
  settings: Settings | null,
  addOns: AddOn[],
  promoDiscount: number,
  activePricing?: { price_per_day?: number; van_multiplier?: number } | null
): CalculationResult => {
  const { getPricingForDate, fetchPricingRules, initialized, pricingRules } = usePricingStore();

  // Fetch pricing rules on mount if not initialized
  useEffect(() => {
    if (!initialized) {
      fetchPricingRules();
    }
  }, [initialized, fetchPricingRules]);

  // Get standard pricing (priority 2) as fallback
  const standardPricing = pricingRules.find(rule => rule.priority === 2 && rule.is_active);

  return useMemo(() => {
    // Calculate number of days and breakdown by pricing period
    let numberOfDays = 0;
    let parkingCost = 0;
    const pricingBreakdown: PricingBreakdownItem[] = [];
    let firstDayPricing = null;
    let weeklyDiscountPercent = 0;
    let weeklyDiscountAmount = 0;

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

      // Calculate cost for each individual day using flat rate pricing
      let carParkingCost = 0;
      let vanMultiplier = standardPricing?.van_multiplier ?? 0;
      const pricingRuleDayCounts = new Map<string, { rule: typeof standardPricing; days: number }>();

      for (let i = 0; i < numberOfDays; i++) {
        const currentDate = new Date(start);
        currentDate.setDate(currentDate.getDate() + i);

        // Get pricing rule for this specific day, fallback to standard pricing
        const dayPricing = getPricingForDate(currentDate) || standardPricing;

        // Store first day's pricing rule for VAT rate and van multiplier
        if (i === 0) {
          firstDayPricing = dayPricing;
          vanMultiplier = dayPricing?.van_multiplier ?? standardPricing?.van_multiplier ?? 0;
        }

        // Track how many days each pricing rule covers
        const ruleId = dayPricing?.id || 'default';
        const existing = pricingRuleDayCounts.get(ruleId);
        if (existing) {
          existing.days += 1;
        } else {
          pricingRuleDayCounts.set(ruleId, { rule: dayPricing, days: 1 });
        }

        // Flat rate pricing: always use car rate per day
        const dailyRate = dayPricing?.price_per_day ?? standardPricing?.price_per_day ?? 0;
        carParkingCost += dailyRate;

        dailyCosts.push({
          name: dayPricing?.name || 'Standard Pricing',
          rate: dailyRate,
          ruleId: dayPricing?.id || 'default',
          date: new Date(currentDate),
          dayNumber: i + 1,
        });
      }

      // Apply van multiplier to total if vehicle is a van
      parkingCost = isVan ? Math.round(carParkingCost * vanMultiplier) : carParkingCost;

      // Find the dominant pricing rule (the one covering the most days)
      let dominantPricingRule = firstDayPricing;
      let maxDays = 0;

      pricingRuleDayCounts.forEach((value) => {
        if (value.days > maxDays) {
          maxDays = value.days;
          dominantPricingRule = value.rule;
        }
      });

      // Calculate weekly block package discount using dominant pricing rule
      if (dominantPricingRule && numberOfDays >= 7) {
        if (numberOfDays >= 28) {
          weeklyDiscountPercent = dominantPricingRule.weekly_discount_4wk ?? 0;
        } else if (numberOfDays >= 21) {
          weeklyDiscountPercent = dominantPricingRule.weekly_discount_3wk ?? 0;
        } else if (numberOfDays >= 14) {
          weeklyDiscountPercent = dominantPricingRule.weekly_discount_2wk ?? 0;
        } else if (numberOfDays >= 7) {
          weeklyDiscountPercent = dominantPricingRule.weekly_discount_1wk ?? 0;
        }
      }

      // Apply weekly discount to parking cost
      weeklyDiscountAmount = (parkingCost * weeklyDiscountPercent) / 100;
      parkingCost = parkingCost - weeklyDiscountAmount;

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
            date: format(day.date, 'dd-MMM'),
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
              date: format(day.date, 'dd-MMM'),
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

    // Use VAT rate from first day's pricing rule, fallback to settings, then default to 0.00
    const vatRate = (firstDayPricing?.vat_rate ?? settings?.vatRate) ?? 0.00;

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
      weeklyDiscountPercent,
      weeklyDiscountAmount,
    };
  }, [booking.dropOffDate, booking.returnDate, booking.selectedAddOns, booking.vehicleType, settings, addOns, promoDiscount, getPricingForDate]);
};
