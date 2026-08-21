import type { Analysis } from "./schema";

// PDF text arrives with irregular whitespace, so an exact indexOf on the raw
// string would reject quotes that are really there. Compare on a normalised copy.
//
// Models also sometimes write an escape sequence literally - the two characters
// backslash-n rather than a newline - when quoting across a line break. Those
// are folded to whitespace here so a genuine quote is not thrown away over an
// encoding detail.
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
 * Removes issues whose `quote` does not appear in the resume.
 *
 * A model can describe a problem convincingly and still quote text that was
 * never written - or put a description where a quote belongs. Those issues
 * render as cards pointing at nothing and the highlighter silently marks empty
 * space, so they are dropped here rather than shown. This is the check an LLM
 * judge cannot do reliably and code can do exactly.
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

        // The schema cannot require a non-empty quote - OpenAI strict output
        // rejects minLength - so an anchored issue with nothing to anchor to is
        // caught here.
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
