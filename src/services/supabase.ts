import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';

// Configuration keys for environment and local storage
const STORAGE_URL_KEY = 'supabase_url';
const STORAGE_ANON_KEY = 'supabase_anon_key';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

/**
 * Retrieves the current Supabase configuration, looking first in Vite environment variables,
 * then falling back to user-provided localStorage values.
 */
export const getSupabaseConfig = (): SupabaseConfig => {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  let localUrl = '';
  let localKey = '';
  try {
    localUrl = localStorage.getItem(STORAGE_URL_KEY) || '';
    localKey = localStorage.getItem(STORAGE_ANON_KEY) || '';
  } catch {
    // Ignore localStorage errors
  }

  const url = (envUrl || localUrl).trim();
  const anonKey = (envKey || localKey).trim();

  const isConfigured = Boolean(
    url &&
    anonKey &&
    url.startsWith('https://') &&
    url.includes('.supabase.co') &&
    anonKey.length > 20
  );

  return { url, anonKey, isConfigured };
};

/**
 * Saves user-provided Supabase configuration into localStorage and resets the active client.
 */
export const setSupabaseConfig = (url: string, anonKey: string): void => {
  try {
    localStorage.setItem(STORAGE_URL_KEY, url.trim());
    localStorage.setItem(STORAGE_ANON_KEY, anonKey.trim());
    supabaseClientInstance = null; // Invalidate cached client to recreate with new credentials
  } catch (err) {
    console.error('Failed to save Supabase config to localStorage:', err);
  }
};

/**
 * Clears custom saved Supabase configuration from localStorage.
 */
export const clearSupabaseConfig = (): void => {
  try {
    localStorage.removeItem(STORAGE_URL_KEY);
    localStorage.removeItem(STORAGE_ANON_KEY);
    supabaseClientInstance = null;
  } catch (err) {
    console.error('Failed to clear Supabase config:', err);
  }
};

let supabaseClientInstance: SupabaseClient | null = null;

/**
 * Obtains the initialized Supabase client singleton, or null if keys are not yet provided.
 */
export const getSupabase = (): SupabaseClient | null => {
  if (supabaseClientInstance) {
    return supabaseClientInstance;
  }

  const config = getSupabaseConfig();
  if (!config.isConfigured) {
    return null;
  }

  try {
    supabaseClientInstance = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'sme_sentinel_supabase_auth_token',
      },
    });
    return supabaseClientInstance;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }
};

/**
 * Helper: Sign in with email and password
 */
export const supabaseSignIn = async (email: string, password: string) => {
  const client = getSupabase();
  if (!client) {
    throw new Error('Supabase client is not configured with project URL and Anon Key.');
  }

  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Helper: Sign up with email, password, and profile metadata
 */
export const supabaseSignUp = async (
  email: string,
  password: string,
  metadata?: {
    name?: string;
    role?: string;
    organization?: string;
    phone?: string;
  }
) => {
  const client = getSupabase();
  if (!client) {
    throw new Error('Supabase client is not configured with project URL and Anon Key.');
  }

  const { data, error } = await client.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        full_name: metadata?.name || '',
        name: metadata?.name || '',
        role: metadata?.role || 'Financial Director / Partner',
        organization: metadata?.organization || 'Enterprise Advisory Group',
        phone: metadata?.phone || '',
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Helper: Sign out current session
 */
export const supabaseSignOut = async () => {
  const client = getSupabase();
  if (!client) return;

  try {
    await client.auth.signOut();
  } catch (err) {
    console.warn('Supabase sign out error:', err);
  }
};

/**
 * Helper: Get active Supabase session
 */
export const supabaseGetSession = async (): Promise<Session | null> => {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data } = await client.auth.getSession();
    return data.session;
  } catch (err) {
    console.warn('Supabase getSession error:', err);
    return null;
  }
};

/**
 * Helper: Subscribe to auth state changes
 */
export const supabaseOnAuthStateChange = (
  callback: (event: string, session: Session | null) => void
) => {
  const client = getSupabase();
  if (!client) return { unsubscribe: () => {} };

  const { data } = client.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });

  return {
    unsubscribe: () => {
      data.subscription.unsubscribe();
    },
  };
};

export type { Session, User };
