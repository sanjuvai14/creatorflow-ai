import { NextResponse } from "next/server";

const DEFAULT_TEXT_MODEL = "gpt-5.6-luna";

export async function GET() {
  const openai = Boolean(process.env.OPENAI_API_KEY);
  return NextResponse.json({
    success: true,
    providers: {
      openai,
      gemini: Boolean(process.env.GEMINI_API_KEY),
      anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
      grok: Boolean(process.env.XAI_API_KEY),
    },
    models: {
      openai: openai && Boolean(process.env.OPENAI_TEXT_MODEL || DEFAULT_TEXT_MODEL),
      image: Boolean(process.env.OPENAI_IMAGE_MODEL),
    },
  }, { headers: { "Cache-Control": "no-store" } });
}
