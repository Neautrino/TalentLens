import {
  CASE_SENSITIVE_PRONOUNS,
  CLICHE_PHRASES,
  CLICHE_REPLACEMENTS,
  CLICHE_TERMS,
  CONTEXT_DEPENDENT,
  FILLER_WORDS,
  METRIC_PATTERNS,
  PRONOUNS,
  PRONOUN_DECLARATION,
  WEAK_STARTERS,
  SECTION_ALIASES
} from "../data";
import { extractBulletPoints, extractContactInfo } from "./parserUtils";

// No single factor may zero a category on its own.
const MAX_PENALTY_PER_FACTOR = 3;
const capped = (value: number) => Math.min(value, MAX_PENALTY_PER_FACTOR);

// Prefers concrete replacement words over prose guidance. Checks both sources
// because only 14 of the 20 replacement keys are tier-1 terms.
const REPLACE_WITH = new Map(
  [...CLICHE_PHRASES, ...CONTEXT_DEPENDENT]
    .filter(b => b.replaceWith)
    .map(b => [b.term, b.replaceWith as string])
);

function suggestionFor(term: string): string {
  const words = CLICHE_REPLACEMENTS[term];
  if (words?.length) return `Try: ${words.slice(0, 4).join(", ")}.`;
  return REPLACE_WITH.get(term) ?? "Replace with a specific, measurable achievement.";
}

// "I", "us", "he" and "she" are homographs (job levels, region codes,
// surnames) and each needs its own guard below.
function findPronouns(text: string): string[] {
  const cleaned = text.replace(PRONOUN_DECLARATION, " ");
  const found: string[] = [];

  for (const pronoun of PRONOUNS) {
    // A dash before it means a job level ("Developer - I at QuantumCona").
    if (pronoun === "i") {
      if (/(?<![-\u2013\u2014]\s?)\bI\s+\w/.test(cleaned)) found.push(pronoun);
      continue;
    }

    // Lowercase only, and not a region code ("us-east-1").
    if (pronoun === "us") {
      if (/\bus\b(?!-)/.test(cleaned)) found.push(pronoun);
      continue;
    }

    // Also surnames ("He Zhang"). Narration is followed by a lowercase verb.
    // No "i" flag - it would make [a-z] match uppercase too.
    if (pronoun === "he" || pronoun === "she") {
      const word = pronoun === "he" ? "[Hh]e" : "[Ss]he";
      if (new RegExp(`\\b${word}\\s+[a-z]`).test(cleaned)) found.push(pronoun);
      continue;
    }

    if (new RegExp(`\\b${pronoun}\\b`, "i").test(cleaned)) found.push(pronoun);
  }

  return found;
}

// Longest match first, so "proven track record" is not also charged as
// "track record".
function findCliches(text: string): string[] {
  const hits: string[] = [];
  let remaining = text.toLowerCase();

  for (const term of [...CLICHE_TERMS].sort((a, b) => b.length - a.length)) {
    const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (regex.test(remaining)) {
      hits.push(term);
      remaining = remaining.replace(regex, " ");
    }
  }

  return hits;
}

export interface HighlightedIssue {
  type: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  message: string;
  context: string; // The specific bullet point or sentence
  word?: string;   // The exact word to highlight in red on the frontend
  suggestedFix?: string;
}

export interface CategoryScores {
  impact: number;
  brevity: number;
  style: number;
  ats: number;
}

export interface AnalysisResult {
  overallScore: number; // out of 100
  categoryScores: CategoryScores;
  issues: {
    high: HighlightedIssue[];
    medium: HighlightedIssue[];
    low: HighlightedIssue[];
  };
  metrics: {
    totalBullets: number;
    quantifiedBullets: number;
  };
}

export function analyzeResume(rawText: string): AnalysisResult {
  // Only score actual sentences (e.g., length >= 5 words), otherwise "Node.js" gets counted as a bullet missing metrics
  const bullets = extractBulletPoints(rawText);
  const validBullets = bullets.filter(b => b.wordCount >= 6);
  const lowerText = rawText.toLowerCase();
  
  const allIssues: HighlightedIssue[] = [];
  let quantifiedBulletsCount = 0;

  // Trackers for scoring penalties
  let weakStarterCount = 0;
  let buzzwordCount = 0;
  let fillerWordCount = 0;
  let pronounCount = 0;
  let lengthIssueCount = 0;
  let repetitionCount = 0;
  
  const verbFrequency: Record<string, number> = {};
  const openerBullets: Record<string, string[]> = {};
  // ==========================================
  // 1. BULLET POINT ANALYSIS (Impact, Style, Brevity)
  // ==========================================
  for (const bullet of validBullets) {
    const textLower = bullet.text.toLowerCase();
    
    // Counted here, reported once per word after the loop.
    const firstWord = textLower.split(/\s+/)[0];
    if (firstWord && firstWord.length > 2) {
      verbFrequency[firstWord] = (verbFrequency[firstWord] || 0) + 1;
      (openerBullets[firstWord] ??= []).push(bullet.text);
    }

    // A. Impact Check: Does it have metrics?
    const hasMetric = METRIC_PATTERNS.some(pattern => pattern.test(bullet.text));
    if (hasMetric) {
      quantifiedBulletsCount++;
    } else {
      allIssues.push({
        type: "MISSING_METRIC",
        severity: "HIGH",
        message: "Add numbers or metrics to quantify your accomplishments.",
        context: bullet.text,
        suggestedFix: "Use the XYZ formula: Accomplished [X] as measured by [Y], by doing [Z]."
      });
    }

    // B. Impact Check: Weak Starters
    // Needs a word boundary, or "Madeline" matches "made".
    const weakStarter = WEAK_STARTERS.find(weak =>
      new RegExp(`^${weak.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(bullet.text)
    );
    if (weakStarter) {
      weakStarterCount++;
      allIssues.push({
        type: "WEAK_VERB",
        severity: "HIGH",
        message: "Bullet starts with weak, responsibility-driven language.",
        context: bullet.text,
        word: weakStarter,
        suggestedFix: "Start with a strong action verb (e.g., 'Architected', 'Spearheaded')."
      });
    }

    // C. Style Check: Personal Pronouns
    for (const pronoun of findPronouns(bullet.text)) {
      pronounCount++;
      allIssues.push({
        type: "PERSONAL_PRONOUN",
        severity: "HIGH",
        message: "Resumes should never contain personal pronouns.",
        context: bullet.text,
        word: pronoun,
        suggestedFix: "Remove the pronoun and start the sentence directly with an action verb."
      });
    }

    // D. Style Check: Buzzwords & Clichés
    for (const buzz of findCliches(bullet.text)) {
      buzzwordCount++;
      allIssues.push({
        type: "BUZZWORD",
        severity: "MEDIUM",
        message: "Vague buzzwords add little value and are considered clichés by recruiters.",
        context: bullet.text,
        word: buzz,
        suggestedFix: suggestionFor(buzz)
      });
    }

    // E. Brevity Check: Filler Words
    for (const filler of FILLER_WORDS) {
      // Case-sensitive: capitalised means proper noun ("Very Large Scale...").
      const regex = new RegExp(`\\b${filler}\\b`);
      if (regex.test(bullet.text)) {
        fillerWordCount++;
        allIssues.push({
          type: "FILLER_WORD",
          severity: "LOW",
          message: "Unnecessary adverbs waste space and dilute your impact.",
          context: bullet.text,
          word: filler,
          suggestedFix: "Delete this word."
        });
      }
    }

    // F. Brevity Check: Length
    // No BULLET_TOO_SHORT: validBullets already filters wordCount >= 6.
    if (bullet.wordCount > 35) {
      lengthIssueCount++;
      allIssues.push({
        type: "BULLET_TOO_LONG",
        severity: "MEDIUM",
        message: "Bullet point is too long and difficult to skim.",
        context: bullet.text,
        suggestedFix: "Split this into two separate bullet points."
      });
    }
  }

  // ==========================================
  // 1b. OPENER REPETITION
  // ==========================================
  // Three repeats across 30 bullets is normal; three across 5 is not.
  const REPETITION_THRESHOLD = Math.max(2, Math.ceil(validBullets.length * 0.15));

  for (const [word, count] of Object.entries(verbFrequency)) {
    if (count <= REPETITION_THRESHOLD) continue;
    repetitionCount++;
    const occurrences = openerBullets[word] ?? [];
    allIssues.push({
      type: "REPETITION",
      severity: "MEDIUM",
      message: `"${word}" opens ${count} bullets. Repeating one verb makes achievements blur together.`,
      context: occurrences[0] ?? "Resume Body",
      word,
      suggestedFix: "Vary the opening verb so each bullet leads with a different skill."
    });
  }

  // ==========================================
  // 2. ATS & STRUCTURE ANALYSIS
  // ==========================================
  let atsPenalty = 0;
  
  // A section title takes up its own line. Matching a substring across the whole
  // document meant "Experienced in Python" satisfied the Experience section.
  const sectionTitles = rawText
    .split(/\r?\n/)
    .map(line =>
      line
        .replace(/^[\s\u2022\u2023\u25E6\u2043\u2219*\u25AA#>-]+/, "")
        // Templates often put a date range on the heading line.
        .replace(/\s{2,}[\d(].*$/, "")
        .replace(/[:\u2022|_-]+$/, "")
        .trim()
    )
    .filter(line => {
      if (!line || line.length > 40) return false;
      const words = line.split(/\s+/);
      if (words.length > 4) return false;
      if (/[.!?,;]$/.test(line)) return false;
      if (!/^[A-Za-z][A-Za-z &/'-]*$/.test(line)) return false;
      const isAllCaps = line === line.toUpperCase();
      const isTitleCase = words.every(w => /^[A-Z]/.test(w) || w.length <= 3);
      // A bare lowercase heading ("experience") still counts.
      const isBareKeyword = words.length <= 2;
      return isAllCaps || isTitleCase || isBareKeyword;
    })
    .map(line => line.toLowerCase());

  const checkSection = (aliases: string[]) =>
    sectionTitles.some(title => aliases.some(alias => title.includes(alias.toLowerCase())));

  if (!checkSection(SECTION_ALIASES?.experience || [])) {
    atsPenalty += 4;
    allIssues.push({
      type: "MISSING_SECTION", severity: "HIGH", context: "Resume Body",
      message: "Could not detect an 'Experience' or 'Work History' section."
    });
  }
  if (!checkSection(SECTION_ALIASES?.education || [])) {
    atsPenalty += 2;
    allIssues.push({
      type: "MISSING_SECTION", severity: "HIGH", context: "Resume Body",
      message: "Could not detect an 'Education' section."
    });
  }
  if (!checkSection(SECTION_ALIASES?.skills || [])) {
    atsPenalty += 1;
    allIssues.push({
      type: "MISSING_SECTION", severity: "MEDIUM", context: "Resume Body",
      message: "Could not detect a dedicated 'Skills' section."
    });
  }
  
  // Contact Info Checking
  const contacts = extractContactInfo(rawText);
  if (!contacts.hasLinkedIn) {
    atsPenalty += 3;
    allIssues.push({
      type: "MISSING_CONTACT", severity: "HIGH", context: "Header",
      message: "Could not detect a LinkedIn URL. Recruiters heavily rely on this."
    });
  }
  if (!contacts.hasPhone) {
    atsPenalty += 2;
    allIssues.push({
      type: "MISSING_CONTACT", severity: "HIGH", context: "Header",
      message: "Could not detect a phone number."
    });
  }
  // ==========================================
  // 3. SCORING (out of 10 per category)
  // ==========================================
  // Penalty terms are capped so no single factor can zero a category. Uncapped,
  // three weak openers floored Impact regardless of the rest of the resume.
  const totalBullets = validBullets.length || 1; // prevent divide by zero

  let impactScore = 3.0 + ((quantifiedBulletsCount / totalBullets) * 10);
  impactScore -= capped(weakStarterCount * 1.0);

  let styleScore = 10
    - capped(pronounCount * 2)
    - capped(buzzwordCount * 0.5)
    - capped(repetitionCount * 1.0);

  let brevityScore = 10
    - capped(lengthIssueCount * 0.5)
    - capped(fillerWordCount * 0.25);

  let atsScore = 10 - atsPenalty;

  const clamp = (n: number) => Math.max(0, Math.min(10, Number(n.toFixed(1))));
  impactScore = clamp(impactScore);
  styleScore = clamp(styleScore);
  brevityScore = clamp(brevityScore);
  atsScore = clamp(atsScore);

  // Weighted: Impact 40%, Style 25%, ATS 20%, Brevity 15%.
  const overallScore = Math.round(
    (impactScore * 4) + (styleScore * 2.5) + (atsScore * 2) + (brevityScore * 1.5)
  );

  // ==========================================
  // 4. BUCKET ISSUES FOR FRONTEND
  // ==========================================
  return {
    overallScore,
    categoryScores: {
      impact: impactScore,
      brevity: brevityScore,
      style: styleScore,
      ats: atsScore
    },
    issues: {
      high: allIssues.filter(i => i.severity === "HIGH"),
      medium: allIssues.filter(i => i.severity === "MEDIUM"),
      low: allIssues.filter(i => i.severity === "LOW")
    },
    metrics: {
      totalBullets: validBullets.length,
      quantifiedBullets: quantifiedBulletsCount
    }
  };
}
