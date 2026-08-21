/**
 * LLM configuration.
 *
 * This is the file you edit to change provider or model. API keys stay in
 * .env - they must never be committed - but everything about which provider
 * and which model is used lives here in code.
 *
 * To switch provider: change ACTIVE_PROVIDER below.
 * To switch model:    edit the models block of that provider.
 */

export type ProviderName = "openai" | "opencode" | "openrouter" | "groq" | "local";

/** Every agent that talks to a model. Add new agents here. */
export type AgentName = "analyzer";

export interface ProviderConfig {
  /** Leave undefined for OpenAI itself. Any other value is treated as an
   *  OpenAI-compatible endpoint and switches the SDK to chat completions. */
  baseURL?: string;
  /** Which .env variable holds this provider's key. */
  apiKeyEnv: string;
  /** Model id per agent. Ids differ between providers - gateways prefix them. */
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

/**
 * Model id for an agent under the active provider.
 *
 * An env var of the same name (ANALYZER_MODEL) overrides it, so a one-off
 * comparison run does not need a code edit. The config above is the default.
 */
export function modelFor(agent: AgentName): string {
  const override = process.env[`${agent.toUpperCase()}_MODEL`];
  return override || activeProvider.models[agent];
}
