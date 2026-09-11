import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("saved_images")
      .select("id,title,image_url,image_type,prompt,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: "Could not load your saved visuals. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ items: data ?? [] });
  } catch {
    return NextResponse.json({ error: "Could not load your saved visuals. Please try again." }, { status: 500 });
  }
}
