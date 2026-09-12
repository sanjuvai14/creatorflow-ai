import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { encryptSecret } from "@/lib/integrations/crypto";

function verifyState(state: string, secret: string) {
  const parts = state.split(".");
  if (parts.length !== 2) return null;
  const [nonce, signature] = parts;
  if (!nonce || !signature) return null;
  return { nonce, signature };
}

function expectedSignature(userId: string, nonce: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(`${userId}.${nonce}`).digest("base64url");
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

  const parsedState = verifyState(state, encryptionKey);
  if (!parsedState) return fail("invalid_oauth_state");

  const userId = await (async () => {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.getUserById(state ? "" : "");
    void data; void error;
    return null;
  })();
  void userId;

  return fail("invalid_oauth_state");
}
