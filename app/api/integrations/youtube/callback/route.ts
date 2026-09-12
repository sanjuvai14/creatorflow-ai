import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { encryptSecret } from "@/lib/integrations/crypto";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = request.headers.get("cookie")?.match(/(?:^|; )creatorflow_oauth_state=([^;]+)/)?.[1];
  const userId = request.headers.get("cookie")?.match(/(?:^|; )creatorflow_oauth_user=([^;]+)/)?.[1];
  const fail = (reason: string) => NextResponse.redirect(new URL(`/settings?integration=youtube&error=${encodeURIComponent(reason)}`, request.url));

  if (!code || !state || !cookieState || !userId || state !== cookieState) return fail("invalid_oauth_state");

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || url.origin;
  if (!clientId || !clientSecret || !process.env.INTEGRATION_TOKEN_ENCRYPTION_KEY) return fail("provider_not_configured");

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
  const { error } = await supabase.from("platform_connections").upsert({
    user_id: userId,
    platform: "youtube",
    status: "connected",
    external_account_id: channel.id,
    external_account_name: channel.snippet?.title || "YouTube channel",
    scopes: ["https://www.googleapis.com/auth/youtube.readonly"],
    access_token_encrypted: encryptSecret(token.access_token),
    refresh_token_encrypted: token.refresh_token ? encryptSecret(token.refresh_token) : null,
    token_type: token.token_type || "Bearer",
    expires_at: token.expires_in ? new Date(Date.now() + token.expires_in * 1000).toISOString() : null,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id,platform" });

  if (error) return fail("connection_save_failed");
  const response = NextResponse.redirect(new URL("/settings?integration=youtube&connected=1", request.url));
  response.cookies.delete("creatorflow_oauth_state");
  response.cookies.delete("creatorflow_oauth_user");
  return response;
}
