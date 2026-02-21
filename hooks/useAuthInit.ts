import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

/**
 * Global auth initialization hook
 * Sets up Supabase auth state listener and ensures session is always synced
 */
export function useAuthInit() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    console.log('[useAuthInit] Setting up auth state listener');

    // Initialize auth store
    initialize();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[useAuthInit] Auth state changed:', event, session ? 'session exists' : 'no session');

      // Don't interfere with session during SIGNED_IN - let the signIn function handle it
      // Only handle TOKEN_REFRESHED to ensure we always have a fresh token
      if (event === 'TOKEN_REFRESHED') {
        if (session) {
          console.log('[useAuthInit] Token refreshed, updating session');
          // Session is already updated by Supabase, no need to call setSession again
        }
      }

      if (event === 'SIGNED_OUT') {
        console.log('[useAuthInit] User signed out');
      }
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('[useAuthInit] Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, [initialize]);
}
