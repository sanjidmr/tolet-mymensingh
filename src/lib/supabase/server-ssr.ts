"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "../../types/database";
import { SUPABASE_CONFIG } from "./config";

/**
 * Creates a Supabase server client for Next.js App Router, scoped to the
 * authenticated user's session stored in cookies. RLS is enforced.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component, safe to ignore when middleware handles refreshing.
        }
      },
    },
  });
}
