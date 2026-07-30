import assert from "node:assert/strict";
import test from "node:test";
import { validateContactPayload } from "../lib/contact-validation";

const valid = {
  name: " Jane Doe ",
  email: "JANE@EXAMPLE.COM",
  company: "Example Inc.",
  subject: "Project inquiry",
  message: "I would like to discuss a production backend project.",
  turnstileToken: "test-token",
  website: "",
  startedAt: Date.now() - 10_000,
};

test("normalizes a valid contact payload", () => {
  const result = validateContactPayload(valid);
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.name, "Jane Doe");
    assert.equal(result.data.email, "jane@example.com");
  }
});

test("rejects malformed email, missing message, oversized message, and unexpected fields", () => {
  for (const payload of [
    { ...valid, email: "not-an-email" },
    { ...valid, message: "" },
    { ...valid, message: "x".repeat(5001) },
    { ...valid, role: "unexpected" },
  ]) {
    assert.equal(validateContactPayload(payload).success, false);
  }
});

test("rejects an activated honeypot", () => {
  const result = validateContactPayload({ ...valid, website: "https://spam.example" });
  assert.equal(result.success, false);
  if (!result.success) assert.ok(result.fields.website);
});
