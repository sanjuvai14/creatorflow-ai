import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 1024 * 1024;
const TIMESTAMP_TOLERANCE_SECONDS = 300;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type PaddleEvent = {
  event_id?: string;
  event_type?: string;
  occurred_at?: string;
  data?: Record<string, any>;
};

function getWebhookSecrets() {
  return [
    process.env.PADDLE_WEBHOOK_SECRET_KEY,
    process.env.PADDLE_WEBHOOK_SECRET_KEY_SECONDARY,
  ].filter((value): value is string => Boolean(value?.trim()));
}

function parseJsonMap(name: string): Record<string, number> {
  try {
    const parsed = JSON.parse(process.env[name] || "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed)
        .filter(([, value]) => Number.isInteger(value) && Number(value) > 0)
        .map(([key, value]) => [key, Number(value)]),
    );
  } catch {
    return {};
  }
}

function planForPrice(priceId: string | undefined) {
  if (!priceId) return null;
  if (priceId === process.env.PADDLE_CREATOR_PRICE_ID) return "creator";
  if (priceId === process.env.PADDLE_PRO_PRICE_ID) return "pro";
  return null;
}

function parseAmount(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.trunc(n) : null;
}

function getPriceId(data: Record<string, any>) {
  return typeof data?.items?.[0]?.price?.id === "string" ? data.items[0].price.id : undefined;
}

function getUserId(data: Record<string, any>) {
  const value = data?.custom_data?.user_id;
  return typeof value === "string" && UUID_RE.test(value) ? value : null;
}

function verifyPaddleSignature(rawBody: string, signatureHeader: string, secrets: string[]) {
  const values = new Map<string, string[]>();
  for (const part of signatureHeader.split(";")) {
    const index = part.indexOf("=");
    if (index <= 0) continue;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    const current = values.get(key) || [];
    current.push(value);
    values.set(key, current);
  }

  const timestamp = values.get("ts")?.[0];
  const signatures = values.get("h1") || [];
  if (!timestamp || !/^\d+$/.test(timestamp) || signatures.length === 0) return false;

  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (age > TIMESTAMP_TOLERANCE_SECONDS) return false;

  const signedPayload = `${timestamp}:${rawBody}`;
  return secrets.some((secret) =>
    signatures.some((signature) => {
      if (!/^[0-9a-f]{64}$/i.test(signature)) return false;
      const expected = Buffer.from(signature, "hex");
      const computed = createHmac("sha256", secret).update(signedPayload).digest();
      return expected.length === computed.length && timingSafeEqual(expected, computed);
    }),
  );
}

export async function POST(request: Request) {
  if (process.env.PADDLE_BILLING_ENABLED !== "true") {
    return NextResponse.json(
      { error: "Paddle billing is disabled until explicitly enabled.", paymentsEnabled: false },
      { status: 503 },
    );
  }

  const secrets = getWebhookSecrets();
  if (secrets.length === 0 || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Billing webhook backend is not configured." }, { status: 503 });
  }

  const signature = request.headers.get("paddle-signature");
  if (!signature) return NextResponse.json({ error: "Missing Paddle signature." }, { status: 400 });

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Webhook payload too large." }, { status: 413 });
  }

  if (!verifyPaddleSignature(rawBody, signature, secrets)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  let event: PaddleEvent;
  try {
    event = JSON.parse(rawBody) as PaddleEvent;
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }

  const eventId = typeof event.event_id === "string" ? event.event_id : "";
  const eventType = typeof event.event_type === "string" ? event.event_type : "";
  const data = event.data && typeof event.data === "object" ? event.data : null;
  if (!eventId || !eventType || !data) {
    return NextResponse.json({ error: "Missing webhook event data." }, { status: 400 });
  }

  const admin = createAdminClient();
  const metadata = { event_type: eventType, occurred_at: event.occurred_at || null };

  try {
    if (eventType.startsWith("subscription.")) {
      const subscriptionId = typeof data.id === "string" ? data.id : "";
      const customerId = typeof data.customer_id === "string" ? data.customer_id : null;
      if (!subscriptionId) return NextResponse.json({ error: "Missing subscription id." }, { status: 400 });

      let userId = getUserId(data);
      if (!userId && customerId) {
        const { data: existing } = await admin
          .from("billing_subscriptions")
          .select("user_id")
          .eq("provider", "paddle")
          .eq("provider_customer_id", customerId)
          .limit(1)
          .maybeSingle();
        userId = existing?.user_id || null;
      }
      if (!userId) {
        return NextResponse.json({ error: "Subscription is not linked to a CreateSoul user." }, { status: 422 });
      }

      const status = typeof data.status === "string" ? data.status : "pending";
      const plan = status === "canceled" || status === "paused"
        ? "free"
        : planForPrice(getPriceId(data)) || (typeof data.custom_data?.plan === "string" && ["creator", "pro"].includes(data.custom_data.plan) ? data.custom_data.plan : null);

      if (!plan) {
        return NextResponse.json({ error: "Subscription price is not server-configured." }, { status: 422 });
      }

      const result = await admin.rpc("process_billing_subscription_event", {
        p_provider: "paddle",
        p_event_id: eventId,
        p_event_type: eventType,
        p_user_id: userId,
        p_customer_id: customerId,
        p_subscription_id: subscriptionId,
        p_plan: plan,
        p_status: status,
        p_period_start: data.current_billing_period?.starts_at || null,
        p_period_end: data.current_billing_period?.ends_at || null,
        p_metadata: metadata,
      });
      if (result.error) throw result.error;
      return NextResponse.json({ ok: true, result: result.data });
    }

    if (eventType === "transaction.paid" || eventType === "transaction.completed" || eventType === "transaction.payment_failed" || eventType === "transaction.past_due" || eventType === "transaction.canceled") {
      const transactionId = typeof data.id === "string" ? data.id : "";
      if (!transactionId) return NextResponse.json({ error: "Missing transaction id." }, { status: 400 });

      let userId = getUserId(data);
      if (!userId) {
        const { data: existing } = await admin
          .from("billing_transactions")
          .select("user_id")
          .eq("provider", "paddle")
          .eq("provider_transaction_id", transactionId)
          .limit(1)
          .maybeSingle();
        userId = existing?.user_id || null;
      }
      if (!userId) return NextResponse.json({ error: "Transaction is not linked to a CreateSoul user." }, { status: 422 });

      const priceId = getPriceId(data);
      const plan = planForPrice(priceId);
      const creditMap = parseJsonMap("PADDLE_CREDIT_PRICE_MAP_JSON");
      const creditsForPrice = creditMap[priceId || ""] || 0;
      const isPaid = eventType === "transaction.paid" || eventType === "transaction.completed";
      const status = typeof data.status === "string"
        ? data.status
        : eventType === "transaction.payment_failed" ? "past_due" : eventType === "transaction.canceled" ? "canceled" : "paid";

      if (isPaid && !plan && creditsForPrice <= 0) {
        return NextResponse.json({ error: "Transaction price is not server-configured." }, { status: 422 });
      }

      const result = await admin.rpc("process_billing_event", {
        p_provider: "paddle",
        p_event_id: eventId,
        p_event_type: eventType,
        p_user_id: userId,
        p_transaction_id: transactionId,
        p_customer_id: typeof data.customer_id === "string" ? data.customer_id : null,
        p_subscription_id: typeof data.subscription_id === "string" ? data.subscription_id : null,
        p_product_type: plan ? "subscription" : "credit_purchase",
        p_plan: plan,
        p_credits: creditsForPrice,
        p_credit_delta: isPaid ? creditsForPrice : 0,
        p_amount_minor: parseAmount(data.details?.totals?.grand_total),
        p_currency: typeof data.currency_code === "string" ? data.currency_code : null,
        p_transaction_status: status,
        p_metadata: metadata,
        p_reason: plan ? "subscription_payment" : "credit_purchase",
      });
      if (result.error) throw result.error;
      return NextResponse.json({ ok: true, result: result.data });
    }

    if (eventType === "adjustment.created" || eventType === "adjustment.updated") {
      const action = typeof data.action === "string" ? data.action : "";
      const adjustmentStatus = typeof data.status === "string" ? data.status : "";
      const transactionId = typeof data.transaction_id === "string" ? data.transaction_id : "";
      const adjustmentId = typeof data.id === "string" ? data.id : "";
      if (!transactionId || !adjustmentId) return NextResponse.json({ error: "Missing adjustment identifiers." }, { status: 400 });

      const { data: original } = await admin
        .from("billing_transactions")
        .select("user_id,credits,amount_minor,provider_customer_id,provider_subscription_id")
        .eq("provider", "paddle")
        .eq("provider_transaction_id", transactionId)
        .limit(1)
        .maybeSingle();
      if (!original?.user_id) return NextResponse.json({ error: "Refund transaction is not linked to a CreateSoul user." }, { status: 422 });

      const approved = adjustmentStatus === "approved";
      const reversing = ["refund", "credit", "chargeback"].includes(action);
      let creditDelta = 0;

      if (approved && reversing && Number(original.credits) > 0) {
        if (data.type === "full") {
          creditDelta = -Number(original.credits);
        } else {
          const adjustedTotal = parseAmount(data.totals?.total) || 0;
          const originalAmount = Number(original.amount_minor) || 0;
          if (adjustedTotal > 0 && originalAmount > 0) {
            const ratio = Math.min(1, adjustedTotal / originalAmount);
            creditDelta = -Math.max(1, Math.ceil(Number(original.credits) * ratio));
          }
        }
      }

      const result = await admin.rpc("process_billing_event", {
        p_provider: "paddle",
        p_event_id: eventId,
        p_event_type: eventType,
        p_user_id: original.user_id,
        p_transaction_id: transactionId,
        p_customer_id: original.provider_customer_id,
        p_subscription_id: original.provider_subscription_id,
        p_product_type: "credit_purchase",
        p_plan: null,
        p_credits: Number(original.credits) || 0,
        p_credit_delta: creditDelta,
        p_amount_minor: Number(original.amount_minor) || null,
        p_currency: typeof data.currency_code === "string" ? data.currency_code : null,
        p_transaction_status: creditDelta < 0 ? "refunded" : "completed",
        p_metadata: { ...metadata, adjustment_id: adjustmentId, action, adjustment_status: adjustmentStatus },
        p_reason: `paddle_${action}`,
      });
      if (result.error) throw result.error;
      return NextResponse.json({ ok: true, result: result.data });
    }

    return NextResponse.json({ ok: true, ignored: true, eventType });
  } catch {
    return NextResponse.json({ error: "Billing event processing failed. Paddle may retry this notification." }, { status: 500 });
  }
}
