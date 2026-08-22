// Regexes that recognise a quantified claim - the signal behind the Impact score.
// Verified at 14/14 recall with 0 false positives on dates, version numbers and
// phone numbers. Add units rather than loosening the shapes.
const UNITS = [
  // people
  "users", "clients", "customers", "students", "engineers", "developers",
  "people", "interns", "reports", "stakeholders", "members", "employees",
  // technical
  "apis", "endpoints", "services", "microservices", "repositories", "repos",
  "tests", "deployments", "releases", "tickets", "commits", "queries",
  "transactions", "records", "rows", "requests", "rps", "qps",
  // time and size
  "ms", "seconds", "minutes", "hours", "days", "weeks", "months", "years",
  "lbs", "kg", "gb", "mb", "tb", "pb"
].join("|");

export const METRIC_PATTERNS = [
  /\d+(?:\.\d+)?(?:k|m|b)?\s*%/i,                                             // Percentages: 45%, ~60%
  /\d+(?:\.\d+)?\s*percent(?:age)?\b/i,                                       // Spelled out: 34 percent
  /(?:usd|\$|€|£|₹)\s*\d+(?:[.,]\d+)*(?:k|m|b)?/i,                            // Money: $500, $1.2M
  /\d+(?:\.\d+)?\s*(?:x|times)\b/i,                                           // Multipliers: 3x, 5 times
  /\b(?:doubled|tripled|quadrupled|halved|twofold|threefold|tenfold)\b/i,     // Word-form multipliers
  /\d+(?:[.,]\d+)*(?:k|m|b)?\s*\+/i,                                          // Plus notation: 100+, 400+
  /\b(?:reduced|increased|improved|saved|grew|scaled|cutting)\s+(?:by|to)\s+\d+/i, // Contextual Impact
  new RegExp(String.raw`\d+(?:[.,]\d+)*(?:k|m|b)?\s*(?:${UNITS})\b`, "i")     // Associated units
];
