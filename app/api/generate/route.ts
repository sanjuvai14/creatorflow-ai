import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_TOPIC_LENGTH = 5000;
const MAX_PAYLOAD_BYTES = 12000;

async function consumeCredit(userId: string) {
  const admin = createAdminClient();
  return admin.rpc("consume_credit_service", { p_user_id: userId });
}

async function refundCredit(userId: string) {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("refund_credit", { p_user_id: userId });
    return { credits: error ? null : data, ok: !error };
  } catch {
    return { credits: null, ok: false };
  }
}

function safeString(value: unknown, max = 200) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(req: Request) {
  try {
    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > MAX_PAYLOAD_BYTES) return NextResponse.json({ error: "Request is too large." }, { status: 413 });

    const body = await req.json();
    const tool = safeString(body?.tool);
    const language = safeString(body?.language);
    const tone = safeString(body?.tone);
    const topic = typeof body?.topic === "string" ? body.topic.trim() : "";

    if (!topic) return NextResponse.json({ error: "Topic is required." }, { status: 400 });
    if (topic.length > MAX_TOPIC_LENGTH) return NextResponse.json({ error: "Topic is too long. Please keep it under 5,000 characters." }, { status: 400 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Please log in first." }, { status: 401 });

    let credits: number | null = null;
    try {
      const result = await consumeCredit(user.id);
      credits = result.data;
      if (result.error) {
        const message = result.error.message?.toLowerCase() || "";
        if (message.includes("no credits")) return NextResponse.json({ error: "No credits left. Please upgrade or wait for your next credit reset." }, { status: 402 });
        return NextResponse.json({ error: "Could not reserve a credit." }, { status: 500 });
      }
    } catch {
      return NextResponse.json({ error: "Could not reserve a credit." }, { status: 500 });
    }

    let output = "";
    try {
      if (!process.env.OPENAI_API_KEY) {
        output = `[DEMO MODE]\n\nTool: ${tool || "creator"}\nLanguage: ${language || "English"}\nTone: ${tone || "Professional"}\n\nTopic received:\n${topic}\n\nAdd OPENAI_API_KEY to .env.local to enable live AI generation.`;
      } else {
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const prompt = `You are CreatorFlow AI, a professional content assistant. Create content for tool: ${tool || "creator"}. Output language: ${language || "English"}. Tone: ${tone || "Professional"}. User request: ${topic}. For youtube, provide title ideas, description, tags and a script when appropriate. For shorts, provide a strong hook, short script and CTA. For social, adapt copy for Facebook, Instagram and TikTok. For product, provide title, short description, benefits, full description and SEO keywords. Keep it practical and ready to copy. Do not claim guaranteed virality or income.`;
        const response = await client.responses.create({ model: process.env.OPENAI_TEXT_MODEL || "gpt-5-mini", input: prompt });
        output = response.output_text;
      }
    } catch {
      const refund = await refundCredit(user.id);
      return NextResponse.json({
        error: refund.ok ? "AI generation failed. Your credit has been returned; please try again." : "AI generation failed. We could not automatically return the credit. Please contact support.",
        credits: refund.credits ?? credits,
      }, { status: 502 });
    }

    const { error: genError } = await supabase.from("generations").insert({
      user_id: user.id,
      tool_type: tool || "creator",
      language: language || "English",
      input_text: topic,
      output_text: output,
    });
    if (genError) return NextResponse.json({ output, credits, warning: "Content generated, but history could not be saved." }, { status: 200 });

    return NextResponse.json({ output, credits });
  } catch {
    return NextResponse.json({ error: "Generation failed. Check your server configuration." }, { status: 500 });
  }
}
