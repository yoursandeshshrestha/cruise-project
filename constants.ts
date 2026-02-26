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

export const FIRST_DAY_RATE = 26;
export const ADDITIONAL_DAY_RATE = 13;
export const VAN_SURCHARGE_MULTIPLIER = 1.4;

export function calculateParkingPrice(
  days: number,
  vehicleType: VehicleType = 'car',
  additionalDayRate: number = ADDITIONAL_DAY_RATE,
  vanAdditionalDayRate: number = 18.00,
  baseCarPrice: number = FIRST_DAY_RATE,
  baseVanPrice: number = 36.00
): number {
  if (days <= 0) return 0;

  // Linear pricing: Base price + (days - 1) × additional day rate
  if (vehicleType === 'van') {
    // Van: base van price + (days - 1) × van additional day rate
    return baseVanPrice + ((days - 1) * vanAdditionalDayRate);
  } else {
    // Car: base car price + (days - 1) × car additional day rate
    return baseCarPrice + ((days - 1) * additionalDayRate);
  }
}

export function getParkingDaysLabel(days: number): string {
  if (days === 1) return '1 Day';
  return `${days} Days`;
}
