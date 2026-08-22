import type { Analysis } from "./schema";

// PDF text has irregular whitespace, and models sometimes write a literal
// backslash-n when quoting across a line break. Both are folded here so a real
// quote is not thrown away over an encoding detail.
function normalise(text: string): string {
  return text
    .replace(/\\[nrt]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export interface ValidationReport {
  analysis: Analysis;
  droppedQuotes: Array<{ path: string; quote: string }>;
}

/**
 * Drops issues whose `quote` is not in the resume. A model can describe a
 * problem convincingly and still quote text that was never written; those
 * render as cards pointing at nothing.
 */
export function validateAnalysis(analysis: Analysis, rawText: string): ValidationReport {
  const haystack = normalise(rawText);
  const droppedQuotes: ValidationReport["droppedQuotes"] = [];

  const filtered = structuredClone(analysis) as Record<string, Record<string, unknown>>;

  for (const [category, checks] of Object.entries(filtered)) {
    if (category === "overall") continue;

    for (const [checkName, check] of Object.entries(checks)) {
      const issues = (check as { issues?: unknown }).issues;
      if (!Array.isArray(issues)) continue;

      (check as { issues: unknown[] }).issues = issues.filter(issue => {
        const quote = (issue as { quote?: unknown }).quote;

        // Document-level issues have no quote and are always kept.
        if (typeof quote !== "string") return true;

        // The schema cannot require non-empty (strict output rejects minLength).
        const needle = normalise(quote);
        if (needle.length === 0) {
          droppedQuotes.push({ path: `${category}.${checkName}`, quote });
          return false;
        }

        if (haystack.includes(needle)) return true;

        droppedQuotes.push({ path: `${category}.${checkName}`, quote });
        return false;
      });
    }
  }

  return { analysis: filtered as unknown as Analysis, droppedQuotes };
}
