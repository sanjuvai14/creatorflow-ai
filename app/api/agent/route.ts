import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runAgentForUser } from "@/lib/agents/creator-agent";

const MAX_INPUT = 12000;
const RATE_LIMIT = 20;
const RATE_WINDOW_SECONDS = 3600;

export async function POST(req: Request) {
  try {
    const raw = await req.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_INPUT) {
      return NextResponse.json({ error: "Request is too large." }, { status: 413 });
    }
    let body: unknown;
    try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }
    const input = body as Record<string, unknown>;
    const message = typeof input.message === "string" ? input.message.trim() : "";
    if (!message) return NextResponse.json({ error: "Message is required." }, { status: 400 });
    if (message.length > MAX_INPUT) return NextResponse.json({ error: "Message is too long." }, { status: 400 });

    const provider = typeof input.provider === "string" ? input.provider.trim().slice(0, 40) : "Auto AI";
    const language = typeof input.language === "string" ? input.language.trim().slice(0, 50) : "English";
    const tone = typeof input.tone === "string" ? input.tone.trim().slice(0, 80) : "Professional";
    const tool = typeof input.tool === "string" ? input.tool.trim().slice(0, 80) : "AI Agent";
    const platform = typeof input.platform === "string" ? input.platform.trim().slice(0, 80) : "General";
    const workflowContext = `CreatorFlow context: provider=${provider}; language=${language}; tone=${tone}; tool=${tool}; platform=${platform}. Follow these preferences unless the user's message explicitly overrides them.`;

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

    const result = await runAgentForUser(`${workflowContext}\n\nUser request:\n${message}`, user.id);
    return NextResponse.json({ success: true, ...result });
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
    agent: "CreatorFlow AI Agent",
    capabilities: [
      "multi-step reasoning",
      "web research",
      "content generation",
      "content planning",
      "library continuity",
      "safe external-action confirmation",
      "guarded tool execution"
    ],
    externalActionsRequireConfirmation: true
  });
}
