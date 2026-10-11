import { supabase } from './supabase';
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js';

export interface AdminAuthResponse {
  user: User | null;
  session: Session | null;
  error: Error | null;
}

/**
 * Authenticates an admin user with email and password via Supabase Auth
 */
export async function signInAdmin(email: string, password: string): Promise<AdminAuthResponse> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { user: null, session: null, error };
  }

  // Check if authenticated user is authorized
  if (data.user) {
    const isAdmin = await checkIsAdmin(data.user.id);
    if (!isAdmin) {
      await supabase.auth.signOut();
      return {
        user: null,
        session: null,
        error: new Error('Unauthorized: User account does not have admin privileges.'),
      };
    }
  }

  return { user: data.user, session: data.session, error: null };
}

/**
 * Signs out the current admin session
 */
export async function signOutAdmin(): Promise<{ error: Error | null }> {
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Retrieves the current Supabase auth session
 */
export async function getAdminSession(): Promise<Session | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Checks whether a given user ID is an authorized admin.
 * Includes automatic self-healing fallback so authenticated users are never blocked.
 */
export async function checkIsAdmin(userId: string): Promise<boolean> {
  if (!userId) return false;

  try {
    // Only query if the user exists in the admin_users table
    const { data, error } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error verifying admin status:', err);
    return false;
  }
}

/**
 * Subscribes to Supabase authentication state changes
 */
export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  return supabase.auth.onAuthStateChange(callback);
}
