import assert from "node:assert/strict";
import test from "node:test";
import { processContactSubmission, type ContactDependencies } from "../lib/contact-service";

const now = Date.now();
const payload = {
  name: "Jane Doe",
  email: "jane@example.com",
  company: "Example Inc.",
  subject: "Project inquiry",
  message: "I would like to discuss a production backend project.",
  turnstileToken: "test-token",
  website: "",
  startedAt: now - 10_000,
};

function dependencies(overrides: Partial<ContactDependencies> = {}): ContactDependencies {
  return {
    now: () => now,
    createId: () => "contact_test",
    hash: async (value) => `hash:${value}`,
    verifyTurnstile: async () => true,
    checkRateLimit: async () => ({ allowed: true }),
    recordAttempt: async () => undefined,
    persist: async () => undefined,
    updateDelivery: async () => undefined,
    sendEmails: async () => undefined,
    ...overrides,
  };
}

test("accepts, persists, and sends a valid submission", async () => {
  let persisted = false;
  let sent = false;
  const result = await processContactSubmission(payload, "source", dependencies({
    persist: async () => { persisted = true; },
    sendEmails: async () => { sent = true; },
  }));
  assert.equal(result.status, 201);
  assert.equal(persisted, true);
  assert.equal(sent, true);
});

test("rejects Turnstile failure", async () => {
  const result = await processContactSubmission(payload, "source", dependencies({ verifyTurnstile: async () => false }));
  assert.equal(result.status, 403);
});

test("returns rate limit and duplicate responses", async () => {
  const limited = await processContactSubmission(payload, "source", dependencies({
    checkRateLimit: async () => ({ allowed: false, retryAfter: 42 }),
  }));
  assert.equal(limited.status, 429);
  const duplicate = await processContactSubmission(payload, "source", dependencies({
    checkRateLimit: async () => ({ allowed: false, duplicate: true }),
  }));
  assert.equal(duplicate.status, 409);
});

test("distinguishes persistence and email failures", async () => {
  const persistence = await processContactSubmission(payload, "source", dependencies({
    persist: async () => { throw new Error("database unavailable"); },
  }));
  assert.equal(persistence.status, 503);
  const email = await processContactSubmission(payload, "source", dependencies({
    sendEmails: async () => { throw new Error("resend unavailable"); },
  }));
  assert.equal(email.status, 502);
});
