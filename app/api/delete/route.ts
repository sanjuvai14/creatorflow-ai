import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const allowedTables = new Set(["saved_content", "generations", "saved_images"]);

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body: { id?: unknown; table?: unknown };
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }

    const id = typeof body.id === "string" ? body.id.trim() : "";
    const table = typeof body.table === "string" ? body.table : "";
    if (!id || !allowedTables.has(table)) return NextResponse.json({ error: "Invalid delete request" }, { status: 400 });

    let imageUrl: string | null = null;
    if (table === "saved_images") {
      const { data, error } = await supabase.from("saved_images").select("id,image_url").eq("id", id).eq("user_id", user.id).maybeSingle();
      if (error) return NextResponse.json({ error: "Could not delete this item. Please try again." }, { status: 500 });
      if (!data) return NextResponse.json({ error: "Item not found" }, { status: 404 });
      imageUrl = typeof data.image_url === "string" ? data.image_url : null;
    }

    const { data: deleted, error } = await supabase
      .from(table).delete().eq("id", id).eq("user_id", user.id).select("id").maybeSingle();

    if (error) return NextResponse.json({ error: "Could not delete this item. Please try again." }, { status: 500 });
    if (!deleted) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    if (table === "saved_images" && imageUrl) {
      try {
        const url = new URL(imageUrl);
        const marker = "/storage/v1/object/public/saved-images/";
        const index = url.pathname.indexOf(marker);
        const path = index >= 0 ? decodeURIComponent(url.pathname.slice(index + marker.length)) : "";
        if (path && path.startsWith(`${user.id}/`)) {
          const admin = createAdminClient();
          await admin.storage.from("saved-images").remove([path]);
        }
      } catch {
        // Database deletion succeeded; an orphaned storage object can be cleaned up later.
      }
    }

    return NextResponse.json({ ok: true, id: deleted.id });
  } catch {
    return NextResponse.json({ error: "Could not delete this item. Please try again." }, { status: 500 });
  }
}
