import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_PROMPT_LENGTH = 4000;

async function refundCredit(userId: string) {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("refund_credit", { p_user_id: userId });
    return { credits: error ? null : data, ok: !error };
  } catch { return { credits: null, ok: false }; }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    const aspectRatio = typeof body?.aspectRatio === "string" ? body.aspectRatio : "1:1";
    if (!prompt) return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    if (prompt.length > MAX_PROMPT_LENGTH) return NextResponse.json({ error: "Prompt is too long." }, { status: 400 });

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

    try {
      if (!process.env.OPENAI_API_KEY) {
        const refund = await refundCredit(user.id);
        return NextResponse.json({
          demo: true,
          imageUrl: null,
          revisedPrompt: prompt,
          credits: refund.credits ?? credits,
          warning: "Image generation is temporarily unavailable because the AI image service is not configured. Your credit was not used."
        }, { status: 503 });
      }
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const size = aspectRatio === "1:1" ? "1024x1024" : "1536x1024";
      const result = await client.images.generate({ model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1", prompt, size, n: 1 });
      const image = result.data?.[0];
      const imageUrl = image?.url || (image?.b64_json ? `data:image/png;base64,${image.b64_json}` : null);
      if (!imageUrl) {
        const refund = await refundCredit(user.id);
        return NextResponse.json({ error: refund.ok ? "Image generation returned no image. Your credit has been returned; please try again." : "Image generation returned no image." , credits: refund.credits ?? credits }, { status: 502 });
      }
      return NextResponse.json({ imageUrl, revisedPrompt: image?.revised_prompt || prompt, credits });
    } catch {
      const refund = await refundCredit(user.id);
      return NextResponse.json({ error: refund.ok ? "Image generation failed. Your credit has been returned; please try again." : "Image generation failed. We could not automatically return the credit.", credits: refund.credits ?? credits }, { status: 502 });
    }
  } catch { return NextResponse.json({ error: "Image generation failed. Check your server configuration." }, { status: 500 }); }
}
