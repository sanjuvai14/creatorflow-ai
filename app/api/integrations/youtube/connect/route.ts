import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function signState(payload: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login?next=/settings", request.url));

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const encryptionKey = process.env.INTEGRATION_TOKEN_ENCRYPTION_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  if (!clientId || !encryptionKey) {
    return NextResponse.redirect(new URL("/settings?integration=youtube&error=provider_not_configured", request.url));
  }

  const nonce = crypto.randomBytes(32).toString("base64url");
  const issuedAt = Date.now();
  const payload = Buffer.from(JSON.stringify({ userId: user.id, nonce, issuedAt }), "utf8").toString("base64url");
  const state = `${payload}.${signState(payload, encryptionKey)}`;
  const response = NextResponse.redirect(new URL("https://accounts.google.com/o/oauth2/v2/auth"));
  response.headers.set("Location", `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${appUrl}/api/integrations/youtube/callback`,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope: "https://www.googleapis.com/auth/youtube.readonly",
    state,
  }).toString()}`);
  response.cookies.set("creatorflow_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
