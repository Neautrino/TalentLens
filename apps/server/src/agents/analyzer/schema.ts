import { z } from "zod";

// The model never emits numbers. It reports findings; the scoring engine counts
// them. Keeping integers out of this schema is what makes the score auditable
// and stable across runs on the same resume.

export const CheckStatus = z.enum(["good", "moderate", "warning", "critical"]);

export const Severity = z.enum(["high", "medium", "low"]);

/**
 * An issue anchored to text copied out of the resume.
 *
 * `quote` is characters copied from the resume, never a description of them.
 * It is what the PDF highlighter marks, and what validation checks - an issue
 * whose quote cannot be located is dropped rather than shown pointing at
 * nothing.
 *
 * No length constraint here on purpose: OpenAI strict structured output rejects
 * keywords like minLength. Emptiness is enforced in validate.ts instead.
 */
const AnchoredIssue = z.object({
  quote: z.string(),
  severity: Severity,
  problem: z.string(),
  suggestion: z.string(),
});

/** Spelling and grammar issues carry the replacement text. */
const CorrectionIssue = AnchoredIssue.extend({
  correction: z.string().nullable(),
});

/** An issue about the resume as a whole, with nothing to highlight. */
const DocumentIssue = z.object({
  severity: Severity,
  problem: z.string(),
  suggestion: z.string(),
});

// `issues` holds problems only - it is the number the scoring engine counts, so
// anything positive in here would penalise a good resume. `note` is where a
// passing check says why it passed, which is what the UI renders as a green
// "check passed" line.
const AnchoredCheck = z.object({
  status: CheckStatus,
  note: z.string().nullable(),
  issues: z.array(AnchoredIssue),
});

const CorrectionCheck = z.object({
  status: CheckStatus,
  note: z.string().nullable(),
  issues: z.array(CorrectionIssue),
});

const DocumentCheck = z.object({
  status: CheckStatus,
  note: z.string().nullable(),
  issues: z.array(DocumentIssue),
});

// `parseability` here means damage visible in the extracted text - encoding
// artefacts, interleaved columns, broken structure. Layout-level ATS risks that
// only exist in the PDF object are measured separately in the analyzer, and both
// feed the same score category.
const AtsSchema = z.object({
  parseability: AnchoredCheck,
  structure: DocumentCheck,
  sectionOrganization: DocumentCheck,
  dateConsistency: AnchoredCheck,
  formattingRisks: AnchoredCheck,
});

const ImpactSchema = z.object({
  quantifiedAchievements: AnchoredCheck,
  achievementVsResponsibility: AnchoredCheck,
  technicalSpecificity: AnchoredCheck,
  ownership: AnchoredCheck,
  leadershipSignals: DocumentCheck,
  quantificationOpportunities: AnchoredCheck,
});

// `repetition` is absent on purpose - counting repeated openers is exact in code
// and unreliable from a model.
const WritingSchema = z.object({
  grammar: CorrectionCheck,
  spelling: CorrectionCheck,
  clarity: AnchoredCheck,
  weakWording: AnchoredCheck,
  conciseness: AnchoredCheck,
  consistency: AnchoredCheck,
});

const ContentSchema = z.object({
  experienceDepth: DocumentCheck,
  projectDepth: DocumentCheck,
  skillContext: AnchoredCheck,
  completeness: DocumentCheck,
  careerProgression: DocumentCheck,
});

const OverallSchema = z.object({
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  topRecommendations: z.array(z.string()),
});

export const AnalysisSchema = z.object({
  ats: AtsSchema,
  impact: ImpactSchema,
  writing: WritingSchema,
  content: ContentSchema,
  overall: OverallSchema,
});

export const BasicInfoSchema = z.object({
  name: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  location: z.string().nullable(),
});

// Plain strings rather than z.url(): models routinely return "github.com/user"
// without a scheme, and a strict url() would fail the whole tool call over a
// missing "https://". Normalise after parsing instead.
export const LinksSchema = z.object({
  linkedin: z.string().nullable(),
  github: z.string().nullable(),
  portfolio: z.string().nullable(),
  other: z.array(z.object({ label: z.string(), url: z.string() })),
});

// The prompt's DOCUMENT VALIDATION step needs somewhere to put a rejection.
// `confidence` is the one number the model may emit - it describes the model's
// own certainty about the document type, not a quality score.
export const DocumentSchema = z.object({
  isResume: z.boolean(),
  detectedType: z.enum([
    "resume",
    "cv",
    "job_description",
    "cover_letter",
    "invoice",
    "transcript",
    "research_paper",
    "article",
    "biography",
    "other",
  ]),
  confidence: z.number(),
  reason: z.string().nullable(),
});

export const ResumeAnalyzerOutputSchema = z.object({
  document: DocumentSchema,
  basicInfo: BasicInfoSchema,
  links: LinksSchema,
  analysis: AnalysisSchema,
});

export type Severity = z.infer<typeof Severity>;
export type AnchoredIssue = z.infer<typeof AnchoredIssue>;
export type CorrectionIssue = z.infer<typeof CorrectionIssue>;
export type Analysis = z.infer<typeof AnalysisSchema>;
export type ResumeDocument = z.infer<typeof DocumentSchema>;
export type ResumeAnalyzerOutput = z.infer<typeof ResumeAnalyzerOutputSchema>;
