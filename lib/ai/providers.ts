export type AIProviderId = "auto" | "openai" | "gemini" | "anthropic" | "grok";

export type AIProvider = {
  id: Exclude<AIProviderId, "auto">;
  name: string;
  description: string;
  envKey: string;
  defaultModel: string;
};

export const AI_PROVIDERS: AIProvider[] = [
  { id: "openai", name: "OpenAI", description: "Chat, reasoning and creator workflows", envKey: "OPENAI_API_KEY", defaultModel: process.env.OPENAI_TEXT_MODEL || "gpt-5-mini" },
  { id: "gemini", name: "Google Gemini", description: "Multimodal and fast creator workflows", envKey: "GEMINI_API_KEY", defaultModel: process.env.GEMINI_TEXT_MODEL || "gemini-3.6-flash" },
  { id: "anthropic", name: "Claude", description: "Long-form writing and analysis", envKey: "ANTHROPIC_API_KEY", defaultModel: process.env.ANTHROPIC_TEXT_MODEL || "claude-sonnet-4-5" },
  { id: "grok", name: "Grok", description: "Additional AI provider connector", envKey: "XAI_API_KEY", defaultModel: process.env.XAI_TEXT_MODEL || "grok-4-1-fast" },
];

export function providerIsConfigured(id: Exclude<AIProviderId, "auto">) {
  const provider = AI_PROVIDERS.find((item) => item.id === id);
  return Boolean(provider && process.env[provider.envKey]);
}

export function getConfiguredProviders() {
  return AI_PROVIDERS.filter((provider) => Boolean(process.env[provider.envKey]));
}

export function resolveProvider(requested: AIProviderId): Exclude<AIProviderId, "auto"> | null {
  if (requested !== "auto") return providerIsConfigured(requested) ? requested : null;
  const preferred = ["openai", "gemini", "anthropic", "grok"] as const;
  return preferred.find((id) => providerIsConfigured(id)) || null;
}
