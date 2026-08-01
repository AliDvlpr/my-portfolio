import test from "node:test";
import assert from "node:assert/strict";

import { clampProgress, homepageStages, lifecycleStageIndex, progressToStageIndex, stageAtProgress, stageState } from "../lib/motion/homepageStages";

test("homepage journey exposes a deterministic backend sequence", () => {
  assert.deepEqual(homepageStages.map((stage) => stage.id), ["hero", "edge", "api", "cache", "database", "worker", "projects", "experience", "toolbox", "writing", "contact", "response"]);
  assert.equal(new Set(homepageStages.map((stage) => stage.id)).size, homepageStages.length);
});

test("progress mapping clamps forward and reverse scroll boundaries", () => {
  assert.equal(progressToStageIndex(-1), 0);
  assert.equal(progressToStageIndex(0), 0);
  assert.equal(progressToStageIndex(0.5), 6);
  assert.equal(progressToStageIndex(1), homepageStages.length - 1);
  assert.equal(progressToStageIndex(4), homepageStages.length - 1);
  assert.equal(stageAtProgress(0.999).id, "response");
});

test("lifecycle progress uses the same deterministic stage mapping", () => {
  assert.equal(lifecycleStageIndex(0, 9), 0);
  assert.equal(lifecycleStageIndex(0.55, 9), 4);
  assert.equal(lifecycleStageIndex(1, 9), 8);
});

test("node state derives only from the canonical active index", () => {
  assert.equal(stageState(2, 4), "completed");
  assert.equal(stageState(4, 4), "active");
  assert.equal(stageState(5, 4), "pending");
});

test("invalid progress values resolve safely", () => {
  assert.equal(clampProgress(Number.NaN), 0);
  assert.equal(clampProgress(Number.POSITIVE_INFINITY), 0);
  assert.equal(clampProgress(-0.2), 0);
  assert.equal(clampProgress(1.2), 1);
});
