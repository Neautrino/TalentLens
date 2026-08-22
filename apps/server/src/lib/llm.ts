import OpenAI from "openai";
import {
  setDefaultOpenAIClient,
  setOpenAIAPI,
  setTracingDisabled,
} from "@openai/agents";
import { ACTIVE_PROVIDER, activeProvider } from "../config/llm";

// Applies the provider chosen in config/llm.ts. With no baseURL the SDK talks
// to OpenAI directly and needs no setup.

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

  // The SDK defaults to the Responses API, which is OpenAI-only.
  setOpenAIAPI("chat_completions");

  // Tracing exports to OpenAI's collector - with another provider that would
  // ship resume text to a vendor the user did not choose.
  setTracingDisabled(true);

  console.log(`[LLM] provider="${ACTIVE_PROVIDER}" endpoint=${baseURL}`);
}

// Gateways prefix model ids ("openai/gpt-5-nano"), so match after the slash.
export function isReasoningModel(model: string): boolean {
  const name = model.split("/").pop() ?? model;
  return /^(gpt-5|o[1-9])/.test(name);
}
