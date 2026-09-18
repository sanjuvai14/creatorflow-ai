import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const allowed = new Set(["login", "generation", "credits", "image", "platform", "billing", "other"]);
const MAX_BODY_BYTES = 12 * 1024;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const raw = await req.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413 });
    }
    let body: unknown;
    try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }

    const input = body as Record<string, unknown>;
    const category = typeof input.category === "string" ? input.category.trim() : "";
    const details = typeof input.details === "string" ? input.details.trim() : "";
    if (!allowed.has(category) || details.length < 10 || details.length > 5000) {
      return NextResponse.json({ error: "Invalid support request" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("support_tickets")
      .insert({ user_id: user.id, category, details })
      .select("id,status,created_at")
      .single();
    if (error) return NextResponse.json({ error: "Could not save support request" }, { status: 500 });
    return NextResponse.json({ ticket: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not process support request" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data, error } = await supabase
      .from("support_tickets")
      .select("id,category,details,status,created_at,updated_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) return NextResponse.json({ error: "Could not load support requests" }, { status: 500 });
    return NextResponse.json({ tickets: data || [] });
  } catch {
    return NextResponse.json({ error: "Could not load support requests" }, { status: 500 });
  }
}
