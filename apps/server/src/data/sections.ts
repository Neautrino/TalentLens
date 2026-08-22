// Section headings and their common variants, used to detect which sections a
// resume actually has. ATS parsers key off these names.
//
// Matched exactly against the normalised heading text, so a variant that is
// missing here is a section the analyzer cannot see - every line beneath it
// gets filed under the previous heading instead.

export const SECTION_ALIASES: Record<string, string[]> = {
  experience: ["experience", "work experience", "professional experience", "work history", "employment", "employment history", "professional background"],
  education: ["education", "academic background", "academic history", "scholastic background", "studies", "academic qualifications"],
  skills: ["skills", "technical skills", "core competencies", "technologies", "proficiencies", "expertise", "technical proficiency"],
  projects: ["projects", "personal projects", "academic projects", "open source", "portfolio", "side projects"],
  summary: ["summary", "professional summary", "profile", "career summary", "objective", "about me", "professional profile"],
  certifications: ["certifications", "licenses", "courses", "training", "certificates"],
  achievements: [
    "achievements", "achievements and involvement", "involvement", "accomplishments",
    "awards", "honors", "awards and honors", "honors and awards", "awards and achievements",
    "leadership", "leadership and involvement", "activities", "extracurricular",
    "extracurricular activities", "volunteering", "community involvement", "publications"
  ]
};
