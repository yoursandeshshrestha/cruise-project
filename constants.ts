import { AddOn, CruiseLine } from './types';

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
 * @deprecated These constants are no longer used. Pricing is now managed dynamically
 * through the database and accessed via the usePricingStore hook.
 * These can be safely removed in a future update.
 */
export const DAILY_RATE = 12.50;
export const MIN_STAY_COST = 45.00;
