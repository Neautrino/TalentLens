import type { ParsedResumeResult } from "../lib/parser";

// A token only counts as a word if it carries a letter or digit, so bullet
// glyphs, pipes and rule characters do not inflate the count.
const CARRIES_CONTENT = /[\p{L}\p{N}]/u;

export interface PageStats {
  num: number;
  words: number;
  lines: number;
}

export interface LengthNote {
  type: "LENGTH_SUMMARY" | "PAGE_OVERFLOW" | "TOO_MANY_PAGES";
  tone: "info" | "warning" | "error";
  message: string;
}

export interface LengthStats {
  wordCount: number;
  pageCount: number | null;
  pages: PageStats[];
  overflow: {
    lastPageWords: number;
    lastPageLines: number;
    ratioToAverage: number;
    isOverflow: boolean;
  } | null;
  notes: LengthNote[];
}

// Thresholds are first guesses. They are reported alongside the raw numbers so
// they can be tuned against real resumes before anything scores on them.
const OVERFLOW_MAX_LINES = 5;
const OVERFLOW_MAX_RATIO = 0.15;

// Page count on its own is not a defect - three pages is legitimate for senior
// and academic profiles. Only warn once it goes past this.
const MAX_PAGES = 4;

function countWords(text: string): number {
  return text.split(/\s+/).filter(token => CARRIES_CONTENT.test(token)).length;
}

function countLines(text: string): number {
  return text.split(/\r?\n/).filter(line => CARRIES_CONTENT.test(line)).length;
}

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function overflowMessage(pageCount: number, lines: number): string {
  const target = pageCount - 1;
  const targetLabel = target === 1 ? "a single page" : plural(target, "page");

  return `Page ${pageCount} carries only ${plural(lines, "line")}. ` +
    `Tightening a few bullets would bring your resume down to ${targetLabel}.`;
}

export function analyzeLength(parsed: ParsedResumeResult): LengthStats {
  const wordCount = countWords(parsed.rawText);

  const pages: PageStats[] = parsed.pages.map((text, index) => ({
    num: index + 1,
    words: countWords(text),
    lines: countLines(text)
  }));

  let overflow: LengthStats["overflow"] = null;

  if (pages.length > 1) {
    const lastPage = pages[pages.length - 1]!;
    const earlierPages = pages.slice(0, -1);
    const averageWords =
      earlierPages.reduce((sum, page) => sum + page.words, 0) / earlierPages.length;
    const ratioToAverage = averageWords > 0 ? lastPage.words / averageWords : 0;

    overflow = {
      lastPageWords: lastPage.words,
      lastPageLines: lastPage.lines,
      ratioToAverage: Number(ratioToAverage.toFixed(3)),
      isOverflow: lastPage.lines <= OVERFLOW_MAX_LINES || ratioToAverage < OVERFLOW_MAX_RATIO
    };
  }

  const notes: LengthNote[] = [];

  // Word documents only paginate once something renders them, so there is
  // nothing to report for them here.
  if (parsed.pageCount !== null) {
    notes.push({
      type: "LENGTH_SUMMARY",
      tone: "info",
      message: `Your resume is ${plural(parsed.pageCount, "page")}.`
    });

    if (parsed.pageCount > MAX_PAGES) {
      notes.push({
        type: "TOO_MANY_PAGES",
        tone: "warning",
        message: `Your resume runs to ${plural(parsed.pageCount, "page")}. ` +
          `Even senior and academic profiles rarely need more than ${MAX_PAGES}.`
      });
    }
  }

  if (overflow?.isOverflow) {
    notes.push({
      type: "PAGE_OVERFLOW",
      tone: "error",
      message: overflowMessage(pages.length, overflow.lastPageLines)
    });
  }

  return { wordCount, pageCount: parsed.pageCount, pages, overflow, notes };
}
