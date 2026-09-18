import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_BODY_BYTES = 8 * 1024;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413 });
    }
    const body = JSON.parse(raw);
    const display_name = typeof body?.display_name === "string" ? body.display_name.trim().slice(0, 80) : "";

    const admin = createAdminClient();
    const { error } = await admin.from("profiles")
      .update({ display_name, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    if (error) return NextResponse.json({ error: "Could not update your profile right now." }, { status: 500 });

    return NextResponse.json({ ok: true, display_name });
  } catch {
    return NextResponse.json({ error: "Settings update failed. Please try again." }, { status: 500 });
  }
}
