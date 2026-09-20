import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MAX_PROMPT = 4000;

export async function POST(request: Request) {
  if (process.env.IMAGE_GENERATION_ENABLED !== "true") {
    return NextResponse.json(
      { error: "Image generation is disabled until it is explicitly enabled and configured.", enabled: false },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const prompt = typeof (body as any)?.prompt === "string" ? (body as any).prompt.trim().slice(0, MAX_PROMPT) : "";
  if (!prompt) return NextResponse.json({ error: "Prompt is required." }, { status: 400 });

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_IMAGE_MODEL;
  if (!apiKey || !model) {
    return NextResponse.json({ error: "Image provider is not configured.", enabled: false }, { status: 503 });
  }

  // Paid provider use is deliberately gated by IMAGE_GENERATION_ENABLED.
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, size: "1024x1024", n: 1 })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) return NextResponse.json({ error: "Image provider request failed." }, { status: 502 });
  const url = data?.data?.[0]?.url;
  if (typeof url !== "string" || !url) return NextResponse.json({ error: "Image provider returned no image." }, { status: 502 });

  return NextResponse.json({ success: true, url, model });
}
