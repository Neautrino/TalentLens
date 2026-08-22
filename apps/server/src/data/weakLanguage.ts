// Openers that describe a duty instead of an achievement.
// Single verbs are mostly excluded: sources contradict each other on "organized",
// "took", "ran", "made". "used" is out because it is the recommended
// replacement for "utilized".
export const WEAK_STARTERS = [
  "responsible for", "was responsible for", "duties included", "in charge of",
  "worked on", "worked with", "helped", "helped with", "assisted", "assisted in",
  "tasked with", "handled", "dealt with", "looked after", "participated in",
  "involved in", "contributed to", "served as", "did", "made", "got", "gave",
  "attempted", "tried", "supported", "focused on", "utilized", "experienced in"
];

// Adverbs that add nothing. Excludes "highly", "various", "multiple", "several",
// "numerous", "actively", "effectively" - all legitimate in technical prose
// ("highly available", "multiple services").
export const FILLER_WORDS = [
  "successfully", "quickly", "proactively", "efficiently", "seamlessly",
  "expertly", "proficiently", "carefully", "very", "really", "deeply",
  "a lot of", "extensively",
  "absolutely", "basically", "certainly", "definitely", "essentially",
  "frankly", "literally", "obviously", "simply", "totally", "truly", "virtually"
];

// DELIBERATELY ABSENT: they, them, their, theirs, themselves, her. They refer to
// users rather than the candidate in normal writing - "helps users manage their
// subscriptions". Do not "complete" this list.
export const PRONOUNS = [
  "i", "me", "my", "mine", "myself",
  "we", "us", "our", "ours", "ourselves",
  "he", "she", "him", "his", "himself", "herself"
];

// "I" collides with job levels ("Developer - I"), "us" with region codes
// ("us-east-1"). Matched with extra guards in engine.ts.
export const CASE_SENSITIVE_PRONOUNS = new Set(["i", "us"]);

// Gender-pronoun declarations are an inclusivity choice, not an error.
// Stripped before the pronoun check.
export const PRONOUN_DECLARATION =
  /\b(?:he|she|they|ze|xe|ey)(?:\s*\/\s*(?:him|her|them|his|hers|theirs|hir|xem|em|they))+\b/gi;
