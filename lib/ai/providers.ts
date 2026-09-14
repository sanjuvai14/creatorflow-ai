export type AIProviderName = "openai" | "gemini" | "anthropic" | "grok";
export type AIProviderId = AIProviderName | "auto";

export type ProviderConfig = {
  name: AIProviderName;
  label: string;
  configured: boolean;
  model: string;
};

/** Universal provider registry. Credentials remain server-side. */
export function getProviderConfigs(): ProviderConfig[] {
  return [
    { name: "openai", label: "OpenAI", configured: Boolean(process.env.OPENAI_API_KEY), model: process.env.OPENAI_TEXT_MODEL || "gpt-5-mini" },
    { name: "gemini", label: "Google Gemini", configured: Boolean(process.env.GEMINI_API_KEY), model: process.env.GEMINI_TEXT_MODEL || "gemini-flash-latest" },
    { name: "anthropic", label: "Anthropic Claude", configured: Boolean(process.env.ANTHROPIC_API_KEY), model: process.env.ANTHROPIC_TEXT_MODEL || "claude-sonnet-4-5" },
    { name: "grok", label: "xAI Grok", configured: Boolean(process.env.XAI_API_KEY), model: process.env.XAI_TEXT_MODEL || "grok-4.6" },
  ];
}

export function providerIsConfigured(provider: AIProviderId): boolean {
  if (provider === "auto") return getProviderConfigs().some((item) => item.configured);
  return getProviderConfigs().some((item) => item.name === provider && item.configured);
}

export function resolveProvider(preferred?: AIProviderId | string): AIProviderName | null {
  const configured = getProviderConfigs().filter((item) => item.configured).map((item) => item.name);
  if (!configured.length) return null;
  if (preferred && preferred !== "auto" && configured.includes(preferred as AIProviderName)) return preferred as AIProviderName;
  const envPreferred = process.env.AI_PROVIDER?.trim().toLowerCase();
  if (envPreferred && configured.includes(envPreferred as AIProviderName)) return envPreferred as AIProviderName;
  return configured[0];
}

export function getProviderOrder(preferred?: string): AIProviderName[] {
  const configured = getProviderConfigs().filter((provider) => provider.configured).map((provider) => provider.name);
  if (preferred && preferred !== "auto" && configured.includes(preferred as AIProviderName)) {
    return [preferred as AIProviderName, ...configured.filter((name) => name !== preferred)];
  }
  return configured;
}

export function getProviderStatus() {
  return getProviderConfigs().map(({ name, label, configured, model }) => ({ name, label, configured, model: configured ? model : null }));
}
