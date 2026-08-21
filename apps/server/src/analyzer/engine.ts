import { 
  BUZZWORDS, 
  FILLER_WORDS, 
  METRIC_PATTERNS, 
  PRONOUNS, 
  WEAK_STARTERS, 
  SECTION_ALIASES
} from "./rules";
import { extractBulletPoints, extractContactInfo } from "./parserUtils";

export interface HighlightedIssue {
  type: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  message: string;
  context: string; // The specific bullet point or sentence
  word?: string;   // The exact word to highlight in red on the frontend
  suggestedFix?: string;
}

export interface CategoryScores {
  impact: number;  // out of 10
  brevity: number; // out of 10
  style: number;   // out of 10
  ats: number;     // out of 10
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
  
  // Tracker for action verb repetition
  const verbFrequency: Record<string, number> = {};
  // ==========================================
  // 1. BULLET POINT ANALYSIS (Impact, Style, Brevity)
  // ==========================================
  for (const bullet of validBullets) {
    const textLower = bullet.text.toLowerCase();
    
    // Repetition Check: Track the first word of the bullet
    const firstWord = textLower.split(/\s+/)[0];
    if (firstWord && firstWord.length > 2) {
      verbFrequency[firstWord] = (verbFrequency[firstWord] || 0) + 1;
      if (verbFrequency[firstWord] === 2) { // Flag on the second offense
        repetitionCount++;
        allIssues.push({
          type: "REPETITION",
          severity: "MEDIUM",
          message: "You used this action verb multiple times. Vary your vocabulary.",
          context: bullet.text,
          word: firstWord,
          suggestedFix: "Use a synonym (e.g., 'Engineered', 'Created', 'Deployed')."
        });
      }
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
    const weakStarter = WEAK_STARTERS.find(weak => textLower.startsWith(weak));
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
    for (const pronoun of PRONOUNS) {
      const regex = new RegExp(`\\b${pronoun}\\b`, 'i');
      if (regex.test(textLower)) {
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
    }

    // D. Style Check: Buzzwords & Clichés
    for (const buzz of BUZZWORDS) {
      const regex = new RegExp(`\\b${buzz}\\b`, 'i');
      if (regex.test(textLower)) {
        buzzwordCount++;
        allIssues.push({
          type: "BUZZWORD",
          severity: "MEDIUM",
          message: "Vague buzzwords add little value and are considered clichés by recruiters.",
          context: bullet.text,
          word: buzz,
          suggestedFix: "Replace with a specific technical skill or measurable achievement."
        });
      }
    }

    // E. Brevity Check: Filler Words
    for (const filler of FILLER_WORDS) {
      const regex = new RegExp(`\\b${filler}\\b`, 'i');
      if (regex.test(textLower)) {
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
    if (bullet.wordCount < 5) {
      lengthIssueCount++;
      allIssues.push({
        type: "BULLET_TOO_SHORT",
        severity: "LOW",
        message: "Bullet point is too short to provide meaningful context.",
        context: bullet.text
      });
    } else if (bullet.wordCount > 35) {
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
  // 2. ATS & STRUCTURE ANALYSIS
  // ==========================================
  let atsPenalty = 0;
  
  // Smarter section detection using aliases
  const checkSection = (aliases: string[]) => {
    return aliases.some(alias => lowerText.includes(alias.toLowerCase()));
  };

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
  // 3. SCORING MATH (Calculated out of 10)
  // ==========================================
  const totalBullets = validBullets.length || 1; // prevent divide by zero
  
  // Impact: "Medium" Earning Model. Give a base score of 3, then scale up.
  // e.g., If 8 out of 22 bullets are quantified (36%), impact is 3 + (0.36 * 10) = 6.6
  let impactScore = 3.0 + ((quantifiedBulletsCount / totalBullets) * 10);
  impactScore -= (weakStarterCount * 1.0); // Penalty for weak starters
  
  // Style: Medium Deduction Model
  let styleScore = 10 - (pronounCount * 2) - (buzzwordCount * 0.5) - (repetitionCount * 1.0);
  
  // Brevity: Medium Deduction Model
  let brevityScore = 10 - (lengthIssueCount * 0.5) - (fillerWordCount * 0.25);
  
  // ATS: Base 10 minus missing core sections and missing contacts
  let atsScore = 10 - atsPenalty;

  // Clamp all scores between 0 and 10
  impactScore = Math.max(0, Math.min(10, Number(impactScore.toFixed(1))));
  styleScore = Math.max(0, Math.min(10, Number(styleScore.toFixed(1))));
  brevityScore = Math.max(0, Math.min(10, Number(brevityScore.toFixed(1))));
  atsScore = Math.max(0, Math.min(10, Number(atsScore.toFixed(1))));

  // Overall Score (Weighted: Impact 40%, Style 25%, ATS 20%, Brevity 15%)
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
