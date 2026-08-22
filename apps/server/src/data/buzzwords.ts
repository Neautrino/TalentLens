// Resume clichés, from ResumeWorded, BetterUp, Enhancv, Zety, ResumeGenius
// and Indeed.
//
// Two tiers on purpose. A flat list is a false-positive machine: "Built a
// scalable event-driven system" is good technical writing. Tier 1 is safe to
// flag anywhere; tier 2 is only a cliché as a bare self-description.

export interface Buzzword {
  term: string;
  /** What to say instead. Shown to the candidate as the suggestion. */
  replaceWith?: string;
}

// Empty self-descriptors. Safe for a plain phrase match.
export const CLICHE_PHRASES: Buzzword[] = [
  { term: "team player", replaceWith: "Name the team, its size, and what you shipped together." },
  { term: "hard worker", replaceWith: "Show the workload: scope, deadline, or volume you handled." },
  { term: "hardworking", replaceWith: "Show the workload: scope, deadline, or volume you handled." },
  { term: "go-getter", replaceWith: "Describe something you started without being asked." },
  { term: "self-starter", replaceWith: "Describe something you started without being asked." },
  { term: "results-driven", replaceWith: "State the result itself, with a number." },
  { term: "results oriented", replaceWith: "State the result itself, with a number." },
  { term: "detail-oriented", replaceWith: "Give an example where precision changed the outcome." },
  { term: "detail oriented", replaceWith: "Give an example where precision changed the outcome." },
  { term: "people person", replaceWith: "Name who you worked with and what it produced." },
  { term: "problem solver", replaceWith: "Name the problem and how you resolved it." },
  { term: "fast learner", replaceWith: "Name something you picked up quickly and shipped." },
  { term: "quick learner", replaceWith: "Name something you picked up quickly and shipped." },
  { term: "multi-tasker", replaceWith: "Show the parallel workstreams you actually ran." },
  { term: "multitasker", replaceWith: "Show the parallel workstreams you actually ran." },
  { term: "thought leader", replaceWith: "Cite the talk, article, or standard you authored." },
  { term: "thought leadership", replaceWith: "Cite the talk, article, or standard you authored." },
  { term: "strategic thinker", replaceWith: "Describe a decision you made and its effect." },
  { term: "go-to person", replaceWith: "Say what people came to you for, and how often." },
  { term: "growth hacker", replaceWith: "State the growth number and how you moved it." },
  { term: "guru" },
  { term: "ninja" },
  { term: "rockstar" },
  { term: "wizard" },
  { term: "synergy", replaceWith: "Say concretely what the two things did together." },
  { term: "think outside the box", replaceWith: "Describe the unconventional approach you took." },
  { term: "outside the box", replaceWith: "Describe the unconventional approach you took." },
  { term: "best of breed" },
  { term: "value add" },
  { term: "value-add" },
  { term: "bottom line" },
  { term: "big picture" },
  { term: "paradigm shift" },
  { term: "game changer" },
  { term: "game-changer" },
  { term: "hit the ground running" },
  { term: "proven track record", replaceWith: "Show the record: two or three concrete outcomes." },
  { term: "track record", replaceWith: "Show the record: two or three concrete outcomes." },
  { term: "experienced professional", replaceWith: "State years and domain, or drop it." },
  { term: "excellent communication skills", replaceWith: "Name what you presented, wrote, or negotiated." },
  { term: "good communication skills", replaceWith: "Name what you presented, wrote, or negotiated." },
  { term: "strong communication skills", replaceWith: "Name what you presented, wrote, or negotiated." },
  { term: "strong work ethic", replaceWith: "Show it through scope delivered, not a label." },
  { term: "leadership skills", replaceWith: "State team size and what the team achieved." },
  { term: "strong leadership skills", replaceWith: "State team size and what the team achieved." },
  { term: "highly skilled", replaceWith: "Name the skill and what you built with it." },
  { term: "highly qualified" },
  { term: "top performer", replaceWith: "Give the ranking or metric that made you one." },
  { term: "world-class" },
  { term: "industry expert", replaceWith: "Show the expertise through work, not a claim." },
  { term: "holistic approach" },
  { term: "seasoned" },
  { term: "action-oriented" },
  { term: "customer-focused", replaceWith: "Give a customer outcome you affected." },

  // From zety.com, resumegenius.com and a broader sweep.
  { term: "works well under pressure", replaceWith: "Name the deadline or incident you handled." },
  { term: "out-of-the-box thinker", replaceWith: "Describe the unconventional approach you took." },
  { term: "out of the box", replaceWith: "Describe the unconventional approach you took." },
  { term: "bottom-line focused", replaceWith: "State the revenue or cost figure you moved." },
  { term: "perfectionist" },
  { term: "best-in-class" },
  { term: "seasoned professional", replaceWith: "State years and domain, or drop it." },
  { term: "natural leader", replaceWith: "State team size and what the team achieved." },
  { term: "born leader", replaceWith: "State team size and what the team achieved." },
  { term: "great communicator", replaceWith: "Name what you presented, wrote, or negotiated." },
  { term: "highly motivated", replaceWith: "Show initiative through something you started." },
  { term: "attention to detail", replaceWith: "Give an example where precision changed the outcome." },
  { term: "wearing many hats", replaceWith: "List the distinct roles you actually covered." },
  { term: "wear many hats", replaceWith: "List the distinct roles you actually covered." },
  { term: "team-oriented", replaceWith: "Name the team, its size, and what you shipped together." },
  { term: "functioned as", replaceWith: "Use an action verb - say what you did, not what you were." },
];

// Real words that are clichés only as a bare self-description. For the LLM to
// judge in context - never for a regex.
export const CONTEXT_DEPENDENT: Buzzword[] = [
  { term: "agile" },
  { term: "scalable" },
  { term: "robust" },
  { term: "dynamic" },
  { term: "innovative" },
  { term: "creative" },
  { term: "passionate" },
  { term: "motivated" },
  { term: "dedicated" },
  { term: "focused" },
  { term: "specialized" },
  { term: "expert" },
  { term: "excellent" },
  { term: "experienced" },
  { term: "effective" },
  { term: "proactive" },
  { term: "strategic" },
  { term: "leverage" },
  { term: "cutting-edge" },
  { term: "groundbreaking" },
  { term: "disruptive" },
  { term: "pioneer" },
  { term: "visionary" },
  { term: "fast-paced" },
  { term: "skilled" },
  { term: "reliable" },
  { term: "dependable" },
  { term: "flexible" },
  { term: "adaptable" },
];

/**
 * Overlaps deliberately left out.
 *
 * "responsible for", "tasked with", "assisted in", "helped" and "experience in"
 * are clichés, but they already live in WEAK_STARTERS in rules.ts and are
 * checked there. Listing them here too would report the same phrase twice, in
 * two different score categories.
 */

// Tier 1 only - what the deterministic check uses.
export const CLICHE_TERMS: string[] = CLICHE_PHRASES.map(b => b.term);

// Both tiers, for seeding the analyzer prompt.
export const ALL_BUZZWORDS: string[] = [
  ...CLICHE_TERMS,
  ...CONTEXT_DEPENDENT.map(b => b.term),
];
