import { BUZZWORDS, METRIC_PATTERNS, STRONG_ACTION_VERBS, WEAK_STARTERS } from "./rules";
import { checkStandardSections, extractBulletPoints, extractContactInfo } from "./parserUtils";

export interface FeedbackItem {
  category: "quantification" | "action_verbs" | "buzzwords" | "bullet_length" | "contact_info" | "sections";
  severity: "error" | "warning" | "suggestion" | "pass";
  title: string;
  message: string;
  context?: string;
}

export interface AnalysisResult {
  overallScore: number; // 0 - 100
  breakdown: {
    impactScore: number;       // 0 - 30
    actionVerbScore: number;   // 0 - 25
    bulletQualityScore: number;// 0 - 25
    completenessScore: number; // 0 - 20
  };
  stats: {
    totalBullets: number;
    quantifiedBullets: number;
    strongVerbBullets: number;
    weakStarterBullets: number;
    buzzwordsFound: string[];
  };
  feedback: FeedbackItem[];
}

export function analyzeResume(rawText: string): AnalysisResult {
  const bullets = extractBulletPoints(rawText);
  const contact = extractContactInfo(rawText);
  const sections = checkStandardSections(rawText);
  
  const feedback: FeedbackItem[] = [];

  // ==========================================
  // 1. IMPACT & QUANTIFICATION CHECK (0-30 pts)
  // ==========================================
  let quantifiedBulletsCount = 0;

  for (const bullet of bullets) {
    const isQuantified = METRIC_PATTERNS.some((pattern) => pattern.test(bullet.text));
    if (isQuantified) {
      quantifiedBulletsCount++;
    }
  }

  const totalBullets = bullets.length;
  const quantRatio = totalBullets > 0 ? quantifiedBulletsCount / totalBullets : 0;
  const impactScore = Math.min(30, Math.round(quantRatio * 100 * 0.6)); // max 30 pts

  if (totalBullets > 0) {
    if (quantRatio >= 0.4) {
      feedback.push({
        category: "quantification",
        severity: "pass",
        title: "Strong Quantification",
        message: `Great job! ${Math.round(quantRatio * 100)}% of your bullet points include measurable metrics or numbers.`
      });
    } else if (quantRatio >= 0.2) {
      feedback.push({
        category: "quantification",
        severity: "warning",
        title: "Add More Quantifiable Results",
        message: `Only ${Math.round(quantRatio * 100)}% of your bullet points contain numbers or metrics. Try adding percentages, revenue, time saved, or team sizes.`
      });
    } else {
      feedback.push({
        category: "quantification",
        severity: "error",
        title: "Lack of Metrics and Data",
        message: `Very few bullets contain numbers or measurable achievements. Recruiters prioritize data-driven results.`
      });
    }
  }

  // ==========================================
  // 2. ACTION VERBS & WORD CHOICE (0-25 pts)
  // ==========================================
  let strongVerbCount = 0;
  let weakStarterCount = 0;

  for (const bullet of bullets) {
    const firstWord = bullet.text.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "");

    if (firstWord && STRONG_ACTION_VERBS.includes(firstWord)) {
      strongVerbCount++;
    }

    const lowerBullet = bullet.text.toLowerCase();
    for (const weakStarter of WEAK_STARTERS) {
      if (lowerBullet.startsWith(weakStarter)) {
        weakStarterCount++;
        feedback.push({
          category: "action_verbs",
          severity: "warning",
          title: "Weak Bullet Opening",
          message: `Avoid starting bullet points with weak phrases like "${weakStarter}". Use a strong action verb instead.`,
          context: bullet.text
        });
        break;
      }
    }
  }

  // Check for Buzzwords in full rawText
  const lowerRawText = rawText.toLowerCase();
  const buzzwordsFound: string[] = [];

  for (const buzzword of BUZZWORDS) {
    if (lowerRawText.includes(buzzword)) {
      buzzwordsFound.push(buzzword);
    }
  }

  if (buzzwordsFound.length > 0) {
    feedback.push({
      category: "buzzwords",
      severity: "warning",
      title: "Overused Buzzwords Detected",
      message: `Found overused buzzwords: ${buzzwordsFound.join(", ")}. Replace them with specific actions and facts.`
    });
  } else {
    feedback.push({
      category: "buzzwords",
      severity: "pass",
      title: "No Overused Buzzwords",
      message: "Good job avoiding generic buzzwords and clichés."
    });
  }

  const verbRatio = totalBullets > 0 ? strongVerbCount / totalBullets : 0;
  const rawVerbScore = Math.round(verbRatio * 25) - (weakStarterCount * 2) - (buzzwordsFound.length * 2);
  const actionVerbScore = Math.max(0, Math.min(25, rawVerbScore));

  // ==========================================
  // 3. BULLET QUALITY & LENGTH (0-25 pts)
  // ==========================================
  let shortBulletCount = 0;
  let longBulletCount = 0;

  for (const bullet of bullets) {
    if (bullet.wordCount < 5) {
      shortBulletCount++;
    } else if (bullet.wordCount > 35) {
      longBulletCount++;
      feedback.push({
        category: "bullet_length",
        severity: "suggestion",
        title: "Bullet Point Too Long",
        message: `This bullet point is ${bullet.wordCount} words long. Consider splitting it for better readability.`,
        context: bullet.text
      });
    }
  }

  let bulletQualityScore = 25;
  if (shortBulletCount > 0) bulletQualityScore -= Math.min(10, shortBulletCount * 3);
  if (longBulletCount > 0) bulletQualityScore -= Math.min(10, longBulletCount * 2);
  bulletQualityScore = Math.max(0, bulletQualityScore);

  // ==========================================
  // 4. COMPLETENESS & CONTACT INFO (0-20 pts)
  // ==========================================
  let completenessScore = 20;

  if (!contact.hasEmail) {
    completenessScore -= 5;
    feedback.push({
      category: "contact_info",
      severity: "error",
      title: "Missing Email Address",
      message: "Could not find a valid email address."
    });
  }

  if (!contact.hasPhone) {
    completenessScore -= 3;
    feedback.push({
      category: "contact_info",
      severity: "warning",
      title: "Missing Phone Number",
      message: "Could not detect a phone number."
    });
  }

  if (!contact.hasLinkedIn) {
    completenessScore -= 4;
    feedback.push({
      category: "contact_info",
      severity: "suggestion",
      title: "Missing LinkedIn Link",
      message: "Adding a LinkedIn profile URL increases recruiter response rates."
    });
  }

  if (sections.missing.length > 0) {
    completenessScore -= sections.missing.length * 3;
    feedback.push({
      category: "sections",
      severity: "warning",
      title: "Missing Key Sections",
      message: `Could not clearly identify sections: ${sections.missing.join(", ")}.`
    });
  }

  completenessScore = Math.max(0, completenessScore);

  // Calculate Overall Score
  const overallScore = Math.min(100, impactScore + actionVerbScore + bulletQualityScore + completenessScore);

  return {
    overallScore,
    breakdown: {
      impactScore,
      actionVerbScore,
      bulletQualityScore,
      completenessScore,
    },
    stats: {
      totalBullets,
      quantifiedBullets: quantifiedBulletsCount,
      strongVerbBullets: strongVerbCount,
      weakStarterBullets: weakStarterCount,
      buzzwordsFound,
    },
    feedback,
  };
}
