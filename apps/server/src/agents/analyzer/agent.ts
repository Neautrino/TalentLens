import { Agent, run } from "@openai/agents";
import { configureLlm, isReasoningModel } from "../../lib/llm";
import { modelFor } from "../../config/llm";
import { prompt } from "./prompt";
import { ResumeAnalyzerOutputSchema, type ResumeAnalyzerOutput } from "./schema";
import { validateAnalysis, type ValidationReport } from "./validate";

// Provider and model come from config/llm.ts.
configureLlm();
const MODEL = modelFor("analyzer");

const analyzerAgent = new Agent({
  name: "Resume Analyzer",
  instructions: prompt,
  model: MODEL,
  // Reasoning models reject `temperature`. Everything else gets 0, because the
  // score is derived from these findings and a number that moves between runs
  // on the same resume reads as broken.
  modelSettings: isReasoningModel(MODEL)
    ? { reasoning: { effort: "low" } }
    : { temperature: 0 },
  outputType: ResumeAnalyzerOutputSchema,
});

export type AnalyzerResult =
  | { ok: true; output: ResumeAnalyzerOutput; droppedQuotes: ValidationReport["droppedQuotes"] }
  | { ok: false; reason: "not_a_resume"; output: ResumeAnalyzerOutput }
  | { ok: false; reason: "failed"; error: string };

/**
 * The client-facing shape of an agent run.
 *
 * Deliberately not AnalyzerResult: a failure there carries the raw provider
 * error, which can name models, endpoints and quota details. That belongs in
 * the server log, not in an HTTP response.
 */
export type AiAnalysis =
  | {
      status: "completed";
      document: ResumeAnalyzerOutput["document"];
      basicInfo: ResumeAnalyzerOutput["basicInfo"];
      links: ResumeAnalyzerOutput["links"];
      analysis: ResumeAnalyzerOutput["analysis"];
      droppedQuotes: number;
    }
  | { status: "not_a_resume"; document: ResumeAnalyzerOutput["document"] }
  | { status: "failed" };

export function toAiAnalysis(result: AnalyzerResult): AiAnalysis {
  if (result.ok) {
    return {
      status: "completed",
      document: result.output.document,
      basicInfo: result.output.basicInfo,
      links: result.output.links,
      analysis: result.output.analysis,
      // A count, not the quotes themselves - it is a quality signal for us, not
      // something the candidate can act on.
      droppedQuotes: result.droppedQuotes.length,
    };
  }

  if (result.reason === "not_a_resume") {
    return { status: "not_a_resume", document: result.output.document };
  }

  return { status: "failed" };
}

export interface AnalyzerInput {
  rawText: string;
  hyperlinks?: Array<{ text: string; url: string }>;
}

function buildInput({ rawText, hyperlinks = [] }: AnalyzerInput): string {
  const parts: string[] = [];

  // The model has no clock. Without this it treats every recent date as being
  // in the future and reports working roles as timeline errors.
  parts.push(`<today>${new Date().toISOString().slice(0, 10)}</today>`);

  // Extracted text keeps only the visible label of a link, so the real targets
  // are supplied separately rather than left to be inferred.
  if (hyperlinks.length > 0) {
    const list = hyperlinks.map(link => `${link.text || "(no label)"} -> ${link.url}`).join("\n");
    parts.push(`<hyperlinks>\n${list}\n</hyperlinks>`);
  }

  parts.push(`<resume>\n${rawText}\n</resume>`);
  return parts.join("\n\n");
}

export async function analyzeResumeWithAgent(input: AnalyzerInput): Promise<AnalyzerResult> {
  const { rawText } = input;
  try {
    const result = await run(analyzerAgent, buildInput(input));
    const output = result.finalOutput;

    if (!output) {
      return { ok: false, reason: "failed", error: "Agent returned no output" };
    }

    if (!output.document.isResume) {
      return { ok: false, reason: "not_a_resume", output };
    }

    const { analysis, droppedQuotes } = validateAnalysis(output.analysis, rawText);

    return { ok: true, output: { ...output, analysis }, droppedQuotes };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Analyzer Agent] failed:", message);
    return { ok: false, reason: "failed", error: message };
  }
}
