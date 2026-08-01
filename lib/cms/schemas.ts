import { z } from "zod";
import { slugify } from "@/lib/content";

const slug = z.string().trim().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only.");
const optionalUrl = z.union([z.literal(""), z.string().url().max(500)]).optional().transform((value) => value || undefined);
const stringList = z.array(z.string().trim().min(1).max(160)).max(30);

export const postStatusSchema = z.enum(["draft", "scheduled", "published", "archived"]);
export const projectStatusSchema = z.enum(["draft", "published", "archived"]);

export const blogPostInputSchema = z.object({
  title: z.string().trim().min(3).max(160),
  slug,
  description: z.string().trim().min(10).max(320),
  content: z.string().trim().min(20).max(120_000),
  status: postStatusSchema.default("draft"),
  featured: z.boolean().default(false),
  tags: z.array(z.string().trim().min(1).max(40)).min(1).max(12),
  coverImageId: z.string().trim().max(80).optional().nullable(),
  seoTitle: z.string().trim().max(70).optional(),
  seoDescription: z.string().trim().max(170).optional(),
  canonicalUrl: optionalUrl,
  scheduledAt: z.string().datetime({ offset: true }).optional().nullable(),
  version: z.number().int().positive().optional(),
}).strict().superRefine((value, context) => {
  if (/^\s*(?:import|export)\s/m.test(value.content) || /<\s*[A-Z][A-Za-z0-9.]*/.test(value.content)) {
    context.addIssue({ code: "custom", path: ["content"], message: "Imports, exports, and arbitrary MDX components are not allowed." });
  }
  if (value.status === "scheduled") {
    if (!value.scheduledAt || new Date(value.scheduledAt).getTime() <= Date.now()) {
      context.addIssue({ code: "custom", path: ["scheduledAt"], message: "Choose a future publication time." });
    }
  }
});

export const projectInputSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug,
  summary: z.string().trim().min(20).max(320),
  description: z.string().trim().min(20).max(2_000),
  status: projectStatusSchema.default("draft"),
  featured: z.boolean().default(false),
  sortOrder: z.number().int().min(0).max(10_000),
  versionLabel: z.string().trim().min(1).max(30),
  role: z.string().trim().min(2).max(160),
  timeline: z.string().trim().min(2).max(80),
  projectType: z.string().trim().min(2).max(80),
  stack: stringList.min(1),
  architecture: stringList.min(2),
  challenges: stringList,
  decisions: stringList,
  outcomes: stringList,
  metrics: z.array(z.object({ label: z.string().trim().min(1).max(40), value: z.string().trim().min(1).max(40) }).strict()).max(12),
  region: z.string().trim().max(60).optional(),
  requests: z.string().trim().max(40).optional(),
  response: z.string().trim().max(2_000).optional(),
  repositoryUrl: optionalUrl,
  liveUrl: optionalUrl,
  coverImageId: z.string().trim().max(80).optional().nullable(),
  seoTitle: z.string().trim().max(70).optional(),
  seoDescription: z.string().trim().max(170).optional(),
  version: z.number().int().positive().optional(),
}).strict();

export const orderingInputSchema = z.object({
  items: z.array(z.object({ id: z.string().min(1), sortOrder: z.number().int().min(0) }).strict()).min(1).max(200),
}).strict().superRefine((value, context) => {
  if (new Set(value.items.map((item) => item.sortOrder)).size !== value.items.length) {
    context.addIssue({ code: "custom", path: ["items"], message: "Each project must have a unique order value." });
  }
});

export const revisionRestoreSchema = z.object({ revisionId: z.string().min(1), version: z.number().int().positive() }).strict();

export const mediaMetadataSchema = z.object({ altText: z.string().trim().min(3).max(240) }).strict();
export const allowedMediaTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
export const MAX_MEDIA_BYTES = 8 * 1024 * 1024;

export type BlogPostInput = z.infer<typeof blogPostInputSchema>;
export type ProjectInput = z.infer<typeof projectInputSchema>;

export function suggestedSlug(title: string) {
  return slugify(title).slice(0, 120);
}

export function listFromTextarea(value: string) {
  return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
}
