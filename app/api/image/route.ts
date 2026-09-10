import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { type, prompt, text, style, aspectRatio } = await req.json();
    if (!prompt?.trim()) return NextResponse.json({ error: "Describe the image you want." }, { status: 400 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: credits, error: creditError } = await supabase.rpc("consume_credit", { p_user_id: user.id });
    if (creditError) {
      const message = creditError.message?.toLowerCase() || "";
      if (message.includes("no credits")) return NextResponse.json({ error: "No credits remaining." }, { status: 402 });
      if (message.includes("not authorized")) return NextResponse.json({ error: "Not authorized." }, { status: 403 });
      return NextResponse.json({ error: "Could not reserve a credit." }, { status: 500 });
    }

    if (!process.env.OPENAI_API_KEY) {
      const { data: refundedCredits } = await supabase.rpc("refund_credit", { p_user_id: user.id });
      return NextResponse.json({
        demo: true,
        credits: refundedCredits ?? credits,
        prompt: `DEMO IMAGE PROMPT\n\nType: ${type}\nStyle: ${style}\nRatio: ${aspectRatio}\nText: ${text || "None"}\n\n${prompt}`,
      });
    }

    try {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const size = aspectRatio === "1:1" ? "1024x1024" : "1536x1024";
      const finalPrompt = `Create a professional ${type || "creator visual"}. Visual direction: ${style || "modern cinematic"}. Requested aspect ratio: ${aspectRatio || "16:9"}. Visible text requested: ${text || "No text"}. Main brief: ${prompt}. Make it polished, high contrast, clean composition, suitable for a professional creator brand. Avoid copyrighted logos.`;
      const result = await client.images.generate({
        model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
        prompt: finalPrompt,
        size: size as "1024x1024" | "1536x1024",
        n: 1,
      });
      const image = result.data?.[0];
      if (!image?.url) {
        const { data: refundedCredits } = await supabase.rpc("refund_credit", { p_user_id: user.id });
        return NextResponse.json({ error: "AI image generation returned no image. Your credit has been returned.", credits: refundedCredits ?? credits }, { status: 502 });
      }
      return NextResponse.json({ imageUrl: image.url, revisedPrompt: image.revised_prompt || finalPrompt, credits });
    } catch {
      const { data: refundedCredits } = await supabase.rpc("refund_credit", { p_user_id: user.id });
      return NextResponse.json({ error: "AI image generation failed. Your credit has been returned; please try again.", credits: refundedCredits ?? credits }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ error: "Image generation failed. Check your API configuration." }, { status: 500 });
  }
}
