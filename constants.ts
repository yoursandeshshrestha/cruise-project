import { AddOn, CruiseLine, VehicleType } from './types';

// Design Tokens
export const COLORS = {
  primary: '#00A9FE',
  primaryDark: '#0095E5',
  darkBlue: '#001848',
  neutralLight: '#F4F4F4',
  white: '#FFFFFF',
  textDark: '#001848',
  success: '#16A34A',
  error: '#DC2626',
};

// Mock Data
/**
 * @deprecated This constant is no longer used. Cruise lines are now managed dynamically
 * through the database and accessed via the useCruiseLinesStore hook.
 * This can be safely removed in a future update.
 */
export const CRUISE_LINES: CruiseLine[] = [
  { id: '1', name: 'P&O Cruises', ships: ['Iona', 'Arvia', 'Britannia', 'Ventura', 'Arcadia', 'Aurora'] },
  { id: '2', name: 'Cunard', ships: ['Queen Mary 2', 'Queen Victoria', 'Queen Anne'] },
  { id: '3', name: 'Royal Caribbean', ships: ['Anthem of the Seas', 'Independence of the Seas'] },
  { id: '4', name: 'MSC Cruises', ships: ['MSC Virtuosa', 'MSC Preziosa'] },
  { id: '5', name: 'Princess Cruises', ships: ['Sky Princess', 'Regal Princess'] },
  { id: '6', name: 'Celebrity Cruises', ships: ['Celebrity Apex', 'Celebrity Silhouette'] },
];

export const ADD_ONS: AddOn[] = [
  {
    id: 'ev-charge',
    name: 'EV Charging',
    description: 'Fully charged ready for your journey home.',
    price: 35.00,
    icon: 'Zap'
  },
  {
    id: 'wash-ext',
    name: 'Exterior Wash',
    description: 'Hand wash and chamois dry.',
    price: 15.00,
    icon: 'Droplets'
  },
  {
    id: 'wash-full',
    name: 'Full Valet',
    description: 'Interior vacuum and exterior wash.',
    price: 45.00,
    icon: 'Sparkles'
  },
];

export const TERMINALS = [
  'Ocean Terminal',
  'Mayflower Terminal',
  'City Cruise Terminal',
  'QEII Terminal',
  'Horizon Cruise Terminal'
];

/**
 * @deprecated Use pricing rules from the database via usePricingStore instead
 */
export const FIRST_DAY_RATE = 26;
/**
 * @deprecated Use pricing rules from the database via usePricingStore instead
 */
export const ADDITIONAL_DAY_RATE = 13;

/**
 * Calculate parking price using flat daily rate
 * @deprecated This function is deprecated. Use getPricingForDate from usePricingStore for day-by-day pricing calculations with database values
 */
export function calculateParkingPrice(
  days: number,
  vehicleType: VehicleType = 'car',
  pricePerDay: number = 0,
  vanMultiplier: number = 0
): number {
  if (days <= 0) return 0;

  // Flat rate pricing: price per day for cars, or car price × multiplier (rounded) for vans
  const carTotal = pricePerDay * days;
  const dailyTotal = vehicleType === 'van'
    ? Math.round(carTotal * vanMultiplier)
    : carTotal;

  return dailyTotal;
}

export function getParkingDaysLabel(days: number): string {
  if (days === 1) return '1 Day';
  return `${days} Days`;
}
