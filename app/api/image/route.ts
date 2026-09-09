import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile, error: profileError } = await supabase.from("profiles").select("credits").eq("id", user.id).single();
    if (profileError || !profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    if ((profile.credits ?? 0) < 1) return NextResponse.json({ error: "No credits remaining." }, { status: 402 });

    const { type, prompt, text, style, aspectRatio } = await req.json();
    if (!prompt?.trim()) return NextResponse.json({ error: "Describe the image you want." }, { status: 400 });

    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ demo: true, prompt: `DEMO IMAGE PROMPT\n\nType: ${type}\nStyle: ${style}\nRatio: ${aspectRatio}\nText: ${text || "None"}\n\n${prompt}` });

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const size = aspectRatio === "1:1" ? "1024x1024" : "1536x1024";
    const finalPrompt = `Create a professional ${type || "creator visual"}. Visual direction: ${style || "modern cinematic"}. Requested aspect ratio: ${aspectRatio || "16:9"}. Visible text requested: ${text || "No text"}. Main brief: ${prompt}. Make it polished, high contrast, clean composition, suitable for a professional creator brand. Avoid copyrighted logos.`;
    const result = await client.images.generate({ model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1", prompt: finalPrompt, size: size as "1024x1024" | "1536x1024", n: 1 });
    const image = result.data?.[0];

    const { error: creditError } = await supabase.from("profiles").update({ credits: (profile.credits ?? 1) - 1 }).eq("id", user.id).gte("credits", 1);
    if (creditError) return NextResponse.json({ error: "Image generated, but credit update failed." }, { status: 500 });

    return NextResponse.json({ imageUrl: image?.url || null, revisedPrompt: image?.revised_prompt || finalPrompt });
  } catch {
    return NextResponse.json({ error: "Image generation failed. Check your API configuration." }, { status: 500 });
  }
}
