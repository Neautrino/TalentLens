// Edit this file to change provider or model. API keys stay in .env.

export type ProviderName = "openai" | "opencode" | "openrouter" | "groq" | "local";

/** Every agent that talks to a model. Add new agents here. */
export type AgentName = "analyzer";

export interface ProviderConfig {
  // Undefined for OpenAI itself; any other value switches to chat completions.
  baseURL?: string;
  // Which .env variable holds this provider's key.
  apiKeyEnv: string;
  // Model ids differ between providers - gateways prefix them.
  models: Record<AgentName, string>;
}

// ============================================================
//  CHANGE THIS LINE TO SWITCH PROVIDER
// ============================================================
export const ACTIVE_PROVIDER: ProviderName = "opencode";
// ============================================================

export const PROVIDERS: Record<ProviderName, ProviderConfig> = {
  openai: {
    apiKeyEnv: "OPENAI_API_KEY",
    models: {
      analyzer: "gpt-5-nano-2025-08-07",
    },
  },

  // OpenCode Zen. The SDK appends /chat/completions to this base.
  // Model ids come from https://opencode.ai/docs/models/ - confirm before use.
  opencode: {
    baseURL: "https://opencode.ai/zen/v1",
    apiKeyEnv: "OPENCODE_API_KEY",
    models: {
      analyzer: "mimo-v2.5-free",
    },
  },

  openrouter: {
    baseURL: "https://openrouter.ai/api/v1",
    apiKeyEnv: "OPENROUTER_API_KEY",
    models: {
      analyzer: "openai/gpt-5-nano",
    },
  },

  groq: {
    baseURL: "https://api.groq.com/openai/v1",
    apiKeyEnv: "GROQ_API_KEY",
    models: {
      analyzer: "llama-3.3-70b-versatile",
    },
  },

  // Ollama and most local servers ignore the key, but the SDK still requires
  // one - any placeholder value works.
  local: {
    baseURL: "http://localhost:11434/v1",
    apiKeyEnv: "LOCAL_API_KEY",
    models: {
      analyzer: "qwen2.5:14b",
    },
  },
};

export const activeProvider: ProviderConfig = PROVIDERS[ACTIVE_PROVIDER];

// An env var of the same name (ANALYZER_MODEL) overrides this, for one-off
// comparison runs without a code edit.
export function modelFor(agent: AgentName): string {
  const override = process.env[`${agent.toUpperCase()}_MODEL`];
  return override || activeProvider.models[agent];
}
