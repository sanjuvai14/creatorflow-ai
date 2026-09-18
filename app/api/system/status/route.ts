import { NextResponse } from "next/server";

export async function GET() {
  const textConfigured = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_TEXT_MODEL);
  const agentConfigured = Boolean(process.env.OPENAI_API_KEY && (process.env.OPENAI_AGENT_MODEL || process.env.OPENAI_TEXT_MODEL));
  const imageConfigured = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_IMAGE_MODEL);
  return NextResponse.json({
    ai: {
      text: textConfigured ? "connected" : "not_configured",
      agent: agentConfigured ? "connected" : "not_configured",
      image: imageConfigured ? "connected" : "not_configured",
    },
    billing: { payments: "not_enabled" },
  }, { headers: { "Cache-Control": "no-store" } });
}
