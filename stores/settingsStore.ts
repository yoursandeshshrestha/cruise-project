import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// =============================================================================
// Types
// =============================================================================

interface AddOn {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number; // in pence from DB, converted to pounds for display
  icon: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface PricingRule {
  id: string;
  name: string;
  base_car_price: number | null; // in pence
  base_van_price: number | null; // in pence
  additional_day_rate: number | null; // in pence
  additional_day_rate_van: number | null; // in pence
  vat_rate: number; // as decimal (e.g., 0.20 for 20%)
  start_date: string | null;
  end_date: string | null;
  priority: number;
  reason: string | null;
  is_active: boolean | null;
  display_order: number;
  created_at: string | null;
  updated_at: string | null;
}

interface CapacityOverride {
  id: string;
  date: string;
  capacity: number;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// Parsed settings for easy access
interface ParsedSettings {
  dailyRate: number;
  minimumStayCost: number;
  vatRate: number;
  defaultDailyCapacity: number;
  bufferSpaces: number;
  operatingHoursOpen: string;
  operatingHoursClose: string;
  terminals: string[];
}

interface SettingsState {
  // Data
  addOns: AddOn[];
  pricingRules: PricingRule[];
  capacityOverrides: CapacityOverride[];
  parsedSettings: ParsedSettings | null;

  // UI State
  loading: boolean;
  error: string | null;
  initialized: boolean;

  // Actions - Fetch settings (loads add-ons and pricing)
  fetchSettings: () => Promise<void>;
  getParsedSettings: () => ParsedSettings | null;

  // Actions - Add-ons
  fetchAddOns: () => Promise<void>;
  createAddOn: (data: Omit<AddOn, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateAddOn: (id: string, data: Partial<Omit<AddOn, 'id' | 'created_at' | 'updated_at'>>) => Promise<void>;
  deleteAddOn: (id: string) => Promise<void>;

  // Actions - Pricing Rules
  fetchPricingRules: () => Promise<void>;
  createPricingRule: (data: Omit<PricingRule, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updatePricingRule: (id: string, data: Partial<Omit<PricingRule, 'id' | 'created_at' | 'updated_at'>>) => Promise<void>;
  deletePricingRule: (id: string) => Promise<void>;

  // Actions - Capacity Overrides
  fetchCapacityOverrides: () => Promise<void>;
  createCapacityOverride: (data: Omit<CapacityOverride, 'id' | 'created_at' | 'updated_at' | 'current_bookings'>) => Promise<void>;
  updateCapacityOverride: (id: string, data: Partial<Omit<CapacityOverride, 'id' | 'created_at' | 'updated_at'>>) => Promise<void>;
  deleteCapacityOverride: (id: string) => Promise<void>;
}

// =============================================================================
// Store
// =============================================================================

export const useSettingsStore = create<SettingsState>((set, get) => ({
  // Initial State
  addOns: [],
  pricingRules: [],
  capacityOverrides: [],
  parsedSettings: null,
  loading: false,
  error: null,
  initialized: false,

  // Get parsed settings from pricing rules (active pricing rules)
  getParsedSettings: () => {
    const { pricingRules } = get();

    // Get today's date in local time (YYYY-MM-DD)
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const activePricing = pricingRules
      .filter(pr => {
        if (!pr.is_active) return false;
        // If no date range, rule is always active
        if (!pr.start_date || !pr.end_date) return true;
        // Otherwise check if today is within date range
        return pr.start_date <= today && pr.end_date >= today;
      })
      .sort((a, b) => b.display_order - a.display_order)[0];

    // Convert pence to pounds and get VAT rate
    const dailyRate = activePricing ? (activePricing.base_car_price ?? 0) / 100 : 12.50;
    const minimumStayCost = activePricing ? (activePricing.base_car_price ?? 0) / 100 : 45.00;
    const vatRate = activePricing ? (activePricing.vat_rate ?? 0.20) : 0.20; // Default to 20% if no pricing rule

    return {
      dailyRate,
      minimumStayCost,
      vatRate,
      defaultDailyCapacity: 100, // Default capacity
      bufferSpaces: 10, // Default buffer
      operatingHoursOpen: '06:00',
      operatingHoursClose: '22:00',
      terminals: [],
    };
  },

  // Fetch all settings (add-ons and pricing)
  fetchSettings: async () => {
    console.log('[SettingsStore] Fetching settings...');
    set({ loading: true, error: null });

    try {
      // Fetch pricing rules to get current rates
      await get().fetchPricingRules();

      const parsedSettings = get().getParsedSettings();
      set({
        parsedSettings,
        loading: false,
        initialized: true
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch settings';
      console.error('[SettingsStore] Error fetching settings:', errorMessage);
      set({ error: errorMessage, loading: false, initialized: true });
    }
  },

  // Fetch Add-ons
  fetchAddOns: async () => {
    console.log('[SettingsStore] Fetching add-ons...');
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('add_ons')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;

      // Convert prices from pence to pounds
      const addOnsInPounds = (data || []).map(addon => ({
        ...addon,
        price: addon.price / 100, // Convert pence to pounds
      }));

      console.log('[SettingsStore] Fetched add-ons:', addOnsInPounds.length);
      set({ addOns: addOnsInPounds, loading: false, initialized: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch add-ons';
      console.error('[SettingsStore] Error fetching add-ons:', errorMessage);
      set({ error: errorMessage, loading: false, initialized: true });
    }
  },

  // Create Add-on
  createAddOn: async (data) => {
    console.log('[SettingsStore] Creating add-on:', data.name);
    set({ error: null });

    try {
      // Convert price from pounds to pence for database
      const dataInPence = {
        ...data,
        price: Math.round(data.price * 100), // Convert pounds to pence
      };

      const { data: newAddOn, error } = await supabase
        .from('add_ons')
        .insert(dataInPence)
        .select()
        .single();

      if (error) {
        console.error('[SettingsStore] Create error:', error);
        throw error;
      }

      // Convert price back to pounds for state
      const newAddOnInPounds = {
        ...newAddOn,
        price: newAddOn.price / 100,
      };

      console.log('[SettingsStore] Created add-on:', newAddOnInPounds);
      set(state => ({
        addOns: [...state.addOns, newAddOnInPounds]
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create add-on';
      console.error('[SettingsStore] Error:', errorMessage);
      set({ error: errorMessage });
      throw error;
    }
  },

  // Update Add-on
  updateAddOn: async (id, data) => {
    console.log('[SettingsStore] Updating add-on:', id);
    set({ error: null });

    try {
      // Convert price from pounds to pence if price is being updated
      const dataToUpdate = { ...data };
      if (dataToUpdate.price !== undefined) {
        dataToUpdate.price = Math.round(dataToUpdate.price * 100);
      }

      const { data: updated, error } = await supabase
        .from('add_ons')
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[SettingsStore] Update error:', error);
        throw error;
      }

      // Convert price back to pounds for state
      const updatedInPounds = {
        ...updated,
        price: updated.price / 100,
      };

      console.log('[SettingsStore] Add-on updated:', updatedInPounds);
      set(state => ({
        addOns: state.addOns.map(a => a.id === id ? updatedInPounds : a)
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update add-on';
      console.error('[SettingsStore] Error:', errorMessage);
      set({ error: errorMessage });
      throw error;
    }
  },

  // Delete Add-on
  deleteAddOn: async (id) => {
    console.log('[SettingsStore] Deleting add-on:', id);
    set({ error: null });

    try {
      const { error } = await supabase
        .from('add_ons')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[SettingsStore] Delete error:', error);
        throw error;
      }

      console.log('[SettingsStore] Add-on deleted:', id);
      set(state => ({
        addOns: state.addOns.filter(a => a.id !== id)
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete add-on';
      console.error('[SettingsStore] Error:', errorMessage);
      set({ error: errorMessage });
      throw error;
    }
  },

  // Fetch Pricing Rules
  fetchPricingRules: async () => {
    console.log('[SettingsStore] Fetching pricing rules...');
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('pricing_rules')
        .select('*')
        .order('display_order', { ascending: false });

      if (error) throw error;

      console.log('[SettingsStore] Fetched pricing rules:', data?.length || 0);
      set({ pricingRules: data || [], loading: false });

      // Recalculate parsed settings after state is updated
      const parsedSettings = get().getParsedSettings();
      set({ parsedSettings });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch pricing rules';
      console.error('[SettingsStore] Error fetching pricing rules:', errorMessage);
      set({ error: errorMessage, loading: false });
    }
  },

  // Create Pricing Rule
  createPricingRule: async (data) => {
    console.log('[SettingsStore] Creating pricing rule...');
    set({ loading: true, error: null });

    try {
      const { data: newRule, error } = await supabase
        .from('pricing_rules')
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      console.log('[SettingsStore] Pricing rule created:', newRule);
      set(state => ({
        pricingRules: [...state.pricingRules, newRule],
        loading: false
      }));

      // Recalculate parsed settings after state is updated
      const parsedSettings = get().getParsedSettings();
      set({ parsedSettings });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create pricing rule';
      console.error('[SettingsStore] Error creating pricing rule:', errorMessage);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Update Pricing Rule
  updatePricingRule: async (id, data) => {
    console.log('[SettingsStore] Updating pricing rule:', id);
    set({ loading: true, error: null });

    try {
      const { error } = await supabase
        .from('pricing_rules')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      console.log('[SettingsStore] Pricing rule updated');
      set(state => ({
        pricingRules: state.pricingRules.map(pr =>
          pr.id === id ? { ...pr, ...data } : pr
        ),
        loading: false
      }));

      // Recalculate parsed settings after state is updated
      const parsedSettings = get().getParsedSettings();
      set({ parsedSettings });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update pricing rule';
      console.error('[SettingsStore] Error updating pricing rule:', errorMessage);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Delete Pricing Rule
  deletePricingRule: async (id) => {
    console.log('[SettingsStore] Deleting pricing rule:', id);
    set({ loading: true, error: null });

    try {
      const { error } = await supabase
        .from('pricing_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('[SettingsStore] Pricing rule deleted');
      set(state => ({
        pricingRules: state.pricingRules.filter(pr => pr.id !== id),
        loading: false
      }));

      // Recalculate parsed settings after state is updated
      const parsedSettings = get().getParsedSettings();
      set({ parsedSettings });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete pricing rule';
      console.error('[SettingsStore] Error deleting pricing rule:', errorMessage);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Fetch Capacity Overrides
  fetchCapacityOverrides: async () => {
    console.log('[SettingsStore] Fetching capacity overrides...');
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('daily_capacities')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;

      console.log('[SettingsStore] Fetched capacity overrides:', data?.length || 0);
      set({ capacityOverrides: data || [], loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch capacity overrides';
      console.error('[SettingsStore] Error fetching capacity overrides:', errorMessage);
      set({ error: errorMessage, loading: false });
    }
  },

  // Create Capacity Override
  createCapacityOverride: async (data) => {
    console.log('[SettingsStore] Creating capacity override...');
    set({ loading: true, error: null });

    try {
      const { data: newOverride, error } = await supabase
        .from('daily_capacities')
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      console.log('[SettingsStore] Capacity override created:', newOverride);
      set(state => ({
        capacityOverrides: [...state.capacityOverrides, newOverride],
        loading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create capacity override';
      console.error('[SettingsStore] Error creating capacity override:', errorMessage);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Update Capacity Override
  updateCapacityOverride: async (id, data) => {
    console.log('[SettingsStore] Updating capacity override:', id);
    set({ loading: true, error: null });

    try {
      const { error } = await supabase
        .from('daily_capacities')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      console.log('[SettingsStore] Capacity override updated');
      set(state => ({
        capacityOverrides: state.capacityOverrides.map(co =>
          co.id === id ? { ...co, ...data } : co
        ),
        loading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update capacity override';
      console.error('[SettingsStore] Error updating capacity override:', errorMessage);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Delete Capacity Override
  deleteCapacityOverride: async (id) => {
    console.log('[SettingsStore] Deleting capacity override:', id);
    set({ loading: true, error: null });

    try {
      const { error } = await supabase
        .from('daily_capacities')
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('[SettingsStore] Capacity override deleted');
      set(state => ({
        capacityOverrides: state.capacityOverrides.filter(co => co.id !== id),
        loading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete capacity override';
      console.error('[SettingsStore] Error deleting capacity override:', errorMessage);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },
}));
