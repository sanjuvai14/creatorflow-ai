import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const allowed = new Set(["login", "generation", "credits", "image", "platform", "billing", "other"]);

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const category = String(body.category || "");
    const details = String(body.details || "").trim();
    if (!allowed.has(category) || details.length < 10 || details.length > 5000) {
      return NextResponse.json({ error: "Invalid support request" }, { status: 400 });
    }
    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data, error } = await admin.from("support_tickets").insert({ user_id: user.id, category, details }).select("id,status,created_at").single();
    if (error) return NextResponse.json({ error: "Could not save support request" }, { status: 500 });
    return NextResponse.json({ ticket: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not process support request" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data, error } = await supabase.from("support_tickets").select("id,category,details,status,created_at,updated_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
    if (error) return NextResponse.json({ error: "Could not load support requests" }, { status: 500 });
    return NextResponse.json({ tickets: data || [] });
  } catch { return NextResponse.json({ error: "Could not load support requests" }, { status: 500 }); }
}
