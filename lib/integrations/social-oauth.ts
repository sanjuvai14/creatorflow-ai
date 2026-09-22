import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { encryptSecret } from "@/lib/integrations/crypto";

type Platform = "facebook" | "instagram" | "tiktok";

type ProviderConfig = {
  clientId?: string;
  clientSecret?: string;
  authorizeUrl: string;
  tokenUrl: string;
  profileUrl: string;
  scopes: string;
  profileHeaders?: Record<string,string>;
};

const maxAgeMs = 10 * 60 * 1000;

function provider(platform: Platform): ProviderConfig | null {
  if (platform === "tiktok") {
    const clientId = process.env.TIKTOK_CLIENT_KEY;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
    return {
      clientId,
      clientSecret,
      authorizeUrl: "https://www.tiktok.com/v2/auth/authorize/",
      tokenUrl: "https://open.tiktokapis.com/v2/oauth/token/",
      profileUrl: "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url",
      scopes: process.env.TIKTOK_SCOPES || "user.info.basic",
    };
  }
  const version = process.env.META_GRAPH_VERSION;
  const clientId = process.env.META_CLIENT_ID;
  const clientSecret = process.env.META_CLIENT_SECRET;
  if (!version) return null;
  return {
    clientId,
    clientSecret,
    authorizeUrl: `https://www.facebook.com/${version}/dialog/oauth`,
    tokenUrl: `https://graph.facebook.com/${version}/oauth/access_token`,
    profileUrl: `https://graph.facebook.com/${version}/me?fields=id,name`,
    scopes: process.env.META_SCOPES || "public_profile",
  };
}

function sign(payload: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

function makeState(userId: string, platform: Platform, secret: string) {
  const payload = Buffer.from(JSON.stringify({
    userId, platform, nonce: crypto.randomBytes(24).toString("base64url"), issuedAt: Date.now()
  })).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

function parseState(state: string, secret: string) {
  const [payload, signature] = state.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload, secret);
  const actualBytes = Buffer.from(signature), expectedBytes = Buffer.from(expected);
  if (actualBytes.length !== expectedBytes.length || !crypto.timingSafeEqual(actualBytes, expectedBytes)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {userId?:string;platform?:Platform;issuedAt?:number};
    if (!parsed.userId || !parsed.platform || !parsed.issuedAt || Date.now() - parsed.issuedAt > maxAgeMs) return null;
    return parsed;
  } catch { return null; }
}

export async function startSocialOAuth(request: Request, platform: Platform) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login?next=/settings", request.url));
  const cfg = provider(platform);
  const secret = process.env.INTEGRATION_TOKEN_ENCRYPTION_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  if (!cfg?.clientId || !cfg.clientSecret || !secret) return NextResponse.redirect(new URL(`/settings?integration=${platform}&error=provider_not_configured`, request.url));
  const state = makeState(user.id, platform, secret);
  const redirectUri = `${appUrl}/api/integrations/${platform}/callback`;
  const params = new URLSearchParams({
    client_id: cfg.clientId, redirect_uri: redirectUri, response_type: "code",
    scope: cfg.scopes, state,
  });
  if (platform === "tiktok") params.set("client_key", cfg.clientId), params.delete("client_id");
  if (platform === "facebook" || platform === "instagram") params.set("auth_type", "rerequest");
  const response = NextResponse.redirect(`${cfg.authorizeUrl}?${params.toString()}`);
  response.cookies.set("createsoul_social_state", state, {httpOnly:true, secure:process.env.NODE_ENV==="production", sameSite:"lax", maxAge:600, path:"/"});
  response.headers.set("Cache-Control","no-store");
  return response;
}

export async function finishSocialOAuth(request: Request, platform: Platform) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const raw = request.headers.get("cookie")?.match(/(?:^|; )createsoul_social_state=([^;]+)/)?.[1];
  let cookieState: string | undefined;
  try { cookieState = raw ? decodeURIComponent(raw) : undefined; } catch {}
  const fail = (reason: string) => NextResponse.redirect(new URL(`/settings?integration=${platform}&error=${encodeURIComponent(reason)}`, request.url));
  if (!code || !state || !cookieState || state !== cookieState) return fail("invalid_oauth_state");
  const secret = process.env.INTEGRATION_TOKEN_ENCRYPTION_KEY;
  const cfg = provider(platform);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || url.origin;
  if (!secret || !cfg?.clientId || !cfg.clientSecret) return fail("provider_not_configured");
  const parsed = parseState(state, secret);
  if (!parsed || parsed.platform !== platform) return fail("invalid_oauth_state");
  const session = await createClient();
  const { data: { user } } = await session.auth.getUser();
  if (!user || user.id !== parsed.userId) return fail("session_mismatch");

  const body = new URLSearchParams({
    code, redirect_uri: `${appUrl}/api/integrations/${platform}/callback`,
    grant_type: "authorization_code",
  });
  if (platform === "tiktok") body.set("client_key", cfg.clientId); else body.set("client_id", cfg.clientId);
  body.set("client_secret", cfg.clientSecret);
  const tokenResponse = await fetch(cfg.tokenUrl, {method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body});
  if (!tokenResponse.ok) return fail("token_exchange_failed");
  const token = await tokenResponse.json() as {access_token?:string;refresh_token?:string;expires_in?:number;token_type?:string;open_id?:string};
  if (!token.access_token) return fail("missing_access_token");

  const profileResponse = await fetch(cfg.profileUrl, {headers:{Authorization:`Bearer ${token.access_token}`,...(cfg.profileHeaders||{})}});
  if (!profileResponse.ok) return fail("profile_validation_failed");
  const profile = await profileResponse.json() as any;
  const data = platform === "tiktok" ? profile?.data?.user : profile;
  const externalId = data?.open_id || data?.id;
  if (!externalId) return fail("external_account_not_found");

  const admin = createAdminClient();
  const {data: existing} = await admin.from("platform_connections").select("refresh_token_encrypted").eq("user_id",user.id).eq("platform",platform).maybeSingle();
  const {error} = await admin.from("platform_connections").upsert({
    user_id:user.id, platform, status:"connected", external_account_id:String(externalId),
    external_account_name:data?.display_name || data?.name || `${platform} account`,
    scopes:cfg.scopes.split(/[ ,]+/).filter(Boolean),
    access_token_encrypted:encryptSecret(token.access_token),
    refresh_token_encrypted:token.refresh_token?encryptSecret(token.refresh_token):existing?.refresh_token_encrypted??null,
    token_type:token.token_type||"Bearer",
    expires_at:token.expires_in?new Date(Date.now()+token.expires_in*1000).toISOString():null,
    updated_at:new Date().toISOString(),
  },{onConflict:"user_id,platform"});
  if (error) return fail("connection_save_failed");
  const response = NextResponse.redirect(new URL(`/settings?integration=${platform}&connected=1`,request.url));
  response.cookies.set("createsoul_social_state","",{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",maxAge:0,path:"/"});
  response.headers.set("Cache-Control","no-store");
  return response;
}
