import assert from "node:assert/strict";
import test from "node:test";
import { isAdminEmail } from "../lib/env";
import { hasSameOrigin } from "../lib/admin";

test("admin allowlist accepts only configured identities", () => {
  const env = { ADMIN_EMAILS: "owner@example.com", SITE_URL: "http://localhost:5173", ANALYTICS_ENABLED: "true" as const };
  assert.equal(isAdminEmail("owner@example.com", env), true);
  assert.equal(isAdminEmail("intruder@example.com", env), false);
});

test("admin mutations require a same-origin request", () => {
  assert.equal(hasSameOrigin(new Request("https://portfolio.example/api/admin", {
    headers: { origin: "https://portfolio.example" },
  })), true);
  assert.equal(hasSameOrigin(new Request("https://portfolio.example/api/admin", {
    headers: { origin: "https://evil.example" },
  })), false);
});
