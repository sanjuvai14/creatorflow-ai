import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_TITLE = 120;
const MAX_TYPE = 40;
const MAX_CONTENT = 30000;

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { title?: unknown; type?: unknown; content?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim().slice(0, MAX_TITLE) : "Untitled";
  const type = typeof body.type === "string" ? body.type.trim().slice(0, MAX_TYPE) : "generated";
  const content = typeof body.content === "string" ? body.content.trim() : "";

  if (!content) return NextResponse.json({ error: "Content is required" }, { status: 400 });
  if (content.length > MAX_CONTENT) {
    return NextResponse.json({ error: `Content is too long. Maximum ${MAX_CONTENT} characters.` }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("saved_content")
    .insert({ user_id: user.id, title: title || "Untitled", type: type || "generated", content })
    .select("id,title,type,content,created_at")
    .single();

  if (error) return NextResponse.json({ error: "Could not save this content. Please try again." }, { status: 500 });
  return NextResponse.json({ item: data });
}
