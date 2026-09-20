import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveProvider, providerIsConfigured, type AIProviderId } from "@/lib/ai/providers";

export type AgentToolContext = { userId: string };

type ToolDef = {
  type: "function";
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  strict?: boolean;
};

const string = { type: "string" };

export const CREATOR_AGENT_TOOLS: ToolDef[] = [
  { type: "function", name: "create_content_asset", description: "Create copy-ready creator content for YouTube, Shorts, Instagram, TikTok, Facebook, LinkedIn, X, Pinterest, Shopify and business use.", parameters: { type: "object", properties: { platform: string, asset_type: string, topic: string, language: string, tone: string }, required: ["platform", "asset_type", "topic", "language", "tone"], additionalProperties: false }, strict: true },
  { type: "function", name: "create_thumbnail_brief", description: "Create a production-ready thumbnail or banner brief with hook, composition, text, subject, background and image-generation prompt. Does not spend money or call an image provider.", parameters: { type: "object", properties: { platform: string, topic: string, style: string, language: string }, required: ["platform", "topic", "style", "language"], additionalProperties: false }, strict: true },
  { type: "function", name: "build_video_storyboard", description: "Build a scene-by-scene video plan with timing, visuals, narration, on-screen text and editing notes.", parameters: { type: "object", properties: { topic: string, duration_seconds: { type: "integer", minimum: 15, maximum: 3600 }, platform: string, language: string }, required: ["topic", "duration_seconds", "platform", "language"], additionalProperties: false }, strict: true },
  { type: "function", name: "repurpose_content", description: "Turn one source idea or text into coordinated platform-specific variants without publishing them.", parameters: { type: "object", properties: { source: string, platforms: { type: "array", items: string }, language: string }, required: ["source", "platforms", "language"], additionalProperties: false }, strict: true },
  { type: "function", name: "growth_audit", description: "Give a practical content/growth audit from information the user supplies. Never invent live metrics or guarantee growth.", parameters: { type: "object", properties: { platform: string, goal: string, current_data: string }, required: ["platform", "goal", "current_data"], additionalProperties: false }, strict: true },
  { type: "function", name: "save_content", description: "Save user-approved generated content to the CreateSoul library. Only use when the user explicitly asks to save it.", parameters: { type: "object", properties: { title: string, content: string, tool_type: string }, required: ["title", "content", "tool_type"], additionalProperties: false }, strict: true },
  { type: "function", name: "get_recent_content", description: "Read the user's recent generations to maintain continuity.", parameters: { type: "object", properties: { limit: { type: "integer", minimum: 1, maximum: 20 } }, required: ["limit"], additionalProperties: false }, strict: true },
  { type: "function", name: "build_content_plan", description: "Build a multi-platform content plan with topics, formats, hooks and scheduling suggestions. Does not publish anything.", parameters: { type: "object", properties: { goal: string, platforms: { type: "array", items: string }, days: { type: "integer", minimum: 1, maximum: 30 }, language: string }, required: ["goal", "platforms", "days", "language"], additionalProperties: false }, strict: true },
  { type: "function", name: "prepare_schedule", description: "Turn a content plan into a clear posting schedule. It only prepares the schedule; it never publishes or creates external calendar events.", parameters: { type: "object", properties: { plan: string, timezone: string, start_date: string }, required: ["plan", "timezone", "start_date"], additionalProperties: false }, strict: true },
  { type: "function", name: "request_external_action_confirmation", description: "Prepare a confirmation request for publishing, sending, connecting an account, payment or another irreversible external action. This tool never performs the action.", parameters: { type: "object", properties: { action: string, details: string }, required: ["action", "details"], additionalProperties: false }, strict: true }
];

function clean(value: unknown, max = 6000) { return typeof value === "string" ? value.trim().slice(0, max) : ""; }

async function executeTool(name: string, args: Record<string, unknown>, ctx: AgentToolContext) {
  if (name === "get_recent_content") {
    const supabase = await createClient();
    const limit = Math.min(20, Math.max(1, Number(args.limit) || 10));
    const { data, error } = await supabase.from("generations").select("id,tool_type,language,input_text,output_text,created_at").eq("user_id", ctx.userId).order("created_at", { ascending: false }).limit(limit);
    if (error) throw new Error("Could not read recent content.");
    return { items: data ?? [] };
  }
  if (name === "save_content") {
    const supabase = await createClient();
    const title = clean(args.title, 160); const content = clean(args.content, 20000); const toolType = clean(args.tool_type, 100) || "agent";
    if (!title || !content) throw new Error("Title and content are required.");
    const { data, error } = await supabase.from("saved_content").insert({ user_id: ctx.userId, title, content, tool_type: toolType }).select("id,title,created_at").single();
    if (error) throw new Error("Could not save content to the library.");
    return { saved: true, item: data };
  }
  if (name === "create_content_asset") return { ready: true, instruction: "Create the requested asset in the final response using the supplied platform, asset type, topic, language and tone. Keep it copy-ready and clearly labeled.", request: args };
  if (name === "create_thumbnail_brief") return { brief: { platform: clean(args.platform, 50), topic: clean(args.topic, 1000), style: clean(args.style, 300), language: clean(args.language, 50), required_sections: ["Hook", "Thumbnail text", "Main subject", "Composition", "Background", "Lighting/style", "Image-generation prompt", "Safe-area note"] } };
  if (name === "build_video_storyboard") {
    const duration = Math.min(3600, Math.max(15, Number(args.duration_seconds) || 60));
    const scenes = Math.max(3, Math.min(20, Math.ceil(duration / 15)));
    return { topic: clean(args.topic, 1000), platform: clean(args.platform, 50), language: clean(args.language, 50), duration_seconds: duration, scenes: Array.from({ length: scenes }, (_, i) => ({ scene: i + 1, start_seconds: Math.round((duration / scenes) * i), end_seconds: Math.round((duration / scenes) * (i + 1)), visual: "Generate from the scene goal", narration: "Write concise narration", on_screen_text: "Key message", edit_note: "Use a clean transition" })) };
  }
  if (name === "repurpose_content") {
    const platforms = Array.isArray(args.platforms) ? args.platforms.slice(0, 10).map((v) => clean(v, 40)).filter(Boolean) : [];
    return { source: clean(args.source, 12000), language: clean(args.language, 50), variants: platforms.map((platform) => ({ platform, instruction: `Adapt the source for ${platform} with native formatting, hook and CTA. Do not publish.` })) };
  }
  if (name === "growth_audit") return { platform: clean(args.platform, 50), goal: clean(args.goal, 1000), current_data: clean(args.current_data, 6000), audit_framework: ["Positioning", "Hook", "Content format", "Consistency", "Audience fit", "CTA", "Packaging", "Next experiments"], note: "This is an analysis framework based only on supplied data; no live metrics are claimed." };
  if (name === "build_content_plan") {
    const goal = clean(args.goal, 2000); const platforms = Array.isArray(args.platforms) ? args.platforms.slice(0, 8).map((v) => clean(v, 40)).filter(Boolean) : []; const days = Math.min(30, Math.max(1, Number(args.days) || 7)); const language = clean(args.language, 40) || "English";
    return { plan: Array.from({ length: days }, (_, index) => ({ day: index + 1, platforms, focus: `Day ${index + 1}: advance the goal — ${goal}`, language })) };
  }
  if (name === "prepare_schedule") return { prepared: true, schedule: { plan: clean(args.plan, 12000), timezone: clean(args.timezone, 80), start_date: clean(args.start_date, 30) }, note: "Prepared only; no external calendar or platform was changed." };
  if (name === "request_external_action_confirmation") return { confirmationRequired: true, action: clean(args.action, 300), details: clean(args.details, 2000), message: "The requested external action is prepared but not executed. Ask the user for explicit confirmation before any publish, send, account connection, or payment action." };
  throw new Error(`Unknown agent tool: ${name}`);
}

export async function runCreatorAgent(input: string, ctx: AgentToolContext, preferredProvider?: AIProviderId | string) {
  const provider = resolveProvider(preferredProvider);
  if (!provider) throw new Error("No configured AI provider is available.");
  if (provider !== "openai") throw new Error(`The selected AI provider (${provider}) is configured but this agent currently supports OpenAI execution only.`);
  if (!providerIsConfigured("openai")) throw new Error("OpenAI is not configured for agent execution.");
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_AGENT_MODEL || process.env.OPENAI_TEXT_MODEL;
  if (!apiKey || !model) throw new Error("OpenAI is not configured for agent execution.");
  const client = new OpenAI({ apiKey });
  const instructions = `You are CreateSoul AI Agent, the central creator/business worker inside CreateSoul AI. Use tools to complete multi-step creator workflows. You can create content, thumbnail briefs, video storyboards, repurpose content, prepare growth audits, read recent content, save explicitly approved content, build content plans and prepare schedules. Use web search when fresh public information is needed. Prefer the simplest reliable tool sequence. Never claim an action happened unless a tool actually completed it. Never fabricate analytics or live metrics. Never promise guaranteed followers, virality, watch time, sales or income. Save content only after the user explicitly asks to save it. External actions (publishing, sending messages, connecting accounts, financial/payment actions, or other irreversible actions) require explicit user confirmation immediately before execution; the current toolset intentionally does not execute them. Never expose secrets or ask the user to paste private API keys into chat. Use the user's language when practical. Return concise but useful, copy-ready results.`;
  const tools = [...CREATOR_AGENT_TOOLS, { type: "web_search" }] as any;
  let response = await client.responses.create({ model, instructions, input, tools });
  const maxTurns = 8;
  for (let turn = 0; turn < maxTurns; turn += 1) {
    const calls = (response.output ?? []).filter((item: any) => item?.type === "function_call") as any[];
    if (!calls.length) return { output: response.output_text?.trim() || "I completed the request, but there was no text response.", model, provider };
    const toolOutputs: any[] = [];
    for (const call of calls) {
      let result: unknown;
      try { result = await executeTool(call.name, JSON.parse(call.arguments || "{}"), ctx); }
      catch (error) { result = { error: error instanceof Error ? error.message : "Tool execution failed." }; }
      toolOutputs.push({ type: "function_call_output", call_id: call.call_id, output: JSON.stringify(result) });
    }
    response = await client.responses.create({ model, instructions, previous_response_id: response.id, input: toolOutputs, tools });
  }
  return { output: response.output_text?.trim() || "The agent reached its safe execution limit. Please continue with the next step.", model };
}

export async function runAgentForUser(input: string, userId: string, preferredProvider?: AIProviderId | string) {
  const admin = createAdminClient();
  const { data: credits, error } = await admin.rpc("consume_credit", { p_user_id: userId });
  if (error) throw new Error(error.message || "Could not reserve a credit.");
  try { const result = await runCreatorAgent(input, { userId }, preferredProvider); return { ...result, credits }; }
  catch (error) { try { await admin.rpc("refund_credit", { p_user_id: userId }); } catch {} throw error; }
}
