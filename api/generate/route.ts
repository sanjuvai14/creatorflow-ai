import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProviderConfigs, getProviderOrder, type AIProviderName } from "@/lib/ai/providers";

async function refundCredit(userId: string) {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("refund_credit", { p_user_id: userId });
    return { credits: error ? null : data, ok: !error };
  } catch {
    return { credits: null, ok: false };
  }
}

function buildPrompt(tool: string, language: string, topic: string, tone: string) {
  return `You are CreatorFlow AI, a professional creator and business assistant. Tool: ${tool}. Output language: ${language || "English"}. Tone: ${tone || "professional"}. User request: ${topic}. Produce useful, accurate, ready-to-copy work. For YouTube, include title ideas, description, tags and script when appropriate. For Shorts/Reels, include a strong hook, concise script and CTA. For social content, adapt for Facebook, Instagram, TikTok and LinkedIn when relevant. For products, include title, short description, benefits, full description and SEO keywords. Never promise guaranteed virality, followers, income or business results. If the user asks for current facts, clearly state when live data is unavailable.`;
}

async function generateOpenAI(prompt: string, model: string) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.responses.create({ model, input: prompt });
  return response.output_text?.trim() || "";
}

async function generateGemini(prompt: string, model: string) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY || "")}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] }),
  });
  if (!response.ok) throw new Error(`Gemini ${response.status}`);
  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("").trim() || "";
}

async function generateAnthropic(prompt: string, model: string) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({ model, max_tokens: 4096, messages: [{ role: "user", content: prompt }] }),
  });
  if (!response.ok) throw new Error(`Anthropic ${response.status}`);
  const data = await response.json();
  return data?.content?.filter((item: { type?: string }) => item.type === "text").map((item: { text?: string }) => item.text || "").join("").trim() || "";
}

async function generateGrok(prompt: string, model: string) {
  const client = new OpenAI({ apiKey: process.env.XAI_API_KEY, baseURL: "https://api.x.ai/v1" });
  const response = await client.responses.create({ model, input: prompt });
  return response.output_text?.trim() || "";
}

async function generateWithProvider(provider: AIProviderName, model: string, prompt: string) {
  if (provider === "openai") return generateOpenAI(prompt, model);
  if (provider === "gemini") return generateGemini(prompt, model);
  if (provider === "anthropic") return generateAnthropic(prompt, model);
  return generateGrok(prompt, model);
}

export async function POST(req: Request) {
  try {
    const { tool, language, topic, tone, provider = "auto" } = await req.json();
    if (!topic?.trim()) return NextResponse.json({ error: "Topic is required." }, { status: 400 });
    if (topic.trim().length > 5000) return NextResponse.json({ error: "Topic is too long. Please keep it under 5,000 characters." }, { status: 400 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Please log in first." }, { status: 401 });

    const admin = createAdminClient();
    const { data: credits, error: creditError } = await admin.rpc("consume_credit", { p_user_id: user.id });
    if (creditError) {
      const message = creditError.message?.toLowerCase() || "";
      if (message.includes("no credits")) return NextResponse.json({ error: "No credits left. Please upgrade or wait for your next credit reset." }, { status: 402 });
      if (message.includes("not authorized")) return NextResponse.json({ error: "Not authorized." }, { status: 403 });
      return NextResponse.json({ error: "Could not reserve a credit." }, { status: 500 });
    }

    const configs = getProviderConfigs();
    const order = getProviderOrder(provider);
    if (!order.length) {
      const refund = await refundCredit(user.id);
      return NextResponse.json({ error: refund.ok ? "No AI provider is connected yet. Your credit was returned." : "No AI provider is connected yet, and the credit could not be returned automatically.", credits: refund.credits ?? credits }, { status: 503 });
    }

    const prompt = buildPrompt(tool, language, topic.trim(), tone);
    let output = "";
    let usedProvider: AIProviderName | null = null;
    const failures: string[] = [];

    for (const name of order) {
      const config = configs.find((item) => item.name === name);
      if (!config) continue;
      try {
        const result = await generateWithProvider(name, config.model, prompt);
        if (result) {
          output = result;
          usedProvider = name;
          break;
        }
        failures.push(`${name}: empty result`);
      } catch (error) {
        failures.push(`${name}: ${error instanceof Error ? error.message : "request failed"}`);
      }
    }

    if (!output || !usedProvider) {
      const refund = await refundCredit(user.id);
      return NextResponse.json({ error: refund.ok ? "All connected AI providers failed. Your credit was returned; please try again." : "All connected AI providers failed, and the credit could not be returned automatically. Please contact support.", credits: refund.credits ?? credits, diagnostics: process.env.NODE_ENV === "development" ? failures : undefined }, { status: 502 });
    }

    const { error: genError } = await supabase.from("generations").insert({ user_id: user.id, tool_type: tool, language, input_text: topic, output_text: output });
    if (genError) {
      const refund = await refundCredit(user.id);
      return NextResponse.json({ output, provider: usedProvider, credits: refund.credits ?? credits, warning: refund.ok ? "Content generated, but history could not be saved. Your credit was returned." : "Content generated, but history could not be saved and the credit could not be returned automatically." }, { status: refund.ok ? 503 : 500 });
    }

    return NextResponse.json({ output, provider: usedProvider, credits });
  } catch {
    return NextResponse.json({ error: "Generation failed. Check your server configuration." }, { status: 500 });
  }
}
