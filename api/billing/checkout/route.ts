import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_PLANS = new Set(["creator", "pro"]);

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Please log in first." }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const plan = String(body?.plan || "").toLowerCase();
    if (!ALLOWED_PLANS.has(plan)) {
      return NextResponse.json({ error: "Invalid paid plan." }, { status: 400 });
    }

    // Payments remain intentionally disabled until a real billing provider is
    // configured server-side. Never trust a client-provided price or plan amount.
    return NextResponse.json({
      error: "Paid checkout is not enabled yet.",
      plan,
      paymentsEnabled: false,
    }, { status: 503 });
  } catch {
    return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
  }
}
