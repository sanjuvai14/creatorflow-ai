import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("billing_transactions")
      .select("id,provider,provider_transaction_id,product_type,plan,credits,amount_minor,currency,status,created_at,updated_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) return NextResponse.json({ error: "Could not load billing transactions." }, { status: 503 });
    return NextResponse.json({ transactions: data ?? [], paymentsEnabled: false });
  } catch {
    return NextResponse.json({ error: "Could not load billing transactions." }, { status: 500 });
  }
}
