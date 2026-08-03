import { z } from "zod";

const emptyToUndefined = (value: unknown) => typeof value === "string" && value.trim() === "" ? undefined : value;
const optionalString = (schema = z.string()) => z.preprocess(emptyToUndefined, schema.optional());
const optionalEmail = optionalString(z.string().email());
const TURNSTILE_TEST_KEY_PATTERN = /^[123]x0+(?:AA|AB|BB|FF)$/;
const PLACEHOLDER_PATTERN = /(replace|placeholder|change[-_ ]?me|example|your[-_])/i;

const serverSchema = z.object({
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: optionalString(),
  RESEND_API_KEY: optionalString(z.string().min(8)),
  CONTACT_FROM_EMAIL: optionalEmail,
  CONTACT_TO_EMAIL: optionalEmail,
  CONTACT_REPLY_TO_EMAIL: optionalEmail,
  TURNSTILE_SECRET_KEY: optionalString(z.string().min(8)),
  RATE_LIMIT_SALT: optionalString(z.string().min(16)),
  ADMIN_EMAILS: optionalString(),
  ADMIN_ALLOWED_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD_HASH: optionalString(),
  ADMIN_PASSWORD_HASH_BASE64: optionalString(),
  AUTH_SECRET: optionalString(z.string().min(16)),
  AUTH_GOOGLE_ID: optionalString(),
  AUTH_GOOGLE_SECRET: optionalString(),
  SITE_URL: z.string().url().default("http://localhost:5173"),
  ANALYTICS_ENABLED: z.enum(["true", "false"]).default("true"),
});

export type ServerEnv = z.infer<typeof serverSchema>;

export function isConfiguredValue(value: string | undefined) {
  return Boolean(value?.trim()) && !PLACEHOLDER_PATTERN.test(value ?? "");
}

export function isTurnstileTestKey(value: string | undefined) {
  return TURNSTILE_TEST_KEY_PATTERN.test(value?.trim() ?? "");
}

export function getServerEnv(source: Record<string, string | undefined> = process.env): ServerEnv {
  const parsed = serverSchema.safeParse(source);
  if (!parsed.success) {
    throw new Error(`Invalid server environment: ${parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ")}`);
  }
  return parsed.data;
}

export function assertContactProductionEnv(env: ServerEnv, production = process.env.NODE_ENV === "production") {
  if (!production) return;
  const required = ["RESEND_API_KEY", "CONTACT_FROM_EMAIL", "CONTACT_TO_EMAIL", "TURNSTILE_SECRET_KEY", "RATE_LIMIT_SALT", "NEXT_PUBLIC_TURNSTILE_SITE_KEY"] as const;
  const missing = required.filter((key) => !isConfiguredValue(env[key]));
  if (missing.length) throw new Error(`Missing production contact configuration: ${missing.join(", ")}`);
  if (isTurnstileTestKey(env.TURNSTILE_SECRET_KEY) || isTurnstileTestKey(env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)) {
    throw new Error("Cloudflare Turnstile test credentials cannot be used in production.");
  }
}

export function getPublicEnv() {
  return {
    turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "",
  };
}

export function getNormalizedAdminPasswordHash(env = getServerEnv()) {
  const base64Value = env.ADMIN_PASSWORD_HASH_BASE64?.trim();
  if (base64Value) {
    try {
      return Buffer.from(base64Value, "base64").toString("utf8").trim();
    } catch {
      return "";
    }
  }
  const rawValue = env.ADMIN_PASSWORD_HASH?.trim() ?? "";
  if (!rawValue) return "";
  return rawValue
    .replace(/^['"]|['"]$/g, "")
    .replace(/\\\$/g, "$")
    .trim();
}

export function isAdminEmail(email: string, env = getServerEnv()) {
  const allowlist = [
    ...(env.ADMIN_EMAILS ?? "").split(","),
    env.ADMIN_ALLOWED_EMAIL ?? "",
  ].map((value) => value.trim().toLowerCase()).filter(Boolean);
  return allowlist.includes(email.toLowerCase());
}
