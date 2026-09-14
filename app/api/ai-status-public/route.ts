import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    providers: {
      openai: Boolean(process.env.OPENAI_API_KEY),
      gemini: Boolean(process.env.GEMINI_API_KEY),
      anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
      grok: Boolean(process.env.XAI_API_KEY),
    },
    models: {
      openai: Boolean(process.env.OPENAI_TEXT_MODEL),
      image: Boolean(process.env.OPENAI_IMAGE_MODEL),
    },
  }, { headers: { "Cache-Control": "no-store" } });
}
