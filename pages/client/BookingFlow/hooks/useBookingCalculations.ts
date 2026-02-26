import { useMemo } from 'react';
import { BookingState } from '../../../../types';

interface Settings {
  dailyRate: number;
  minimumStayCost: number;
  vatRate: number;
}

interface AddOn {
  slug: string;
  price: number;
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
}

export const useBookingCalculations = (
  booking: BookingState,
  settings: Settings | null,
  addOns: AddOn[],
  promoDiscount: number
): CalculationResult => {
  return useMemo(() => {
    const dailyRate = settings?.dailyRate || 12.50;
    const minStayCost = settings?.minimumStayCost || 45.00;
    const vatRate = settings?.vatRate || 0.20;

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

    // Calculate add-ons cost
    const addOnsCost = booking.selectedAddOns.reduce((acc, slug) => {
      const addon = addOns.find(a => a.slug === slug);
      return acc + (addon ? addon.price : 0);
    }, 0);

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
    };
  }, [booking.dropOffDate, booking.returnDate, booking.selectedAddOns, settings, addOns, promoDiscount]);
};
