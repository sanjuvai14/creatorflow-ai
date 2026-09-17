import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_PROMPT_LENGTH = 4000;

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
    const body = await req.json().catch(() => ({}));
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    const style = typeof body?.style === "string" ? body.style.trim() : "Cinematic";
    const type = typeof body?.type === "string" ? body.type.trim() : "Visual";
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    const aspectRatio = typeof body?.aspectRatio === "string" ? body.aspectRatio : "1:1";

    if (!prompt) return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    if (prompt.length > MAX_PROMPT_LENGTH) return NextResponse.json({ error: "Prompt is too long." }, { status: 400 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Please log in first." }, { status: 401 });

    const admin = createAdminClient();
    const { data: credits, error: creditError } = await admin.rpc("consume_credit", { p_user_id: user.id });
    if (creditError) {
      const message = creditError.message?.toLowerCase() || "";
      if (message.includes("no credits")) return NextResponse.json({ error: "No credits left. Please upgrade or wait for your next credit reset." }, { status: 402 });
      if (message.includes("not authorized")) return NextResponse.json({ error: "Not authorized." }, { status: 403 });
      return NextResponse.json({ error: "Could not reserve a credit. Please try again." }, { status: 500 });
    }

    // Do not silently invoke a potentially paid image model. An explicit image
    // model must be configured before real image generation can spend credits.
    const model = process.env.OPENAI_IMAGE_MODEL?.trim();
    if (!process.env.OPENAI_API_KEY || !model) {
      const refund = await refundCredit(user.id);
      return NextResponse.json({
        imageUrl: null,
        credits: refund.credits ?? credits,
        error: refund.ok
          ? "Image generation is not configured on the server yet. Your credit was returned."
          : "Image generation is not configured on the server yet, and the credit could not be returned automatically."
      }, { status: 503 });
    }

    try {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const size = aspectRatio === "1:1" ? "1024x1024" : "1536x1024";
      const textInstruction = text
        ? `Include this exact text prominently in the design: ${text}. Keep spelling and capitalization exact.`
        : "Do not add any words, captions, logos, or watermarks unless requested.";
      const fullPrompt = [
        `Create a polished ${type} for CreatorFlow AI.`,
        `Visual style: ${style}.`,
        `Aspect ratio: ${aspectRatio}.`,
        `User brief: ${prompt}`,
        textInstruction,
        "Make the composition professional, visually clear, high contrast where appropriate, and suitable for social media publishing."
      ].join("\n");

      const result = await client.images.generate({ model, prompt: fullPrompt, size, n: 1 });
      const image = result.data?.[0];
      const imageUrl = image?.url || (image?.b64_json ? `data:image/png;base64,${image.b64_json}` : null);

      if (!imageUrl) {
        const refund = await refundCredit(user.id);
        return NextResponse.json({
          error: refund.ok ? "Image generation returned no image. Your credit has been returned; please try again." : "Image generation returned no image.",
          credits: refund.credits ?? credits
        }, { status: 502 });
      }

      return NextResponse.json({ imageUrl, revisedPrompt: image?.revised_prompt || fullPrompt, credits });
    } catch (error) {
      console.error("CreatorFlow image generation failed", {
        model,
        error: error instanceof Error ? error.message : String(error)
      });
      const refund = await refundCredit(user.id);
      return NextResponse.json({
        error: refund.ok ? "Image generation failed. Your credit has been returned; please try again." : "Image generation failed. We could not automatically return the credit.",
        credits: refund.credits ?? credits
      }, { status: 502 });
    }
  } catch (error) {
    console.error("CreatorFlow image route failed", error);
    return NextResponse.json({ error: "Image generation failed. Check your server configuration." }, { status: 500 });
  }
}
