export interface ExtractBullet {
  text: string;
  wordCount: number;
}

export interface ExtractedContact {
    hasEmail: boolean;
    hasPhone: boolean;
    hasLinkedIn: boolean;
    hasGitHub: boolean;
    hasPortfolio: boolean;
}

export function extractBulletPoints(rawText: string): ExtractBullet[] {
    const lines = rawText.split(/\r?\n/);
    const bullets: ExtractBullet[] = []

    for(const line of lines) {
        const trimmed = line.trim();

        if(!trimmed) continue;

        const cleanedLine = trimmed.replace(/^[\u2022\u2023\u25E6\u2043\u2219\-*▪\d+\.]\s*/, "").trim();
        const words = cleanedLine.split(/\s+/).filter(Boolean);

        if(words.length >= 4) {
            bullets.push({
                text: cleanedLine,
                wordCount: words.length
            })
        }
    }

    return bullets;
}

export function extractContactInfo(rawText: string): ExtractedContact {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const linkedInRegex = /linkedin\.com\/in\/[a-zA-Z0-9_-]+/i;
  const gitHubRegex = /github\.com\/[a-zA-Z0-9_-]+/i;
  const urlRegex = /https?:\/\/[^\s]+/i;
  return {
    hasEmail: emailRegex.test(rawText),
    hasPhone: phoneRegex.test(rawText),
    hasLinkedIn: linkedInRegex.test(rawText),
    hasGitHub: gitHubRegex.test(rawText),
    hasPortfolio: urlRegex.test(rawText),
  };
}

export function checkStandardSections(rawText: string): { found: string[]; missing: string[] } {
  const standardSections = ["experience", "education", "skills", "projects"];
  const lowerText = rawText.toLowerCase();
  const found: string[] = [];
  const missing: string[] = [];
  for (const section of standardSections) {
    if (lowerText.includes(section)) {
      found.push(section);
    } else {
      missing.push(section);
    }
  }
  return { found, missing };
}