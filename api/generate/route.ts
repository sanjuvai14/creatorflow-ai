import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function refundCredit(userId: string) {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("refund_credit", { p_user_id: userId });
    return { credits: error ? null : data, ok: !error };
  } catch {
    return { credits: null, ok: false };
  }
}

export async function POST(req: Request) {
  try {
    const { tool, language, topic, tone } = await req.json();
    if (!topic?.trim()) return NextResponse.json({ error: "Topic is required." }, { status: 400 });
    if (topic.trim().length > 5000) return NextResponse.json({ error: "Topic is too long. Please keep it under 5,000 characters." }, { status: 400 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Please log in first." }, { status: 401 });

    const admin = createAdminClient();
    const { data: credits, error: creditError } = await admin.rpc("consume_credit", { p_user_id: user.id });
    if (creditError) {
      const message = creditError.message?.toLowerCase() || "";
      if (message.includes("no credits")) return NextResponse.json({ error: "No credits left. Please upgrade or wait for your next credit reset." }, { status: 402 });
      if (message.includes("not authorized")) return NextResponse.json({ error: "Not authorized." }, { status: 403 });
      return NextResponse.json({ error: "Could not reserve a credit." }, { status: 500 });
    }

    let output = "";
    try {
      if (!process.env.OPENAI_API_KEY) {
        const refund = await refundCredit(user.id);
        return NextResponse.json({
          error: refund.ok ? "AI generation is not configured yet. Your credit has been returned." : "AI generation is not configured yet, and the credit could not be returned automatically.",
          credits: refund.credits ?? credits,
        }, { status: 503 });
      }

      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const prompt = `You are CreatorFlow AI, a professional content assistant. Create content for tool: ${tool}. Output language: ${language}. Tone: ${tone}. User request: ${topic}. For youtube, provide title ideas, description, tags and a script when appropriate. For shorts, provide a strong hook, short script and CTA. For social, adapt copy for Facebook, Instagram and TikTok. For product, provide title, short description, benefits, full description and SEO keywords. Keep it practical and ready to copy. Do not claim guaranteed virality or income.`;
      const response = await client.responses.create({ model: process.env.OPENAI_TEXT_MODEL || "gpt-5-mini", input: prompt });
      output = response.output_text;
    } catch {
      const refund = await refundCredit(user.id);
      return NextResponse.json({
        error: refund.ok ? "AI generation failed. Your credit has been returned; please try again." : "AI generation failed. We could not automatically return the credit. Please contact support.",
        credits: refund.credits ?? credits,
      }, { status: 502 });
    }

    const { error: genError } = await supabase.from("generations").insert({
      user_id: user.id,
      tool_type: tool,
      language,
      input_text: topic,
      output_text: output,
    });
    if (genError) {
      const refund = await refundCredit(user.id);
      return NextResponse.json({
        output,
        credits: refund.credits ?? credits,
        warning: refund.ok ? "Content generated, but history could not be saved. Your credit was returned." : "Content generated, but history could not be saved and the credit could not be returned automatically."
      }, { status: refund.ok ? 503 : 500 });
    }

    return NextResponse.json({ output, credits });
  } catch {
    return NextResponse.json({ error: "Generation failed. Check your server configuration." }, { status: 500 });
  }
}
