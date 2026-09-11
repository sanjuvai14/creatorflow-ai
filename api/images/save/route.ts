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
    if (!/^https:\/\//i.test(imageUrl)) {
      return NextResponse.json({ error: "A valid image URL is required." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const imageResponse = await fetch(imageUrl, { signal: AbortSignal.timeout(20000) });
    if (!imageResponse.ok) {
      return NextResponse.json({ error: "The generated image is no longer available. Please generate it again." }, { status: 502 });
    }

    const contentType = imageResponse.headers.get("content-type")?.split(";")[0]?.toLowerCase() || "image/png";
    const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
    if (!allowedTypes.has(contentType)) {
      return NextResponse.json({ error: "Unsupported image format." }, { status: 400 });
    }

    const imageBytes = await imageResponse.arrayBuffer();
    if (imageBytes.byteLength > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Image is too large to save." }, { status: 413 });
    }

    const extension = contentType === "image/jpeg" ? "jpg" : contentType === "image/webp" ? "webp" : "png";
    const path = `${user.id}/${crypto.randomUUID()}.${extension}`;

    const { data: upload, error: uploadError } = await supabase.storage
      .from("saved-images")
      .upload(path, imageBytes, {
        contentType,
        cacheControl: "31536000",
        upsert: false,
      });

    if (uploadError || !upload) {
      return NextResponse.json({ error: uploadError?.message || "Could not store image." }, { status: 500 });
    }

    const { data: publicUrl } = supabase.storage.from("saved-images").getPublicUrl(upload.path);

    const { data, error } = await supabase
      .from("saved_images")
      .insert({
        user_id: user.id,
        title,
        image_url: publicUrl.publicUrl,
        image_type: imageType,
        prompt,
      })
      .select("id, title, image_url, image_type, prompt, created_at")
      .single();

    if (error) {
      await supabase.storage.from("saved-images").remove([upload.path]);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, image: data });
  } catch {
    return NextResponse.json({ error: "Could not save image." }, { status: 500 });
  }
}
