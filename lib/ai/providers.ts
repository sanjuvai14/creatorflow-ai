export type AIProviderName = "openai" | "gemini" | "anthropic" | "grok";

export type ProviderConfig = {
  name: AIProviderName;
  label: string;
  configured: boolean;
  model: string;
};

export function getProviderConfigs(): ProviderConfig[] {
  return [
    { name: "openai", label: "OpenAI", configured: Boolean(process.env.OPENAI_API_KEY), model: process.env.OPENAI_TEXT_MODEL || "gpt-5-mini" },
    { name: "gemini", label: "Google Gemini", configured: Boolean(process.env.GEMINI_API_KEY), model: process.env.GEMINI_TEXT_MODEL || "gemini-flash-latest" },
    { name: "anthropic", label: "Anthropic Claude", configured: Boolean(process.env.ANTHROPIC_API_KEY), model: process.env.ANTHROPIC_TEXT_MODEL || "claude-sonnet-4-5" },
    { name: "grok", label: "xAI Grok", configured: Boolean(process.env.XAI_API_KEY), model: process.env.XAI_TEXT_MODEL || "grok-4.6" },
  ];
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
