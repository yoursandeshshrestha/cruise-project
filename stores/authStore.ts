import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  is_active: boolean;
  last_login: string | null;
}

interface AuthState {
  user: User | null;
  adminUser: AdminUser | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      adminUser: null,
      loading: false,
      initialized: false,

      initialize: async () => {
        console.log('[AuthStore] Initializing...');

        try {
          const { data: { session } } = await supabase.auth.getSession();

          if (session?.user) {
            console.log('[AuthStore] Found existing session for:', session.user.email);

            // Session is already set by Supabase, no need to call setSession again
            // Fetch admin user
            const { data: adminData } = await supabase
              .from('admin_users')
              .select('*')
              .eq('email', session.user.email!)
              .maybeSingle();

            if (adminData) {
              console.log('[AuthStore] Loaded admin user:', adminData.email);
              set({
                user: session.user,
                adminUser: adminData as AdminUser,
                initialized: true
              });
              return;
            }
          }

          console.log('[AuthStore] No existing session or admin user');
          set({ initialized: true });
        } catch (error) {
          console.error('[AuthStore] Initialize error:', error);
          set({ initialized: true });
        }
      },

      signIn: async (email: string, password: string) => {
        console.log('[AuthStore] Signing in:', email);
        set({ loading: true });

        try {
          // 1. Authenticate with Supabase
          console.log('[AuthStore] Step 1: Authenticating with Supabase...');
          console.log('[AuthStore] About to call signInWithPassword');

          const authPromise = supabase.auth.signInWithPassword({
            email,
            password
          });

          console.log('[AuthStore] signInWithPassword called, waiting for response...');

          const { data: authData, error: authError } = await authPromise;

          console.log('[AuthStore] signInWithPassword completed');

          if (authError) {
            console.error('[AuthStore] Auth error:', authError);
            throw authError;
          }

          console.log('[AuthStore] Auth successful, user:', authData.user?.email);
          console.log('[AuthStore] Auth data:', authData);

          // 2. Fetch admin user record
          console.log('[AuthStore] Step 2: Fetching admin user record...');

          // Verify session is available
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          console.log('[AuthStore] Current session before query:', currentSession ? 'exists' : 'null');
          console.log('[AuthStore] Session access_token:', currentSession?.access_token?.substring(0, 50) + '...');

          // Add timeout to prevent hanging
          const adminQueryPromise = supabase
            .from('admin_users')
            .select('*')
            .eq('email', email)
            .maybeSingle();

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Admin user query timeout')), 10000)
          );

          const { data: adminData, error: adminError } = await Promise.race([
            adminQueryPromise,
            timeoutPromise
          ]) as any;

          console.log('[AuthStore] Admin query result:', { adminData, adminError });

          if (adminError) {
            console.error('[AuthStore] Error fetching admin:', adminError);
            await supabase.auth.signOut();
            throw new Error('Failed to fetch admin user: ' + adminError.message);
          }

          if (!adminData) {
            console.error('[AuthStore] No admin record found for email:', email);
            await supabase.auth.signOut();
            throw new Error('User is not authorized as admin. Please contact support.');
          }

          if (!adminData.is_active) {
            console.error('[AuthStore] Admin account inactive');
            await supabase.auth.signOut();
            throw new Error('Admin account is inactive');
          }

          console.log('[AuthStore] Admin user found:', adminData.email, 'role:', adminData.role);

          // 3. Update last login
          console.log('[AuthStore] Step 3: Updating last login...');
          const { error: updateError } = await supabase
            .from('admin_users')
            .update({ last_login: new Date().toISOString() })
            .eq('email', email);

          if (updateError) {
            console.warn('[AuthStore] Failed to update last login:', updateError);
            // Don't fail login if we can't update last_login
          }

          // 4. Set state
          console.log('[AuthStore] Step 4: Setting state...');
          const newState = {
            user: authData.user,
            adminUser: adminData as AdminUser,
            loading: false
          };
          console.log('[AuthStore] New state:', newState);
          set(newState);

          console.log('[AuthStore] ✓ Login complete!');

        } catch (error) {
          console.error('[AuthStore] Login failed:', error);
          set({ loading: false, user: null, adminUser: null });
          throw error;
        }
      },

      signOut: async () => {
        console.log('[AuthStore] Signing out');
        set({ loading: true });

        await supabase.auth.signOut();

        set({
          user: null,
          adminUser: null,
          loading: false
        });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        adminUser: state.adminUser
      })
    }
  )
);
