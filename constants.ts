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
 * @deprecated These constants are no longer used.
 */
export const DAILY_RATE = 26;
export const MIN_STAY_COST = 26;

export const VAN_SURCHARGE_MULTIPLIER = 1.4;

export const PRICING_TIERS: { maxDays: number; label: string; price: number }[] = [
  { maxDays: 1,  label: '1 Day',    price: 26  },
  { maxDays: 2,  label: '2 Days',   price: 39  },
  { maxDays: 3,  label: '3 Days',   price: 52  },
  { maxDays: 4,  label: '4 Days',   price: 65  },
  { maxDays: 5,  label: '5 Days',   price: 78  },
  { maxDays: 6,  label: '6 Days',   price: 91  },
  { maxDays: 7,  label: '1 Week',   price: 95  },
  { maxDays: 14, label: '2 Weeks',  price: 160 },
  { maxDays: 21, label: '3 Weeks',  price: 220 },
  { maxDays: 28, label: '4 Weeks',  price: 310 },
];

export function calculateParkingPrice(days: number, vehicleType: VehicleType = 'car'): number {
  if (days <= 0) return 0;

  let basePrice: number;

  const tier = PRICING_TIERS.find(t => days <= t.maxDays);
  if (tier) {
    basePrice = tier.price;
  } else {
    const extraWeeks = Math.ceil((days - 28) / 7);
    basePrice = 310 + extraWeeks * 90;
  }

  return vehicleType === 'van'
    ? Math.round(basePrice * VAN_SURCHARGE_MULTIPLIER * 100) / 100
    : basePrice;
}

export function getPricingTierLabel(days: number): string {
  const tier = PRICING_TIERS.find(t => days <= t.maxDays);
  if (tier) return tier.label;
  const weeks = Math.ceil(days / 7);
  return `${weeks} Weeks`;
}
