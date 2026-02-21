import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Terminal {
  id: string;
  name: string;
  location: string | null;
  description: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface TerminalsState {
  terminals: Terminal[];
  loading: boolean;
  error: string | null;
  initialized: boolean;

  // Actions
  fetchTerminals: () => Promise<void>;
  fetchActiveTerminals: () => Promise<void>;
  createTerminal: (data: { name: string; location?: string; description?: string }) => Promise<void>;
  updateTerminal: (id: string, data: Partial<{ name: string; location: string; description: string; is_active: boolean; display_order: number }>) => Promise<void>;
  deleteTerminal: (id: string) => Promise<void>;
  toggleTerminalStatus: (id: string, currentStatus: boolean) => Promise<void>;
}

export const useTerminalsStore = create<TerminalsState>((set, get) => ({
  terminals: [],
  loading: false,
  error: null,
  initialized: false,

  // Fetch all terminals (admin)
  fetchTerminals: async () => {
    console.log('[TerminalsStore] Fetching all terminals...');
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('terminals')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;

      console.log('[TerminalsStore] Fetched terminals:', data?.length || 0);
      set({ terminals: data || [], loading: false, initialized: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch terminals';
      console.error('[TerminalsStore] Error fetching terminals:', errorMessage);
      set({ error: errorMessage, loading: false, initialized: true });
    }
  },

  // Fetch only active terminals (public)
  fetchActiveTerminals: async () => {
    console.log('[TerminalsStore] Fetching active terminals...');
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('terminals')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      console.log('[TerminalsStore] Fetched active terminals:', data?.length || 0);
      set({ terminals: data || [], loading: false, initialized: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch active terminals';
      console.error('[TerminalsStore] Error fetching active terminals:', errorMessage);
      set({ error: errorMessage, loading: false, initialized: true });
    }
  },

  // Create terminal
  createTerminal: async (data) => {
    console.log('[TerminalsStore] Creating terminal:', data.name);
    set({ error: null });

    try {
      // Get the max display_order
      const { data: maxOrderData } = await supabase
        .from('terminals')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .single();

      const nextOrder = (maxOrderData?.display_order || 0) + 1;

      const { data: newTerminal, error } = await supabase
        .from('terminals')
        .insert({
          ...data,
          is_active: true,
          display_order: nextOrder,
        })
        .select()
        .single();

      if (error) {
        console.error('[TerminalsStore] Create error:', error);
        throw error;
      }

      console.log('[TerminalsStore] Created terminal:', newTerminal);
      set(state => ({
        terminals: [...state.terminals, newTerminal]
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create terminal';
      console.error('[TerminalsStore] Error:', errorMessage);
      set({ error: errorMessage });
      throw error;
    }
  },

  // Update terminal
  updateTerminal: async (id, data) => {
    console.log('[TerminalsStore] Updating terminal:', id);
    set({ error: null });

    try {
      const updateData = {
        ...data,
      };

      const { data: updated, error } = await supabase
        .from('terminals')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[TerminalsStore] Update error:', error);
        throw error;
      }

      console.log('[TerminalsStore] Updated terminal:', updated);
      set(state => ({
        terminals: state.terminals.map(t =>
          t.id === id ? updated : t
        )
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update terminal';
      console.error('[TerminalsStore] Error:', errorMessage);
      set({ error: errorMessage });
      throw error;
    }
  },

  // Delete terminal
  deleteTerminal: async (id) => {
    console.log('[TerminalsStore] Deleting terminal:', id);
    set({ error: null });

    try {
      const { error } = await supabase
        .from('terminals')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[TerminalsStore] Delete error:', error);
        throw error;
      }

      console.log('[TerminalsStore] Deleted terminal:', id);
      set(state => ({
        terminals: state.terminals.filter(t => t.id !== id)
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete terminal';
      console.error('[TerminalsStore] Error:', errorMessage);
      set({ error: errorMessage });
      throw error;
    }
  },

  // Toggle terminal status
  toggleTerminalStatus: async (id, currentStatus) => {
    console.log('[TerminalsStore] Toggling terminal status:', id);
    set({ error: null });

    try {
      const { data: updated, error } = await supabase
        .from('terminals')
        .update({ is_active: !currentStatus })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[TerminalsStore] Toggle error:', error);
        throw error;
      }

      console.log('[TerminalsStore] Toggled terminal status:', updated);
      set(state => ({
        terminals: state.terminals.map(t =>
          t.id === id ? updated : t
        )
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle terminal status';
      console.error('[TerminalsStore] Error:', errorMessage);
      set({ error: errorMessage });
      throw error;
    }
  },
}));
