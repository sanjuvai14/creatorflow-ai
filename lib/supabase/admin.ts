import { createClient } from "@supabase/supabase-js";

// Supabase project URL is public configuration. Keep the env override for portability,
// but use the verified CreatorFlow AI project URL as a safe fallback so billing webhooks
// do not fail just because NEXT_PUBLIC_SUPABASE_URL was omitted from Vercel.
const DEFAULT_SUPABASE_URL = "https://wckgvkfgxedyuysdibsw.supabase.co";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
