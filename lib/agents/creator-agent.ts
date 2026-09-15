import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type AgentToolContext = { userId: string };

type ToolDef = {
  type: "function";
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  strict?: boolean;
};

export const CREATOR_AGENT_TOOLS: ToolDef[] = [
  {
    type: "function",
    name: "create_content_asset",
    description: "Create a copy-ready creator asset from a user goal. Use for YouTube, Instagram, TikTok, Facebook, LinkedIn, X, Pinterest, Shopify and general business content.",
    parameters: {
      type: "object",
      properties: {
        platform: { type: "string" },
        asset_type: { type: "string" },
        topic: { type: "string" },
        language: { type: "string" },
        tone: { type: "string" }
      },
      required: ["platform", "asset_type", "topic", "language", "tone"],
      additionalProperties: false
    },
    strict: true
  },
  {
    type: "function",
    name: "save_content",
    description: "Save user-approved generated content to the CreatorFlow library. Never use for secrets or sensitive personal data.",
    parameters: {
      type: "object",
      properties: { title: { type: "string" }, content: { type: "string" }, tool_type: { type: "string" } },
      required: ["title", "content", "tool_type"],
      additionalProperties: false
    },
    strict: true
  },
  {
    type: "function",
    name: "get_recent_content",
    description: "Read the user's recent saved generations to maintain continuity.",
    parameters: {
      type: "object",
      properties: { limit: { type: "integer", minimum: 1, maximum: 20 } },
      required: ["limit"],
      additionalProperties: false
    },
    strict: true
  },
  {
    type: "function",
    name: "build_content_plan",
    description: "Build a multi-platform content plan with topics, formats, hooks and scheduling suggestions. Does not publish anything.",
    parameters: {
      type: "object",
      properties: {
        goal: { type: "string" },
        platforms: { type: "array", items: { type: "string" } },
        days: { type: "integer", minimum: 1, maximum: 30 },
        language: { type: "string" }
      },
      required: ["goal", "platforms", "days", "language"],
      additionalProperties: false
    },
    strict: true
  },
  {
    type: "function",
    name: "request_external_action_confirmation",
    description: "Prepare a confirmation request for an external or irreversible action such as publishing, sending, connecting an account, or spending money. This tool never performs the action.",
    parameters: {
      type: "object",
      properties: { action: { type: "string" }, details: { type: "string" } },
      required: ["action", "details"],
      additionalProperties: false
    },
    strict: true
  }
];

function clean(value: unknown, max = 6000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

async function executeTool(name: string, args: Record<string, unknown>, ctx: AgentToolContext) {
  if (name === "get_recent_content") {
    const supabase = await createClient();
    const limit = Math.min(20, Math.max(1, Number(args.limit) || 10));
    const { data, error } = await supabase
      .from("generations")
      .select("id,tool_type,language,input_text,output_text,created_at")
      .eq("user_id", ctx.userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error("Could not read recent content.");
    return { items: data ?? [] };
  }

  if (name === "save_content") {
    const supabase = await createClient();
    const title = clean(args.title, 160);
    const content = clean(args.content, 20000);
    const toolType = clean(args.tool_type, 100) || "agent";
    if (!title || !content) throw new Error("Title and content are required.");
    const { data, error } = await supabase.from("saved_content").insert({
      user_id: ctx.userId,
      title,
      content,
      tool_type: toolType
    }).select("id,title,created_at").single();
    if (error) throw new Error("Could not save content to the library.");
    return { saved: true, item: data };
  }

  if (name === "build_content_plan") {
    const goal = clean(args.goal, 2000);
    const platforms = Array.isArray(args.platforms) ? args.platforms.slice(0, 8).map((v) => clean(v, 40)).filter(Boolean) : [];
    const days = Math.min(30, Math.max(1, Number(args.days) || 7));
    const language = clean(args.language, 40) || "English";
    const plan = Array.from({ length: days }, (_, index) => ({
      day: index + 1,
      platforms,
      focus: `Day ${index + 1}: advance the goal — ${goal}`,
      language
    }));
    return { plan };
  }

  if (name === "create_content_asset") {
    return {
      ready: true,
      instruction: "Create the requested asset in the final response using the supplied platform, asset type, topic, language and tone. Keep it copy-ready and clearly labeled.",
      request: args
    };
  }

  if (name === "request_external_action_confirmation") {
    return {
      confirmationRequired: true,
      action: clean(args.action, 300),
      details: clean(args.details, 2000),
      message: "The requested external action is prepared but not executed. Ask the user for explicit confirmation before any publish, send, account connection, or payment action."
    };
  }

  throw new Error(`Unknown agent tool: ${name}`);
}

export async function runCreatorAgent(input: string, ctx: AgentToolContext) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("AI provider is not configured.");

  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_AGENT_MODEL || process.env.OPENAI_TEXT_MODEL || "gpt-5.6-luna";
  const instructions = `You are CreatorFlow AI Agent, an autonomous creator and business workspace agent.\n\nYou can reason across multi-step tasks, use approved tools, remember recent CreatorFlow content, and prepare creator workflows. Prefer the simplest reliable tool sequence. Never claim an action happened unless a tool actually completed it. Never fabricate analytics or live metrics. Never promise guaranteed followers, virality, watch time, sales or income.\n\nExternal actions (publishing, sending messages, connecting accounts, financial/payment actions, or other irreversible actions) require explicit user confirmation immediately before execution. The current toolset intentionally does not execute those actions.\n\nUse the user's language when practical. Return concise but useful results. For content requests, produce copy-ready output. For multi-step requests, complete as much as possible autonomously, then report what was completed and what requires confirmation.`;

  const tools = [
    ...CREATOR_AGENT_TOOLS,
    { type: "web_search" }
  ] as any;

  let response = await client.responses.create({ model, instructions, input, tools, store: false });
  const maxTurns = 6;

  for (let turn = 0; turn < maxTurns; turn += 1) {
    const calls = (response.output ?? []).filter((item: any) => item?.type === "function_call") as any[];
    if (!calls.length) return { output: response.output_text?.trim() || "I completed the request, but there was no text response.", model };

    const toolOutputs: any[] = [];
    for (const call of calls) {
      let result: unknown;
      try {
        const args = JSON.parse(call.arguments || "{}");
        result = await executeTool(call.name, args, ctx);
      } catch (error) {
        result = { error: error instanceof Error ? error.message : "Tool execution failed." };
      }
      toolOutputs.push({ type: "function_call_output", call_id: call.call_id, output: JSON.stringify(result) });
    }

    response = await client.responses.create({
      model,
      instructions,
      previous_response_id: response.id,
      input: toolOutputs,
      tools,
      store: false
    });
  }

  return { output: response.output_text?.trim() || "The agent reached its safe execution limit. Please continue with the next step.", model };
}

export async function runAgentForUser(input: string, userId: string) {
  const admin = createAdminClient();
  const { data: credits, error } = await admin.rpc("consume_credit", { p_user_id: userId });
  if (error) throw new Error(error.message || "Could not reserve a credit.");
  try {
    const result = await runCreatorAgent(input, { userId });
    return { ...result, credits };
  } catch (error) {
    try { await admin.rpc("refund_credit", { p_user_id: userId }); } catch {}
    throw error;
  }
}
