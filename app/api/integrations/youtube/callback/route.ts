import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { encryptSecret } from "@/lib/integrations/crypto";

const OAUTH_STATE_MAX_AGE_MS = 10 * 60 * 1000;

type SignedState = { userId?: string; nonce?: string; issuedAt?: number };

function parseSignedState(state: string, secret: string) {
  const [payload, signature] = state.split(".");
  if (!payload || !signature) return null;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SignedState;
    if (!parsed.userId || !parsed.nonce || !Number.isFinite(parsed.issuedAt)) return null;
    if (Math.abs(Date.now() - parsed.issuedAt!) > OAUTH_STATE_MAX_AGE_MS) return null;
    return parsed;
  } catch { return null; }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = request.headers.get("cookie")?.match(/(?:^|; )creatorflow_oauth_state=([^;]+)/)?.[1];
  const fail = (reason: string) => NextResponse.redirect(new URL(`/settings?integration=youtube&error=${encodeURIComponent(reason)}`, request.url));

  if (!code || !state || !cookieState || state !== cookieState) return fail("invalid_oauth_state");

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const encryptionKey = process.env.INTEGRATION_TOKEN_ENCRYPTION_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || url.origin;
  if (!clientId || !clientSecret || !encryptionKey) return fail("provider_not_configured");

  const signedState = parseSignedState(state, encryptionKey);
  if (!signedState) return fail("invalid_oauth_state");
  const userId = signedState.userId!;

  // Bind the callback to the currently authenticated Supabase session as well
  // as the signed, HttpOnly OAuth state cookie. This prevents a valid state from
  // being replayed from a different logged-in account.
  const sessionClient = await createClient();
  const { data: { user: sessionUser } } = await sessionClient.auth.getUser();
  if (!sessionUser || sessionUser.id !== userId) return fail("session_mismatch");

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${appUrl}/api/integrations/youtube/callback`,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenResponse.ok) return fail("token_exchange_failed");
  const token = await tokenResponse.json() as { access_token?: string; refresh_token?: string; expires_in?: number; token_type?: string };
  if (!token.access_token) return fail("missing_access_token");

  const channelResponse = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!channelResponse.ok) return fail("youtube_validation_failed");
  const channelData = await channelResponse.json() as { items?: Array<{ id?: string; snippet?: { title?: string } }> };
  const channel = channelData.items?.[0];
  if (!channel?.id) return fail("youtube_channel_not_found");

  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("platform_connections")
    .select("refresh_token_encrypted")
    .eq("user_id", userId)
    .eq("platform", "youtube")
    .maybeSingle();

  const { error } = await supabase.from("platform_connections").upsert({
    user_id: userId,
    platform: "youtube",
    status: "connected",
    external_account_id: channel.id,
    external_account_name: channel.snippet?.title || "YouTube channel",
    scopes: ["https://www.googleapis.com/auth/youtube.readonly"],
    access_token_encrypted: encryptSecret(token.access_token),
    // Google may omit refresh_token on re-consent. Preserve the existing one
    // so reconnecting cannot silently break future background access.
    refresh_token_encrypted: token.refresh_token
      ? encryptSecret(token.refresh_token)
      : existing?.refresh_token_encrypted ?? null,
    token_type: token.token_type || "Bearer",
    expires_at: token.expires_in ? new Date(Date.now() + token.expires_in * 1000).toISOString() : null,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id,platform" });

  if (error) return fail("connection_save_failed");
  const response = NextResponse.redirect(new URL("/settings?integration=youtube&connected=1", request.url));
  response.cookies.delete("creatorflow_oauth_state");
  return response;
}
