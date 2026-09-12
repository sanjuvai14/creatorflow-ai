import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 1024 * 1024;
// Paddle recommends rejecting signatures with an old timestamp to reduce replay risk.
const TIMESTAMP_TOLERANCE_SECONDS = 300;

function getWebhookSecrets() {
  return [
    process.env.PADDLE_WEBHOOK_SECRET_KEY,
    process.env.PADDLE_WEBHOOK_SECRET_KEY_SECONDARY,
  ].filter((value): value is string => Boolean(value?.trim()));
}

function verifyPaddleSignature(rawBody: string, signatureHeader: string, secrets: string[]) {
  const parts = signatureHeader.split(";");
  const values = new Map<string, string>();

  for (const part of parts) {
    const index = part.indexOf("=");
    if (index <= 0) continue;
    values.set(part.slice(0, index).trim(), part.slice(index + 1).trim());
  }

  const timestamp = values.get("ts");
  const expectedSignature = values.get("h1");
  if (!timestamp || !expectedSignature || !/^\d+$/.test(timestamp)) return false;

  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (age > TIMESTAMP_TOLERANCE_SECONDS) return false;

  const signedPayload = `${timestamp}:${rawBody}`;
  const expected = Buffer.from(expectedSignature, "hex");

  return secrets.some((secret) => {
    const computed = createHmac("sha256", secret).update(signedPayload).digest();
    return expected.length === computed.length && timingSafeEqual(expected, computed);
  });
}

export async function POST(request: Request) {
  const secrets = getWebhookSecrets();
  if (secrets.length === 0) {
    return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
  }

  const signature = request.headers.get("paddle-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Paddle signature." }, { status: 400 });
  }

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Webhook payload too large." }, { status: 413 });
  }

  if (!verifyPaddleSignature(rawBody, signature, secrets)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  let event: { event_id?: string; event_type?: string };
  try {
    event = JSON.parse(rawBody) as { event_id?: string; event_type?: string };
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }

  const eventId = typeof event.event_id === "string" ? event.event_id : "";
  const eventType = typeof event.event_type === "string" ? event.event_type : "";
  if (!eventId || !eventType) {
    return NextResponse.json({ error: "Missing webhook event identifiers." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("billing_events").insert({
    provider: "paddle",
    provider_event_id: eventId,
    event_type: eventType,
    processed_at: new Date().toISOString(),
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    return NextResponse.json({ error: "Could not record webhook event." }, { status: 500 });
  }

  // Sandbox phase: record verified events first. Entitlements remain disabled
  // until Paddle product/price IDs and customer metadata are configured.
  return NextResponse.json({ ok: true, received: true, eventType });
}
