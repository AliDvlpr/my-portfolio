import assert from "node:assert/strict";
import test from "node:test";
import { assertContactProductionEnv, getServerEnv, isConfiguredValue, isTurnstileTestKey } from "../lib/env";

test("empty optional environment values are treated as absent", () => {
  const env = getServerEnv({ RESEND_API_KEY: "", CONTACT_FROM_EMAIL: "" });
  assert.equal(env.RESEND_API_KEY, undefined);
  assert.equal(env.CONTACT_FROM_EMAIL, undefined);
});

test("placeholder values are not considered configured", () => {
  assert.equal(isConfiguredValue("replace-with-a-real-secret"), false);
  assert.equal(isConfiguredValue("sk_live_realistic_value"), true);
});

test("production rejects Turnstile test credentials", () => {
  const env = getServerEnv({
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: "1x00000000000000000000AA",
    TURNSTILE_SECRET_KEY: "1x0000000000000000000000000000000AA",
    RESEND_API_KEY: "re_1234567890",
    CONTACT_FROM_EMAIL: "portfolio@alidvlpr.dev",
    CONTACT_TO_EMAIL: "alimohammadi.8773@gmail.com",
    RATE_LIMIT_SALT: "a-long-random-rate-limit-salt",
  });
  assert.equal(isTurnstileTestKey(env.TURNSTILE_SECRET_KEY), true);
  assert.throws(() => assertContactProductionEnv(env, true), /test credentials/);
});
