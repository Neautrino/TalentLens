import { SECTION_ALIASES } from "../data";

export type LineRole = "section" | "entry" | "content";

export interface DocLine {
  index: number;
  text: string;
  offset: number;
  role: LineRole;
  section: string | null;
  glyph: string;
}

const GLYPH = /^(?:[•‣◦⁃∙·▪▫■□◆●○*+–—-]+|\d{1,2}[.)])\s+/;

// A no-glyph line either starts something new or wraps the line above it.
// The wrapped tail always follows an unfinished sentence.
const ENDS_SENTENCE = /[.!?]$/;

// An entry header ends on a name, a place or a date - "Hyderabad, India",
// "Sep 2025 - Present", "Associate Consultant" - and never on sentence
// punctuation. Testing the last word's FIRST letter keeps "Cursor.ai" and
// "Next.js" as headers while "...production-ready web" is prose.
const HEADER_ENDING = /(?:^|\s)[A-Z0-9(][^\s]*$/;

const PAGE_FOOTER = /^\d+\s+(?:of|\/)\s+\d+/i;

const MONTH = "(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\\.?";
// "Jan 2026", "Aug. 2020", "06/2022" - one end of a range.
const POINT = `(?:${MONTH}\\s*)?(?:\\d{1,2}[/.])?(?:19|20)\\d{2}`;
const DATE_RANGE = new RegExp(`${POINT}\\s*(?:[-–—]|to)\\s*(?:${POINT}|present|current|now)`, "i");

// "WORK EXPERIENCE" -> "experience". Returns null if it is not a heading.
function sectionOf(text: string): string | null {
  const clean = text.toLowerCase().replace(/[^a-z& ]+/g, " ").replace(/\s+/g, " ").trim();
  if (!clean || clean.split(" ").length > 4) return null;

  for (const [name, aliases] of Object.entries(SECTION_ALIASES)) {
    if (aliases.includes(clean)) return name;
  }

  // A heading we have no alias for. ALL CAPS and no digits: "SDE 2" and
  // "CGPA: 8.0/10" are caps too, and each false heading re-parents every line
  // beneath it.
  if (/\d/.test(text)) return null;

  const letters = text.replace(/[^A-Za-z]/g, "");
  if (letters.length >= 3 && letters === letters.toUpperCase()) return clean;

  return null;
}

function roleOf(text: string, glyph: string, previous: DocLine | undefined): LineRole {
  if (glyph) return "content";
  if (DATE_RANGE.test(text)) return "entry";

  // Wrapped tail of the line above.
  if (previous?.role === "content" && !ENDS_SENTENCE.test(previous.text)) return "content";

  // Entry needs positive evidence. Without it the fallback used to be "entry",
  // which turned every line of a glyph-less resume into a header.
  return HEADER_ENDING.test(text) && !/[.,!?;]$/.test(text) ? "entry" : "content";
}

export function readStructure(rawText: string): DocLine[] {
  const lines: DocLine[] = [];
  let section: string | null = null;

  rawText.split(/\r?\n/).forEach((raw, index) => {
    
    const trimmed = raw.replace(/[\r\f\v\u0000-\u0008]/g, "").trim();
    if (!trimmed) return;

    const glyph = GLYPH.exec(trimmed)?.[0] ?? "";
    const text = trimmed.slice(glyph.length);
    if (PAGE_FOOTER.test(text)) return;

    const heading = glyph ? null : sectionOf(text);
    if (heading) section = heading;

    lines.push({
      index,
      text,
      offset: raw.indexOf(trimmed) + glyph.length,
      role: heading ? "section" : roleOf(text, glyph, lines[lines.length - 1]),
      section,
      glyph,
    });
  });

  return lines;
}

export function dumpStructure(lines: DocLine[]): void {
  console.log("\n[structure]");

  for (const line of lines) {
    if (line.role === "section") console.log(`\n  ${String(line.index).padStart(3)}  ${line.text}`);
    if (line.role === "entry") console.log(`  ${String(line.index).padStart(3)}    - ${line.text}`);
  }

  const counts = new Map<string, number>();
  for (const line of lines) {
    if (line.role !== "content") continue;
    const key = line.section ?? "header";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  console.log(`\n  content: ${[...counts].map(([k, n]) => `${k}=${n}`).join(" ")}`);
}
