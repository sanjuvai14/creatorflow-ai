import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { tool, language, topic, tone } = await req.json();
    if (!topic?.trim()) return NextResponse.json({error:"Topic is required."},{status:400});
    const supabase = await createClient();
    const { data:{ user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({error:"Please log in first."},{status:401});

    const { data: profile } = await supabase.from("profiles").select("credits").eq("id",user.id).single();
    if ((profile?.credits ?? 0) < 1) return NextResponse.json({error:"No credits left. Please upgrade or wait for your next credit reset."},{status:402});

    let output = "";
    if (!process.env.OPENAI_API_KEY) {
      output = `[DEMO MODE]\n\nTool: ${tool}\nLanguage: ${language}\nTone: ${tone}\n\nTopic received:\n${topic}\n\nAdd OPENAI_API_KEY to .env.local to enable live AI generation.`;
    } else {
      const client = new OpenAI({apiKey:process.env.OPENAI_API_KEY});
      const prompt = `You are CreatorFlow AI, a professional content assistant. Create content for tool: ${tool}. Output language: ${language}. Tone: ${tone}. User request: ${topic}. For youtube, provide title ideas, description, tags and a script when appropriate. For shorts, provide a strong hook, short script and CTA. For social, adapt copy for Facebook, Instagram and TikTok. For product, provide title, short description, benefits, full description and SEO keywords. Keep it practical and ready to copy. Do not claim guaranteed virality or income.`;
      const response = await client.responses.create({ model: process.env.OPENAI_TEXT_MODEL || "gpt-5-mini", input: prompt });
      output = response.output_text;
    }

    const { error: genError } = await supabase.from("generations").insert({user_id:user.id,tool_type:tool,language,input_text:topic,output_text:output});
    if (genError) return NextResponse.json({error:"Could not save generation."},{status:500});
    const { data: updated, error: creditError } = await supabase.from("profiles").update({credits:(profile?.credits ?? 1)-1,updated_at:new Date().toISOString()}).eq("id",user.id).select("credits").single();
    if (creditError) return NextResponse.json({output,warning:"Content generated, but credit count could not be updated."});
    return NextResponse.json({output,credits:updated.credits});
  } catch {
    return NextResponse.json({error:"Generation failed. Check your server configuration."},{status:500});
  }
}
