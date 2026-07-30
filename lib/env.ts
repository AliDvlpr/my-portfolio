import { z } from "zod";

const optionalEmail = z.string().email().optional();
const serverSchema = z.object({
  RESEND_API_KEY: z.string().min(8).optional(),
  CONTACT_FROM_EMAIL: optionalEmail,
  CONTACT_TO_EMAIL: optionalEmail,
  CONTACT_REPLY_TO_EMAIL: optionalEmail,
  TURNSTILE_SECRET_KEY: z.string().min(8).optional(),
  RATE_LIMIT_SALT: z.string().min(16).optional(),
  ADMIN_EMAILS: z.string().optional(),
  SITE_URL: z.string().url().default("http://localhost:5173"),
  ANALYTICS_ENABLED: z.enum(["true", "false"]).default("true"),
});

export type ServerEnv = z.infer<typeof serverSchema>;

export function getServerEnv(source: Record<string, string | undefined> = process.env): ServerEnv {
  const parsed = serverSchema.safeParse(source);
  if (!parsed.success) {
    throw new Error(`Invalid server environment: ${parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ")}`);
  }
  return parsed.data;
}

export function assertContactProductionEnv(env: ServerEnv, production = process.env.NODE_ENV === "production") {
  if (!production) return;
  const required = ["RESEND_API_KEY", "CONTACT_FROM_EMAIL", "CONTACT_TO_EMAIL", "TURNSTILE_SECRET_KEY", "RATE_LIMIT_SALT"] as const;
  const missing = required.filter((key) => !env[key]);
  if (missing.length) throw new Error(`Missing production contact configuration: ${missing.join(", ")}`);
}

export function getPublicEnv() {
  return {
    turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "",
  };
}

export function isAdminEmail(email: string, env = getServerEnv()) {
  return (env.ADMIN_EMAILS ?? "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase());
}
