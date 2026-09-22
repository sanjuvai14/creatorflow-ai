import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
const MAX_PROMPT = 4000;
const IMAGE_CREDIT_COST = 5;

export async function POST(request: Request) {
  if (process.env.IMAGE_GENERATION_ENABLED !== "true") {
    return NextResponse.json({ error: "Image generation is disabled until it is explicitly enabled and configured.", enabled: false }, { status: 503 });
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const input = body as Record<string, unknown>;
  const prompt = typeof input.prompt === "string" ? input.prompt.trim().slice(0, MAX_PROMPT) : "";
  if (!prompt) return NextResponse.json({ error: "Prompt is required." }, { status: 400 });

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_IMAGE_MODEL;
  if (!apiKey || !model) return NextResponse.json({ error: "Image provider is not configured.", enabled: false }, { status: 503 });

  const admin = createAdminClient();
  const { data: credits, error: creditError } = await admin.rpc("consume_credits", { p_user_id: user.id, p_amount: IMAGE_CREDIT_COST });
  if (creditError) {
    return NextResponse.json({ error: creditError.message.toLowerCase().includes("no credits") ? "Not enough credits for image generation." : "Could not reserve image-generation credits." }, { status: 402 });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt, size: "1024x1024", n: 1 }),
      signal: AbortSignal.timeout(60000),
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error("provider_failed");
    const url = data?.data?.[0]?.url;
    if (typeof url !== "string" || !url) throw new Error("no_image");

    return NextResponse.json({ success: true, url, model, credits: credits, creditCost: IMAGE_CREDIT_COST });
  } catch {
    const refund = await admin.rpc("refund_credits", { p_user_id: user.id, p_amount: IMAGE_CREDIT_COST });
    return NextResponse.json({
      error: refund.error ? "Image generation failed and credit refund requires support review." : "Image generation failed. Credits were returned.",
      credits: refund.data ?? credits,
    }, { status: 502 });
  }
}
