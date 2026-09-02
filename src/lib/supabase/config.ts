/**
 * Supabase Environment and Client Configuration
 * Safely accesses client-side environment variables and provides configuration health checks.
 */

export const SUPABASE_CONFIG = {
  url: (import.meta.env.VITE_SUPABASE_URL as string) || '',
  anonKey: (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '',
};

/**
 * Checks if Supabase client credentials have been configured.
 */
export function isSupabaseConfigured(): boolean {
  return (
    Boolean(SUPABASE_CONFIG.url) &&
    Boolean(SUPABASE_CONFIG.anonKey) &&
    SUPABASE_CONFIG.url.startsWith('http') &&
    SUPABASE_CONFIG.anonKey.length > 20
  );
}
