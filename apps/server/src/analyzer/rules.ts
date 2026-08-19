export const STRONG_ACTION_VERBS = [
  "achieved", "advanced", "architected", "automated", "built", "spearheaded",
  "created", "decreased", "delivered", "designed", "developed", "directed",
  "engineered", "established", "expanded", "generated", "implemented",
  "improved", "increased", "initiated", "integrated", "launched", "led",
  "managed", "maximized", "minimized", "negotiated", "optimized", "orchestrated",
  "overhauled", "pioneered", "reduced", "refactored", "resolved", "restructured",
  "scaled", "simplified", "solved", "streamlined", "transformed", "upgraded"
];

export const WEAK_STARTERS = [
  "responsible for", "worked on", "helped with", "assisted in", "tasked with",
  "handled", "participated in", "involved in", "contributed to", "served as",
  "did", "made", "used", "attempted"
];

export const BUZZWORDS = [
  "hardworking", "team player", "self-starter", "detail-oriented", "go-getter",
  "synergy", "thought leader", "out of the box", "results-driven", "fast learner",
  "dynamic", "passionate", "guru", "ninja", "rockstar"
];

export const METRIC_PATTERNS = [
  /\b\d+(\.\d+)?%\b/,                       // Percentages: 45%, 12.5%
  /\$\d+([.,]\d+)?\b/i,                     // Dollar amounts: $500, $1.2M
  /\b\d+\s*(x|times)\b/i,                   // Multipliers: 3x, 5 times
  /\b\d+\+\b/,                              // Plus notation: 100+, 50+
  /\b(reduced|increased|improved|saved)\s+by\s+\d+/i, // Direct impact statements
  /\b\d+\s*(users|clients|customers|students|requests|ms|seconds|minutes|hours|days|weeks|months|years)\b/i // Unit numbers
];