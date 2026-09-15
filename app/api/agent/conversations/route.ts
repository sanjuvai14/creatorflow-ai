import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_TITLE = 120;
const MAX_CONTENT = 20000;

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function GET() {
  const { supabase, user } = await getUser();
  if (!user) return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  const { data, error } = await supabase.from("agent_conversations").select("id,title,created_at,updated_at,agent_messages(id,role,content,created_at)").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(30);
  if (error) return NextResponse.json({ error: "Could not load conversations." }, { status: 503 });
  return NextResponse.json({ conversations: data ?? [] });
}

export async function POST(req: Request) {
  const { supabase, user } = await getUser();
  if (!user) return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }
  const conversationId = typeof body.conversationId === "string" ? body.conversationId : "";
  const role = body.role === "assistant" ? "assistant" : body.role === "user" ? "user" : "";
  const content = typeof body.content === "string" ? body.content.trim().slice(0, MAX_CONTENT) : "";
  const title = typeof body.title === "string" ? body.title.trim().slice(0, MAX_TITLE) : "New Chat";
  if (!role || !content) return NextResponse.json({ error: "Role and content are required." }, { status: 400 });

  let id = conversationId;
  if (id) {
    const { data: owned } = await supabase.from("agent_conversations").select("id").eq("id", id).eq("user_id", user.id).maybeSingle();
    if (!owned) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  } else {
    const { data: conversation, error } = await supabase.from("agent_conversations").insert({ user_id: user.id, title: title || "New Chat" }).select("id").single();
    if (error || !conversation) return NextResponse.json({ error: "Could not create conversation." }, { status: 503 });
    id = conversation.id;
  }

  const { data: message, error: messageError } = await supabase.from("agent_messages").insert({ conversation_id: id, user_id: user.id, role, content }).select("id,conversation_id,role,content,created_at").single();
  if (messageError) return NextResponse.json({ error: "Could not save message." }, { status: 503 });
  await supabase.from("agent_conversations").update({ updated_at: new Date().toISOString() }).eq("id", id).eq("user_id", user.id);
  return NextResponse.json({ conversationId: id, message });
}
