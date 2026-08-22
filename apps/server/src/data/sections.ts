// Section headings and their common variants, used to detect which sections a
// resume actually has. ATS parsers key off these names.

export const SECTION_ALIASES: Record<string, string[]> = {
  experience: ["experience", "work experience", "professional experience", "work history", "employment", "employment history", "professional background"],
  education: ["education", "academic background", "academic history", "scholastic background", "studies", "academic qualifications"],
  skills: ["skills", "technical skills", "core competencies", "technologies", "proficiencies", "expertise", "technical proficiency"],
  projects: ["projects", "personal projects", "academic projects", "open source", "portfolio", "side projects"],
  summary: ["summary", "professional summary", "profile", "career summary", "objective", "about me", "professional profile"],
  certifications: ["certifications", "licenses", "courses", "training", "certificates"]
};
