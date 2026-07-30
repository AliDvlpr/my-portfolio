import { z } from "zod";

const normalizedEmail = z.string().trim().toLowerCase().email("Enter a valid email address.").max(254);

export const contactPayloadSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(80, "Name is too long."),
  email: normalizedEmail,
  company: z.string().trim().max(100, "Company is too long.").optional().default(""),
  subject: z.string().trim().min(3, "Add a short subject.").max(120, "Subject is too long."),
  message: z.string().trim().min(20, "Please add a little more detail.").max(5000, "Message must be under 5,000 characters."),
  turnstileToken: z.string().trim().max(2048).default(""),
  website: z.string().max(0, "Automated submission rejected.").optional().default(""),
  startedAt: z.number().int().positive(),
}).strict();

export type ContactPayload = z.infer<typeof contactPayloadSchema>;

export type ContactValidationResult =
  | { success: true; data: ContactPayload }
  | { success: false; fields: Record<string, string> };

export function validateContactPayload(input: unknown): ContactValidationResult {
  const result = contactPayloadSchema.safeParse(input);
  if (result.success) return { success: true, data: result.data };
  const fields: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0]?.toString() ?? "form";
    fields[key] ??= issue.message;
  }
  return { success: false, fields };
}

export function scoreSpam(payload: ContactPayload, now = Date.now()) {
  let score = 0;
  const reasons: string[] = [];
  const completionMs = now - payload.startedAt;
  if (completionMs < 2500) { score += 3; reasons.push("completion_too_fast"); }
  const links = payload.message.match(/https?:\/\/|www\./gi)?.length ?? 0;
  if (links > 2) { score += Math.min(4, links - 1); reasons.push("excessive_links"); }
  if (/(.)\1{9,}/i.test(payload.message)) { score += 3; reasons.push("repeated_characters"); }
  if (/\b(crypto giveaway|guaranteed profit|seo package|casino bonus)\b/i.test(`${payload.subject} ${payload.message}`)) {
    score += 4; reasons.push("known_spam_phrase");
  }
  return { score, reasons, completionMs };
}

export function normalizeForHash(payload: ContactPayload) {
  return [payload.email, payload.subject, payload.message].map((value) => value.trim().toLowerCase().replace(/\s+/g, " ")).join("|");
}
