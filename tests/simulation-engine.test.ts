import assert from "node:assert/strict";
import test from "node:test";
import { createInitialSimulationState, executeSimulationRequest, setSimulationScenario, stepSimulation } from "../lib/simulation/engine";

test("simulation engine handles cache-hit requests deterministically", () => {
  const initial = createInitialSimulationState("crm", "cache-hit", 123);
  const result = executeSimulationRequest(initial, "projects", { featured: "true" }, "", "cache-hit");
  assert.equal(result.execution.status, 200);
  assert.equal(result.execution.cached, true);
  assert.match(result.execution.responseBody, /"count": 3/);
  assert.equal(result.trace.spans.some((span) => span.event === "cache.lookup"), true);
});

test("simulation engine returns a 404 for unknown project slugs", () => {
  const initial = createInitialSimulationState("crm", "stable", 123);
  const result = executeSimulationRequest(initial, "project-detail", { slug: "missing-project" });
  assert.equal(result.execution.status, 404);
  assert.equal(result.execution.errorCode, "RESOURCE_NOT_FOUND");
});

test("simulation engine applies degraded scenarios to metrics and services", () => {
  const initial = setSimulationScenario(createInitialSimulationState("crm", "stable", 456), "slow-database");
  const next = stepSimulation(initial);
  assert.equal(next.services.find((service) => service.id === "postgres")?.status, "degraded");
  assert.ok(next.metrics.p95Latency >= initial.metrics.p95Latency);
});

test("simulation engine rate limits before service execution", () => {
  const initial = createInitialSimulationState("crm", "rate-limited", 789);
  const result = executeSimulationRequest(initial, "projects", {}, "", "rate-limited");
  assert.equal(result.execution.status, 429);
  assert.equal(result.trace.spans.some((span) => span.event === "rate_limit.blocked"), true);
});
