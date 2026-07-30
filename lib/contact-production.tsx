import { and, count, eq, gte } from "drizzle-orm";
import { Resend } from "resend";
import { render, toPlainText } from "react-email";
import { contactAttempts, contactSubmissions } from "@/db/schema";
import { getDb } from "@/db";
import { OwnerContactEmail, VisitorConfirmationEmail } from "@/emails/ContactEmails";
import { assertContactProductionEnv, getServerEnv } from "./env";
import type { ContactDependencies, StoredContact } from "./contact-service";

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function createProductionContactDependencies(): ContactDependencies {
  const env = getServerEnv();
  assertContactProductionEnv(env);
  const db = getDb();

  return {
    now: () => Date.now(),
    createId: () => `contact_${crypto.randomUUID().replaceAll("-", "")}`,
    hash: (value) => sha256(`${env.RATE_LIMIT_SALT ?? "development-only-salt"}|${value}`),
    async verifyTurnstile(token, requestId) {
      if (!env.TURNSTILE_SECRET_KEY && process.env.NODE_ENV !== "production") return token === "development-bypass";
      if (!env.TURNSTILE_SECRET_KEY || !token) return false;
      const body = new FormData();
      body.set("secret", env.TURNSTILE_SECRET_KEY);
      body.set("response", token);
      body.set("idempotency_key", requestId);
      const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        body,
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) return false;
      const result = await response.json() as { success?: boolean };
      return result.success === true;
    },
    async checkRateLimit(sourceHash, payloadHash, now) {
      const tenMinutesAgo = new Date(now - 10 * 60_000).toISOString();
      const dayAgo = new Date(now - 24 * 60 * 60_000).toISOString();
      const duplicateSince = new Date(now - 30 * 60_000).toISOString();
      const [[burst], [daily], [duplicate]] = await Promise.all([
        db.select({ value: count() }).from(contactAttempts).where(and(eq(contactAttempts.sourceHash, sourceHash), eq(contactAttempts.accepted, true), gte(contactAttempts.createdAt, tenMinutesAgo))),
        db.select({ value: count() }).from(contactAttempts).where(and(eq(contactAttempts.sourceHash, sourceHash), eq(contactAttempts.accepted, true), gte(contactAttempts.createdAt, dayAgo))),
        db.select({ value: count() }).from(contactAttempts).where(and(eq(contactAttempts.payloadHash, payloadHash), eq(contactAttempts.accepted, true), gte(contactAttempts.createdAt, duplicateSince))),
      ]);
      if (duplicate.value > 0) return { allowed: false, duplicate: true };
      if (burst.value >= 3) return { allowed: false, retryAfter: 600 };
      if (daily.value >= 10) return { allowed: false, retryAfter: 86_400 };
      return { allowed: true };
    },
    async recordAttempt(sourceHash, payloadHash, accepted, now) {
      await db.insert(contactAttempts).values({ id: crypto.randomUUID(), sourceHash, payloadHash, accepted, createdAt: new Date(now).toISOString() });
    },
    async persist(contact) {
      await db.insert(contactSubmissions).values({
        id: contact.id,
        requestId: contact.requestId,
        name: contact.name,
        email: contact.email,
        company: contact.company,
        subject: contact.subject,
        message: contact.message,
        status: contact.status,
        spamScore: contact.spamScore,
        emailDeliveryStatus: contact.status === "spam" ? "skipped" : "pending",
        payloadHash: contact.payloadHash,
        sourceHash: contact.sourceHash,
        createdAt: contact.createdAt,
        updatedAt: contact.createdAt,
      });
    },
    async updateDelivery(requestId, status) {
      await db.update(contactSubmissions).set({ emailDeliveryStatus: status, status: status === "failed" ? "failed" : undefined, updatedAt: new Date().toISOString() }).where(eq(contactSubmissions.requestId, requestId));
    },
    async sendEmails(contact: StoredContact) {
      if (!env.RESEND_API_KEY && process.env.NODE_ENV !== "production") return;
      if (!env.RESEND_API_KEY || !env.CONTACT_FROM_EMAIL || !env.CONTACT_TO_EMAIL) throw new Error("Email configuration unavailable");
      const resend = new Resend(env.RESEND_API_KEY);
      const templateProps = {
        name: contact.name,
        email: contact.email,
        company: contact.company,
        subject: contact.subject,
        message: contact.message,
        requestId: contact.requestId,
        submittedAt: contact.createdAt,
        spamScore: contact.spamScore,
      };
      const ownerHtml = await render(<OwnerContactEmail {...templateProps} />);
      const visitorHtml = await render(<VisitorConfirmationEmail {...templateProps} />);
      const owner = await resend.emails.send({
        from: env.CONTACT_FROM_EMAIL,
        to: env.CONTACT_TO_EMAIL,
        replyTo: contact.email,
        subject: `[Portfolio] ${contact.subject}`,
        html: ownerHtml,
        text: toPlainText(ownerHtml),
        headers: { "Idempotency-Key": `${contact.requestId}-owner` },
      });
      if (owner.error) throw owner.error;
      const visitor = await resend.emails.send({
        from: env.CONTACT_FROM_EMAIL,
        to: contact.email,
        replyTo: env.CONTACT_REPLY_TO_EMAIL ?? env.CONTACT_TO_EMAIL,
        subject: "Your message reached Ali Mohammadi",
        html: visitorHtml,
        text: toPlainText(visitorHtml),
        headers: { "Idempotency-Key": `${contact.requestId}-visitor` },
      });
      if (visitor.error) throw visitor.error;
    },
  };
}
