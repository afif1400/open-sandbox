export type ProviderId = "anthropic" | "google" | "groq";

export type ModelOption = {
  id: string;
  label: string;
  subtitle?: string;
};

export type ProviderInfo = {
  id: ProviderId;
  label: string;
  short: string;
  keyPlaceholder: string;
  keyHint: string;
  keyDocsUrl: string;
  defaultModel: string;
  models: ModelOption[];
};

export const PROVIDER_ORDER: ProviderId[] = ["anthropic", "google", "groq"];

export const PROVIDERS: Record<ProviderId, ProviderInfo> = {
  anthropic: {
    id: "anthropic",
    label: "Anthropic",
    short: "ANT",
    keyPlaceholder: "sk-ant-api03-…",
    keyHint: "console.anthropic.com → API keys",
    keyDocsUrl: "https://console.anthropic.com/settings/keys",
    defaultModel: "claude-sonnet-4-6",
    models: [
      { id: "claude-opus-4-7", label: "claude-opus-4-7", subtitle: "most capable" },
      { id: "claude-sonnet-4-6", label: "claude-sonnet-4-6", subtitle: "balanced" },
      { id: "claude-haiku-4-5", label: "claude-haiku-4-5", subtitle: "fastest" },
    ],
  },
  google: {
    id: "google",
    label: "Google",
    short: "GGL",
    keyPlaceholder: "AIza…",
    keyHint: "aistudio.google.com → Get API key",
    keyDocsUrl: "https://aistudio.google.com/apikey",
    defaultModel: "gemini-2.5-pro",
    models: [
      { id: "gemini-2.5-pro", label: "gemini-2.5-pro", subtitle: "most capable" },
      { id: "gemini-2.5-flash", label: "gemini-2.5-flash", subtitle: "balanced" },
      { id: "gemini-2.5-flash-lite", label: "gemini-2.5-flash-lite", subtitle: "fastest" },
    ],
  },
  groq: {
    id: "groq",
    label: "Groq",
    short: "GRQ",
    keyPlaceholder: "gsk_…",
    keyHint: "console.groq.com → API keys",
    keyDocsUrl: "https://console.groq.com/keys",
    defaultModel: "llama-3.3-70b-versatile",
    models: [
      { id: "llama-3.3-70b-versatile", label: "llama-3.3-70b-versatile", subtitle: "most capable" },
      { id: "deepseek-r1-distill-llama-70b", label: "deepseek-r1-distill-llama-70b", subtitle: "reasoning" },
      { id: "llama-3.1-8b-instant", label: "llama-3.1-8b-instant", subtitle: "fastest" },
    ],
  },
};

export function defaultModelByProvider(): Record<ProviderId, string> {
  return Object.fromEntries(PROVIDER_ORDER.map((p) => [p, PROVIDERS[p].defaultModel])) as Record<
    ProviderId,
    string
  >;
}

export function modelLabelFor(provider: ProviderId, modelId: string): string {
  const m = PROVIDERS[provider].models.find((x) => x.id === modelId);
  return m?.label ?? modelId;
}

export function emptyKeyMap(): Record<ProviderId, string> {
  return Object.fromEntries(PROVIDER_ORDER.map((p) => [p, ""])) as Record<ProviderId, string>;
}
