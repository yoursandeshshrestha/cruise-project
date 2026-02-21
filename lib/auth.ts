import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  adminUser: AdminUser | null;
  loading: boolean;
}

// Sign in admin user
export const signInAdmin = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // Fetch admin user metadata
  if (data.user) {
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();

    if (adminError) throw new Error('User is not authorized as admin');
    if (!adminData.is_active) throw new Error('Admin account is inactive');

    // Update last login
    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('email', email);

    return { user: data.user, adminUser: adminData as AdminUser };
  }

  throw new Error('Failed to sign in');
};

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Get current session
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

// Get admin user by email
export const getAdminUser = async (email: string): Promise<AdminUser | null> => {
  console.log('[getAdminUser] Fetching admin for email:', email);

  // Add timeout to detect hanging queries
  const timeoutPromise = new Promise<null>((resolve) => {
    setTimeout(() => {
      console.error('[getAdminUser] TIMEOUT after 5 seconds!');
      resolve(null);
    }, 5000);
  });

  const queryPromise = supabase
    .from('admin_users')
    .select('*')
    .eq('email', email)
    .single()
    .then(({ data, error }) => {
      if (error) {
        console.error('[getAdminUser] Error fetching admin:', error);
        return null;
      }
      console.log('[getAdminUser] Admin data:', data);
      return data as AdminUser;
    });

  return Promise.race([queryPromise, timeoutPromise]);
};

// Check if user is admin
export const isAdmin = async (email: string): Promise<boolean> => {
  const adminUser = await getAdminUser(email);
  return adminUser !== null && adminUser.is_active;
};
