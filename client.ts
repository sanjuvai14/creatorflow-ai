import { createBrowserClient } from "@supabase/ssr";

// Supabase publishable client configuration.
// Environment variables are preferred, with a safe public fallback so the
// deployed app can still initialize auth when Vercel env vars are missing.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wckgvkfgxedyuysdibsw.supabase.co";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_a5EYf9js-rdRpjeLlJVvzg_AEKHMVr8";

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
}
