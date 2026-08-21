import OpenAI from "openai";
import {
  setDefaultOpenAIClient,
  setOpenAIAPI,
  setTracingDisabled,
} from "@openai/agents";
import { ACTIVE_PROVIDER, activeProvider } from "../config/llm";

/**
 * Applies the provider chosen in config/llm.ts.
 *
 * With no baseURL the SDK talks to OpenAI directly and reads OPENAI_API_KEY
 * itself, so there is nothing to do. Any other provider needs a client, the
 * chat-completions API, and tracing turned off.
 */

let configured = false;

export function configureLlm(): void {
  if (configured) return;
  configured = true;

  const { baseURL, apiKeyEnv } = activeProvider;
  const apiKey = process.env[apiKeyEnv];

  if (!apiKey) {
    console.warn(`[LLM] ${apiKeyEnv} is not set - provider "${ACTIVE_PROVIDER}" will fail.`);
  }

  if (!baseURL) return;

  setDefaultOpenAIClient(new OpenAI({ baseURL, apiKey }));

  // The SDK defaults to the Responses API, which is OpenAI-only. Almost every
  // compatible endpoint implements Chat Completions instead.
  setOpenAIAPI("chat_completions");

  // Tracing exports to OpenAI's collector. Left on with a third-party provider
  // it fails on every run, and it would ship resume text to a vendor the user
  // did not choose.
  setTracingDisabled(true);

  console.log(`[LLM] provider="${ACTIVE_PROVIDER}" endpoint=${baseURL}`);
}

/**
 * Reasoning models reject `temperature` outright rather than ignoring it.
 * Gateways prefix model ids ("openai/gpt-5-nano", "azure/o3-mini"), so match on
 * the segment after the last slash.
 */
export function isReasoningModel(model: string): boolean {
  const name = model.split("/").pop() ?? model;
  return /^(gpt-5|o[1-9])/.test(name);
}
