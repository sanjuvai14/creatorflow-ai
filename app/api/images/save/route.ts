import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 120) : "Generated visual";
    const imageType = typeof body.imageType === "string" ? body.imageType.trim().slice(0, 60) : "generated";
    const prompt = typeof body.prompt === "string" ? body.prompt.trim().slice(0, 2000) : null;

    if (!imageUrl) return NextResponse.json({ error: "Image URL is required." }, { status: 400 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("saved_images")
      .insert({ user_id: user.id, title, image_url: imageUrl, image_type: imageType, prompt })
      .select("id, title, image_url, image_type, prompt, created_at")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, image: data });
  } catch {
    return NextResponse.json({ error: "Could not save image." }, { status: 500 });
  }
}
