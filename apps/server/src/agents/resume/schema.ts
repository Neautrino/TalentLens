import { z } from "zod";

const DocumentSchema = z.object({
  type: z.enum([
    "resume",
    "cv",
    "other",
  ]),
  confidence: z.number().min(0).max(1),
});

const BasicInfoSchema = z.object({
  name: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  location: z.string().nullable(),
});

const LinksSchema = z.object({
  linkedin: z.url().nullable(),
  github: z.url().nullable(),
  portfolio: z.url().nullable(),

  other: z.array(
    z.object({
      label: z.string(),
      url: z.url(),
    })
  ),
});

const SummarySchema = z.object({
  text: z.string().nullable(),
});

const EducationSchema = z.object({
  institution: z.string(),
  degree: z.string().nullable(),
  field: z.string().nullable(),

  startDate: z.string().nullable(),
  endDate: z.string().nullable(),

  grade: z.string().nullable(),

  coursework: z.array(z.string()),

  description: z.string().nullable(),
});

const ExperienceSchema = z.object({
  company: z.string(),
  role: z.string(),

  employmentType: z.string().nullable(),
  location: z.string().nullable(),

  startDate: z.string().nullable(),
  endDate: z.string().nullable(),

  description: z.string().nullable(),

  responsibilities: z.array(z.string()),

  technologies: z.array(z.string()),

  domains: z.array(z.string()),

  claims: z.array(z.string()),

  metrics: z.array(
    z.object({
      statement: z.string(),
      value: z.string().nullable(),
      unit: z.string().nullable(),
    })
  ),
});

const ProjectSchema = z.object({
  name: z.string(),

  type: z.enum([
    "personal",
    "professional",
    "academic",
    "open_source",
    "freelance",
    "research",
    "unknown",
  ]),

  description: z.string().nullable(),

  technologies: z.array(z.string()),

  features: z.array(z.string()),

  links: z.object({
    github: z.string().nullable(),
    live: z.string().nullable(),
    demo: z.string().nullable(),
    other: z.array(z.string()),
  }),

  claims: z.array(z.string()),

  metrics: z.array(
    z.object({
      statement: z.string(),
      value: z.string().nullable(),
      unit: z.string().nullable(),
    })
  ),
});

const SkillSchema = z.object({
  name: z.string(),

  category: z.enum([
    "programming_language",
    "framework",
    "library",
    "database",
    "cloud",
    "devops",
    "infrastructure",
    "ai_ml",
    "tool",
    "other",
  ]),

  context: z.array(z.string()),
});

const AchievementSchema = z.object({
  title: z.string(),
  description: z.string().nullable(),

  metrics: z.array(
    z.object({
      statement: z.string(),
      value: z.string().nullable(),
      unit: z.string().nullable(),
    })
  ),
});

const CertificationSchema = z.object({
  name: z.string(),
  issuer: z.string().nullable(),
  issueDate: z.string().nullable(),
  expiryDate: z.string().nullable(),
  credentialId: z.string().nullable(),
  credentialUrl: z.string().nullable(),
});

export const ResumeProfileSchema = z.object({
  basicInfo: BasicInfoSchema,

  summary: SummarySchema,

  links: LinksSchema,

  education: z.array(EducationSchema),

  experience: z.array(ExperienceSchema),

  projects: z.array(ProjectSchema),

  skills: z.array(SkillSchema),

  achievements: z.array(AchievementSchema),

  certifications: z.array(CertificationSchema),
});

const ClaimSchema = z.object({
  text: z.string(),
});