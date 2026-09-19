import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_PLANS = new Set(["creator", "pro"]);

const PRICE_ENV: Record<string, string> = {
  creator: "PADDLE_CREATOR_PRICE_ID",
  pro: "PADDLE_PRO_PRICE_ID",
};

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Please log in first." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const plan = String(body?.plan || "").toLowerCase();

    if (!ALLOWED_PLANS.has(plan)) {
      return NextResponse.json({ error: "Invalid paid plan." }, { status: 400 });
    }

    const billingEnabled = process.env.PADDLE_BILLING_ENABLED === "true";
    const apiKey = process.env.PADDLE_API_KEY;
    const priceId = process.env[PRICE_ENV[plan]];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    // Safe-by-default: this route cannot collect real money until the owner
    // explicitly enables Paddle and supplies the server-side credentials.
    if (!billingEnabled || !apiKey || !priceId || !appUrl) {
      return NextResponse.json(
        {
          error: "Paid checkout is not enabled yet.",
          plan,
          paymentsEnabled: false,
        },
        { status: 503 },
      );
    }

    const paddleResponse = await fetch("https://api.paddle.com/transactions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [{ price_id: priceId, quantity: 1 }],
        collection_mode: "automatic",
        enable_checkout: true,
        checkout: { url: appUrl },
        custom_data: {
          user_id: user.id,
          plan,
        },
      }),
      cache: "no-store",
    });

    const payload = await paddleResponse.json().catch(() => null);
    if (!paddleResponse.ok) {
      console.error("Paddle checkout creation failed", {
        status: paddleResponse.status,
        detail: payload?.error?.detail || payload?.error?.code || "unknown",
      });
      return NextResponse.json(
        { error: "Could not create the payment checkout." },
        { status: 502 },
      );
    }

    const transaction = payload?.data;
    if (!transaction?.id) {
      return NextResponse.json(
        { error: "Payment provider returned an invalid checkout response." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      paymentsEnabled: true,
      transactionId: transaction.id,
      checkoutUrl: transaction.checkout?.url || null,
    });
  } catch {
    return NextResponse.json(
      { error: "Could not start checkout." },
      { status: 500 },
    );
  }
}
