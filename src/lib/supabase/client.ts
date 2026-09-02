import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/database';
import { SUPABASE_CONFIG, isSupabaseConfigured } from './config';

let browserClient: SupabaseClient<Database> | null = null;

/**
 * Creates or retrieves the singleton Supabase browser client.
 * Strictly uses public anon key and adheres to Row Level Security (RLS).
 */
export function getSupabaseBrowserClient(): SupabaseClient<Database> | null {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!browserClient) {
    browserClient = createClient<Database>(
      SUPABASE_CONFIG.url,
      SUPABASE_CONFIG.anonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
    );
  }

  return browserClient;
}

/**
 * Default exported client instance for browser usage.
 */
export const supabase = getSupabaseBrowserClient();
