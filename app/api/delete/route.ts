import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const allowedTables = new Set(["saved_content", "generations"]);

export async function DELETE(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { id?: unknown; table?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id.trim() : "";
  const table = typeof body.table === "string" ? body.table : "";
  if (!id || !allowedTables.has(table)) {
    return NextResponse.json({ error: "Invalid delete request" }, { status: 400 });
  }

  const { data: deleted, error } = await supabase
    .from(table)
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) return NextResponse.json({ error: "Could not delete this item. Please try again." }, { status: 500 });
  if (!deleted) return NextResponse.json({ error: "Item not found" }, { status: 404 });

  return NextResponse.json({ ok: true, id: deleted.id });
}
