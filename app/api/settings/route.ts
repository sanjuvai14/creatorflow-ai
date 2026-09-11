import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const display_name = typeof body.display_name === "string" ? body.display_name.trim().slice(0, 80) : "";

    const admin = createAdminClient();
    const { error } = await admin.from("profiles").update({ display_name, updated_at: new Date().toISOString() }).eq("id", user.id);
    if (error) return NextResponse.json({ error: "Could not update your profile right now." }, { status: 500 });

    return NextResponse.json({ ok: true, display_name });
  } catch {
    return NextResponse.json({ error: "Settings update failed. Please try again." }, { status: 500 });
  }
}
