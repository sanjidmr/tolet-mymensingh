import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/database';

/**
 * Creates a server-side Supabase client scoped to an authenticated user's access token.
 * This ensures that Row Level Security (RLS) is strictly enforced on the server
 * and operations do NOT bypass security rules.
 */
export function createServerUserClient(accessToken?: string): SupabaseClient<Database> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error('Supabase URL and Anon Key must be configured in environment variables.');
  }

  return createClient<Database>(supabaseUrl, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : {},
    },
  });
}

/**
 * Lazy singleton for administrative server-side operations.
 * CRITICAL: This MUST ONLY be called in server environments.
 */
let adminClient: SupabaseClient<Database> | null = null;

export function getServerAdminClient(): SupabaseClient<Database> {
  if (typeof window !== 'undefined') {
    throw new Error('Security Violation: Service role client must never be instantiated in the browser!');
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required for admin server client.');
  }

  if (!adminClient) {
    adminClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return adminClient;
}
