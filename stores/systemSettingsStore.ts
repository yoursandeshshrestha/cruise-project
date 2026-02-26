import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface SystemSettingsGroup {
  id: string;
  group_name: string;
  settings: Record<string, any>;
  updated_at: string;
  created_at: string;
}

interface SystemSettingsState {
  settingsGroups: SystemSettingsGroup[];
  settingsCache: Map<string, any>;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  version: number; // Increment this when settings are fetched

  // Actions
  fetchSettings: () => Promise<void>;
  getSetting: <T = any>(group: string, key: string, defaultValue?: T) => T | undefined;
  updateGroup: (group: string, settings: Record<string, any>) => Promise<void>;

  // Convenience getters for common settings
  getCompanyInfo: () => { name: string; email: string; phone: string; address: string };
  isBookingEnabled: () => boolean;
  isMaintenanceMode: () => boolean;
  isPromoCodeEnabled: () => boolean;
  getCancellationPolicy: () => { show: boolean; text: string };
}

export const useSystemSettingsStore = create<SystemSettingsState>((set, get) => ({
  settingsGroups: [],
  settingsCache: new Map(),
  loading: false,
  error: null,
  initialized: false,
  version: 0,

  fetchSettings: async () => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('group_name', { ascending: true });

      if (error) throw error;

      // Build cache - flatten all groups into a single cache
      const cache = new Map();
      data?.forEach((group) => {
        Object.entries(group.settings).forEach(([key, value]) => {
          const cacheKey = `${group.group_name}.${key}`;
          cache.set(cacheKey, value);
        });
      });

      const currentVersion = get().version;
      const newVersion = currentVersion + 1;

      set({
        settingsGroups: data || [],
        settingsCache: cache,
        loading: false,
        initialized: true,
        version: newVersion,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch settings';
      console.error('[SystemSettingsStore] Error fetching settings:', errorMessage);
      set({ error: errorMessage, loading: false, initialized: true });
    }
  },

  getSetting: <T = any>(group: string, key: string, defaultValue?: T): T | undefined => {
    const cache = get().settingsCache;
    const cacheKey = `${group}.${key}`;
    const hasKey = cache.has(cacheKey);
    const value = hasKey ? cache.get(cacheKey) : defaultValue;
    return value as T;
  },

  updateGroup: async (groupName: string, settings: Record<string, any>) => {
    set({ error: null });

    try {
      // Check auth session before making the request
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Not authenticated. Please login again.');
      }

      // Session is already maintained by Supabase, no need to call setSession
      // Use upsert to insert if not exists, update if exists
      const { data: updated, error } = await supabase
        .from('system_settings')
        .upsert(
          { group_name: groupName, settings },
          { onConflict: 'group_name' }
        )
        .select()
        .single();

      if (error) throw error;

      // Update local state
      set(state => {
        const newCache = new Map(state.settingsCache);

        // Update cache for this group
        Object.entries(settings).forEach(([key, value]) => {
          newCache.set(`${groupName}.${key}`, value);
        });

        // Check if this group already exists in our state
        const existingGroup = state.settingsGroups.find(g => g.group_name === groupName);

        return {
          settingsGroups: existingGroup
            ? state.settingsGroups.map(g => g.group_name === groupName ? updated : g)
            : [...state.settingsGroups, updated],
          settingsCache: newCache,
        };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update settings';
      console.error('[SystemSettingsStore] Error updating settings:', errorMessage);
      set({ error: errorMessage });
      throw error;
    }
  },

  // Convenience getters
  getCompanyInfo: () => ({
    name: get().getSetting<string>('business', 'company_name', 'Simple Cruise Parking'),
    email: get().getSetting<string>('business', 'company_email', 'info@simplecruiseparking.com'),
    phone: get().getSetting<string>('business', 'company_phone', '+44 (0) 23 8000 0000'),
    address: get().getSetting<string>('business', 'company_address', 'Southampton, UK'),
  }),

  isBookingEnabled: () => {
    return get().getSetting<boolean>('features', 'booking_enabled', true);
  },

  isMaintenanceMode: () => {
    return get().getSetting<boolean>('features', 'maintenance_mode', false);
  },

  isPromoCodeEnabled: () => {
    return get().getSetting<boolean>('features', 'promo_codes_enabled', true);
  },

  getCancellationPolicy: () => {
    return {
      show: get().getSetting<boolean>('features', 'show_cancellation_policy', true) ?? true,
      text: get().getSetting<string>('features', 'cancellation_policy_text', 'Free cancellation up to 48 hours before arrival.') || 'Free cancellation up to 48 hours before arrival.',
    };
  },
}));
