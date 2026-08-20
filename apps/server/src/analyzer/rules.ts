export const ACTION_VERBS_CATEGORIZED = {
  leadership: [
    "orchestrated", "spearheaded", "directed", "mentored", "steered", "guided", 
    "led", "managed", "supervised", "coordinated", "executed", "chaired", 
    "delegated", "facilitated", "championed", "authorized", "empowered"
  ],
  technical: [
    "architected", "deployed", "engineered", "refactored", "migrated", "automated", 
    "programmed", "provisioned", "configured", "debugged", "integrated", 
    "coded", "customized", "installed", "upgraded", "standardized"
  ],
  impact: [
    "accelerated", "boosted", "maximized", "optimized", "reduced", "scaled", 
    "slashed", "streamlined", "transformed", "yielded", "halved", "eliminated", 
    "outperformed", "surpassed", "modernized"
  ],
  data: [
    "analyzed", "forecasted", "quantified", "modeled", "measured", "evaluated", 
    "audited", "calculated", "mapped", "tracked", "visualized", "synthesized"
  ],
  communication: [
    "negotiated", "presented", "authored", "documented", "persuaded", "published", 
    "campaigned", "corresponded", "promoted", "publicized", "trained"
  ]
};

// Flattened for backward compatibility with your existing engine.ts
export const STRONG_ACTION_VERBS = [
  ...ACTION_VERBS_CATEGORIZED.leadership,
  ...ACTION_VERBS_CATEGORIZED.technical,
  ...ACTION_VERBS_CATEGORIZED.impact,
  ...ACTION_VERBS_CATEGORIZED.data,
  ...ACTION_VERBS_CATEGORIZED.communication
];

export const WEAK_STARTERS = [
  "responsible for", "worked on", "helped", "helped with", "assisted", "assisted in", 
  "tasked with", "handled", "participated in", "involved in", "contributed to", 
  "served as", "did", "made", "used", "attempted", "tried", "was responsible for", 
  "duties included", "in charge of", "supported", "focused on"
];

// Filler words that waste space (caught by tools like write-good)
export const FILLER_WORDS = [
  "successfully", "effectively", "quickly", "proactively", "efficiently", "seamlessly",
  "expertly", "proficiently", "carefully", "highly", "very", "really", "deeply",
  "various", "multiple", "several", "numerous", "a lot of", "extensively", "actively"
];

export const BUZZWORDS = [
  "hardworking", "team player", "self-starter", "detail-oriented", "go-getter",
  "synergy", "thought leader", "out of the box", "results-driven", "fast learner",
  "dynamic", "passionate", "guru", "ninja", "rockstar", "innovative", "visionary",
  "best of breed", "game changer", "value-add", "bottom line", "go-to person",
  "multitasker", "strategic thinker", "proven track record"
];

// Pronouns that should NEVER be in a resume
export const PRONOUNS = ["i", "me", "my", "we", "our", "us", "myself", "ourselves"];

// NEW: Section Aliases (Critical for ATS Parsing - like OpenResume does)
export const SECTION_ALIASES: Record<string, string[]> = {
  experience: ["experience", "work experience", "professional experience", "work history", "employment", "employment history", "professional background"],
  education: ["education", "academic background", "academic history", "scholastic background", "studies", "academic qualifications"],
  skills: ["skills", "technical skills", "core competencies", "technologies", "proficiencies", "expertise", "technical proficiency"],
  projects: ["projects", "personal projects", "academic projects", "open source", "portfolio", "side projects"],
  summary: ["summary", "professional summary", "profile", "career summary", "objective", "about me", "professional profile"],
  certifications: ["certifications", "licenses", "courses", "training", "certificates"]
};

// Much more robust Regex for capturing semantic impact metrics
export const METRIC_PATTERNS = [
  /\d+(?:\.\d+)?(?:k|m|b)?\s*%/i,                                             // Percentages: 45%, ~60%
  /(?:usd|\$|€|£|₹)\s*\d+(?:[.,]\d+)*(?:k|m|b)?/i,                            // Money: $500, $1.2M
  /\d+(?:\.\d+)?\s*(?:x|times)\b/i,                                           // Multipliers: 3x, 5 times
  /\d+(?:[.,]\d+)*(?:k|m|b)?\s*\+/i,                                          // Plus notation: 100+, 400+
  /\b(?:reduced|increased|improved|saved|grew|scaled|cutting)\s+(?:by|to)\s+\d+/i, // Contextual Impact
  /\d+(?:[.,]\d+)*(?:k|m|b)?\s*(?:users|clients|customers|students|requests|ms|seconds|minutes|hours|days|weeks|months|years|lbs|kg|gb|mb|tb)\b/i // Associated Units
];

// NEW: A massive whitelist of tech terms that standard dictionaries think are typos
export const TECH_WHITELIST = [
  "javascript", "typescript", "python", "golang", "nodejs", "react", "reactjs",
  "nextjs", "postgresql", "redis", "mongodb", "supabase", "mysql", "docker",
  "github", "jenkins", "nginx", "linux", "aws", "gcp", "git", "postman",
  "razorpay", "clerk", "signoz", "sentry", "opentelemetry", "leetcode",
  "geeksforgeeks", "frontend", "backend", "fullstack", "api", "apis", "saas",
  "ui", "ux", "sql", "nosql", "ci", "cd", "k8s", "kubernetes", "django",
  "nestjs", "expressjs", "web3", "solidity", "solana", "ethereum", "vue",
  "angular", "graphql", "rest", "json", "html", "css", "tailwind", "tailwindcss",
  "vite", "webpack", "npm", "yarn", "pnpm", "bun", "vercel", "heroku", "netlify",
  "dsa", "algorithms", "oop", "mvc", "orm", "jwt", "oauth", "auth", "devops",
  "microservices", "serverless", "webhook", "webhooks", "cron", "dlq", "pdf",
  "pdfs", "gcs", "s3", "ec2", "rds", "app", "apps", "repo", "repos", "sdk"
];