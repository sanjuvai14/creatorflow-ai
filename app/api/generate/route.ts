import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { tool, language, topic, tone } = await req.json();
    if (!topic?.trim()) return NextResponse.json({ error: "Topic is required." }, { status: 400 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Please log in first." }, { status: 401 });

    const { data: credits, error: creditError } = await supabase.rpc("consume_credit", { p_user_id: user.id });
    if (creditError) {
      const message = creditError.message?.toLowerCase() || "";
      if (message.includes("no credits")) return NextResponse.json({ error: "No credits left. Please upgrade or wait for your next credit reset." }, { status: 402 });
      if (message.includes("not authorized")) return NextResponse.json({ error: "Not authorized." }, { status: 403 });
      return NextResponse.json({ error: "Could not reserve a credit." }, { status: 500 });
    }

    let output = "";
    try {
      if (!process.env.OPENAI_API_KEY) {
        output = `[DEMO MODE]\n\nTool: ${tool}\nLanguage: ${language}\nTone: ${tone}\n\nTopic received:\n${topic}\n\nAdd OPENAI_API_KEY to .env.local to enable live AI generation.`;
      } else {
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const prompt = `You are CreatorFlow AI, a professional content assistant. Create content for tool: ${tool}. Output language: ${language}. Tone: ${tone}. User request: ${topic}. For youtube, provide title ideas, description, tags and a script when appropriate. For shorts, provide a strong hook, short script and CTA. For social, adapt copy for Facebook, Instagram and TikTok. For product, provide title, short description, benefits, full description and SEO keywords. Keep it practical and ready to copy. Do not claim guaranteed virality or income.`;
        const response = await client.responses.create({ model: process.env.OPENAI_TEXT_MODEL || "gpt-5-mini", input: prompt });
        output = response.output_text;
      }
    } catch {
      return NextResponse.json({ error: "AI generation failed. Your credit was reserved; please try again." }, { status: 502 });
    }

    const { error: genError } = await supabase.from("generations").insert({
      user_id: user.id,
      tool_type: tool,
      language,
      input_text: topic,
      output_text: output,
    });
    if (genError) return NextResponse.json({ output, credits, warning: "Content generated, but history could not be saved." }, { status: 200 });

    return NextResponse.json({ output, credits });
  } catch {
    return NextResponse.json({ error: "Generation failed. Check your server configuration." }, { status: 500 });
  }
}
