import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    aiReady: Boolean(process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.XAI_API_KEY),
    openai: Boolean(process.env.OPENAI_API_KEY),
    gemini: Boolean(process.env.GEMINI_API_KEY),
    anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
    grok: Boolean(process.env.XAI_API_KEY),
    textModelConfigured: Boolean(process.env.OPENAI_TEXT_MODEL),
    imageModelConfigured: Boolean(process.env.OPENAI_IMAGE_MODEL),
  });
}
