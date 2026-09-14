import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    return NextResponse.json({
      openai: Boolean(process.env.OPENAI_API_KEY),
      gemini: Boolean(process.env.GEMINI_API_KEY),
      anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
      grok: Boolean(process.env.XAI_API_KEY),
      openaiModelConfigured: Boolean(process.env.OPENAI_TEXT_MODEL),
      imageModelConfigured: Boolean(process.env.OPENAI_IMAGE_MODEL),
    });
  } catch {
    return NextResponse.json({ error: "Could not check AI configuration." }, { status: 500 });
  }
}
