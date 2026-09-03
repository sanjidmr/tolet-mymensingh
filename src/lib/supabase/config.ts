/**
 * Supabase Environment and Client Configuration
 * Safely accesses environment variables and provides configuration health checks.
 * Supports both VITE_ (legacy) and NEXT_PUBLIC_ (Next.js) prefixes.
 */

function getEnv(key: string): string {
  const val = (process.env[key] as string) || '';
  return val;
}

export const SUPABASE_CONFIG = {
  url: getEnv('NEXT_PUBLIC_SUPABASE_URL') || getEnv('VITE_SUPABASE_URL') || '',
  anonKey:
    getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || getEnv('VITE_SUPABASE_ANON_KEY') || '',
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
