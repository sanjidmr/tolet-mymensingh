"use client";

import { createBrowserClient } from "@supabase/ssr";
import { Database } from "../../types/database";
import { SUPABASE_CONFIG, isSupabaseConfigured } from "./config";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Creates or retrieves the singleton Supabase browser client for Next.js.
 * Uses @supabase/ssr for cookie-based session persistence.
 */
export function getSupabaseBrowserClient() {
  if (typeof window === "undefined") {
    return null;
  }

  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      SUPABASE_CONFIG.url,
      SUPABASE_CONFIG.anonKey
    );
  }

  return browserClient;
}

export const supabase = getSupabaseBrowserClient();
