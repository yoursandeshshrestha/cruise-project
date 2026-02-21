import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AdminUser, getAdminUser } from '../lib/auth';

interface AdminAuthContextType {
  user: User | null;
  adminUser: AdminUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        getAdminUser(session.user.email).then(setAdminUser);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        const admin = await getAdminUser(session.user.email);
        setAdminUser(admin);
      } else {
        setAdminUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('[AdminAuth] signIn called with email:', email);
    setLoading(true);
    try {
      console.log('[AdminAuth] Calling supabase.auth.signInWithPassword...');
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('[AdminAuth] Auth error:', error);
        throw error;
      }

      console.log('[AdminAuth] Auth successful, user:', data.user?.email);

      if (data.user?.email) {
        // After successful auth, user is authenticated, so RLS should allow access
        console.log('[AdminAuth] Fetching admin user record...');
        const admin = await getAdminUser(data.user.email);
        console.log('[AdminAuth] Admin user record:', admin);

        if (!admin) {
          // If still can't find admin, sign out and throw error
          console.error('[AdminAuth] No admin record found');
          await supabase.auth.signOut();
          throw new Error('User is not authorized as admin');
        }
        if (!admin.is_active) {
          console.error('[AdminAuth] Admin account is inactive');
          await supabase.auth.signOut();
          throw new Error('Admin account is inactive');
        }

        // Update last login
        console.log('[AdminAuth] Updating last login...');
        await supabase
          .from('admin_users')
          .update({ last_login: new Date().toISOString() })
          .eq('email', data.user.email);

        console.log('[AdminAuth] Setting admin user and user state...');
        setAdminUser(admin);
        setUser(data.user);
        console.log('[AdminAuth] Sign in complete!');
      }
    } catch (error) {
      console.error('[AdminAuth] Sign in error:', error);
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setAdminUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminAuthContext.Provider value={{ user, adminUser, loading, signIn, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};
