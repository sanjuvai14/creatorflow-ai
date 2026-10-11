import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const openAiKey = Boolean(process.env.OPENAI_API_KEY?.trim());
  const textConfigured = openAiKey && Boolean((process.env.OPENAI_TEXT_MODEL || "gpt-5-mini").trim());
  const agentConfigured = openAiKey && Boolean((process.env.OPENAI_AGENT_MODEL || process.env.OPENAI_TEXT_MODEL || "gpt-5-mini").trim());
  const imageConfigured = openAiKey && Boolean((process.env.OPENAI_IMAGE_MODEL || "gpt-image-2").trim());
  const paymentsConfigured =
    process.env.PADDLE_BILLING_ENABLED === "true" &&
    Boolean(process.env.PADDLE_API_KEY?.trim()) &&
    Boolean(process.env.PADDLE_WEBHOOK_SECRET_KEY?.trim()) &&
    Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) &&
    Boolean(process.env.NEXT_PUBLIC_APP_URL?.trim());

  return NextResponse.json({
    ai: {
      text: textConfigured ? "connected" : "not_configured",
      agent: agentConfigured ? "connected" : "not_configured",
      image: imageConfigured ? "connected" : "not_configured",
    },
    billing: { payments: paymentsConfigured ? "connected" : "not_enabled" },
  }, { headers: { "Cache-Control": "no-store" } });
}
