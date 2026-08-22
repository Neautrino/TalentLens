import { extractBulletPoints, type ExtractBullet } from "./parserUtils";
import { dumpStructure, readStructure } from "./structure";

// Placeholder while the finding shape is being decided. store.ts imports this
// name, so it stays until we settle what a check actually returns.
export interface AnalysisResult {
  bullets: ExtractBullet[];
}

export function analyzeResume(rawText: string): AnalysisResult {
  dumpStructure(readStructure(rawText));

  const bullets = extractBulletPoints(rawText);

  // console.log(`\n[bullets] ${bullets.length} extracted`);
  // bullets.forEach((bullet, i) => {
  //   console.log(`  ${String(i).padStart(2)} | ${String(bullet.wordCount).padStart(2)}w | ${bullet.text}`);
  // });

  return { bullets };
}