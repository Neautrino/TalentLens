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
  // Reasoning models reject `temperature`; everything else gets 0 so the same
  // resume produces the same analysis.
  modelSettings: isReasoningModel(MODEL)
    ? { reasoning: { effort: "low" } }
    : { temperature: 0 },
  outputType: ResumeAnalyzerOutputSchema,
});

export type AnalyzerResult =
  | { ok: true; output: ResumeAnalyzerOutput; droppedQuotes: ValidationReport["droppedQuotes"] }
  | { ok: false; reason: "not_a_resume"; output: ResumeAnalyzerOutput }
  | { ok: false; reason: "failed"; error: string };

// Client-facing shape. Deliberately not AnalyzerResult: a failure there carries
// the raw provider error, which names models and endpoints.
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
      // A count, not the quotes - a quality signal for us, not the candidate.
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

  // The model has no clock; without this it reports current roles as
  // future-dated.
  parts.push(`<today>${new Date().toISOString().slice(0, 10)}</today>`);

  // Extracted text keeps only the visible label, so real targets go separately.
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
