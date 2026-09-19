import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runAgentForUser } from "@/lib/agents/creator-agent";

// Keep a generous UTF-8 byte guard while allowing long Bangla/Unicode messages.
const MAX_INPUT_BYTES = 64 * 1024;
const MAX_MESSAGE_CHARS = 24000;
const RATE_LIMIT = 20;
const RATE_WINDOW_SECONDS = 3600;
const MAX_HISTORY_MESSAGES = 20;
const MAX_HISTORY_CHARS = 24000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  try {
    const raw = await req.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_INPUT_BYTES) {
      return NextResponse.json({ error: "Request is too large. Please shorten the message and try again." }, { status: 413 });
    }
    let body: unknown;
    try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }
    const input = body as Record<string, unknown>;
    const message = typeof input.message === "string" ? input.message.trim() : "";
    if (!message) return NextResponse.json({ error: "Message is required." }, { status: 400 });
    if (message.length > MAX_MESSAGE_CHARS) return NextResponse.json({ error: "Message is too long. Please keep it under 24,000 characters." }, { status: 400 });

    const conversationId = typeof input.conversationId === "string" ? input.conversationId.trim() : "";
    if (conversationId && !UUID_RE.test(conversationId)) return NextResponse.json({ error: "Invalid conversation id." }, { status: 400 });
    const provider = typeof input.provider === "string" ? input.provider.trim().slice(0, 40) : "Auto AI";
    const language = typeof input.language === "string" ? input.language.trim().slice(0, 50) : "English";
    const tone = typeof input.tone === "string" ? input.tone.trim().slice(0, 80) : "Professional";
    const tool = typeof input.tool === "string" ? input.tool.trim().slice(0, 80) : "AI Agent";
    const platform = typeof input.platform === "string" ? input.platform.trim().slice(0, 80) : "General";
    const workflowContext = `CreateSoul context: provider=${provider}; language=${language}; tone=${tone}; tool=${tool}; platform=${platform}. Follow these preferences unless the user's message explicitly overrides them.`;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Please log in first." }, { status: 401 });

    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    const { data: allowed, error: rateError } = await admin.rpc("check_generation_rate_limit", {
      p_user_id: user.id,
      p_limit: RATE_LIMIT,
      p_window_seconds: RATE_WINDOW_SECONDS
    });
    if (rateError) return NextResponse.json({ error: "Could not verify request limit." }, { status: 503 });
    if (!allowed) return NextResponse.json({ error: "Agent request limit reached. Please try again later." }, { status: 429 });

    let activeConversationId = conversationId;
    if (activeConversationId) {
      const { data: owned, error: lookupError } = await supabase
        .from("agent_conversations")
        .select("id,title")
        .eq("id", activeConversationId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (lookupError) return NextResponse.json({ error: "Could not verify conversation." }, { status: 503 });
      if (!owned) activeConversationId = "";
    }
    if (!activeConversationId) {
      const { data: created, error: createError } = await supabase
        .from("agent_conversations")
        .insert({ user_id: user.id, title: message.slice(0, 55) || "New conversation" })
        .select("id")
        .single();
      if (createError || !created) return NextResponse.json({ error: "Could not create conversation history." }, { status: 503 });
      activeConversationId = created.id;
    }

    const { data: history, error: historyError } = await supabase
      .from("agent_messages")
      .select("role,content,created_at")
      .eq("conversation_id", activeConversationId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(MAX_HISTORY_MESSAGES);
    if (historyError) return NextResponse.json({ error: "Could not load conversation context." }, { status: 503 });

    const orderedHistory = (history ?? []).reverse();
    let historyText = "";
    for (const item of orderedHistory) {
      const line = `${item.role === "assistant" ? "CreateSoul AI" : "User"}: ${String(item.content ?? "").slice(0, 6000)}`;
      if ((historyText + line + "\n").length > MAX_HISTORY_CHARS) break;
      historyText += line + "\n";
    }

    const { error: userMessageError } = await supabase.from("agent_messages").insert({
      conversation_id: activeConversationId,
      user_id: user.id,
      role: "user",
      content: message
    });
    if (userMessageError) return NextResponse.json({ error: "Could not save your message." }, { status: 503 });

    const context = historyText ? `Conversation history (use this only for continuity; do not repeat it unless useful):\n${historyText}` : "This is the start of a new conversation.";
    const result = await runAgentForUser(`${workflowContext}\n\n${context}\nUser request:\n${message}`, user.id);

    const { error: assistantMessageError } = await supabase.from("agent_messages").insert({
      conversation_id: activeConversationId,
      user_id: user.id,
      role: "assistant",
      content: result.output || ""
    });
    await supabase.from("agent_conversations").update({ updated_at: new Date().toISOString() }).eq("id", activeConversationId).eq("user_id", user.id);

    return NextResponse.json({ success: true, conversationId: activeConversationId, historySaved: !assistantMessageError, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Agent execution failed.";
    if (message.toLowerCase().includes("no credits")) return NextResponse.json({ error: "No credits left. Please upgrade or wait for your next credit reset." }, { status: 402 });
    if (message.toLowerCase().includes("not configured")) return NextResponse.json({ error: "AI provider is not configured yet." }, { status: 503 });
    return NextResponse.json({ error: "Agent execution failed. The request was safely stopped and the credit was returned when possible." }, { status: 502 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    agent: "CreateSoul AI Agent",
    capabilities: [
      "multi-step reasoning",
      "web research",
      "content generation",
      "content planning",
      "library continuity",
      "persistent conversation history",
      "safe external-action confirmation",
      "guarded tool execution"
    ],
    externalActionsRequireConfirmation: true
  });
}
