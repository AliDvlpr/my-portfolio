import assert from "node:assert/strict";
import test from "node:test";
import { runTerminalCommand } from "../lib/terminal/commands";
import { parseCommand } from "../lib/terminal/parser";

test("terminal parser handles quoted values and flags", () => {
  const parsed = parseCommand('read "redis-caching-strategies" --tag Redis');
  assert.deepEqual(parsed, {
    command: "read",
    args: ["redis-caching-strategies"],
    flags: { tag: "Redis" },
    raw: 'read "redis-caching-strategies" --tag Redis',
  });
});

test("terminal parser returns null for empty input", () => {
  assert.equal(parseCommand("   "), null);
});

test("terminal commands reject unknown flags", () => {
  const result = runTerminalCommand("projects --unknown true");
  assert.equal(result.kind, "text");
  assert.match(result.output, /Unknown flag/);
});

test("terminal commands support aliases and helpful unknown-command output", () => {
  const unknown = runTerminalCommand("nonsense");
  assert.equal(unknown.kind, "text");
  assert.match(unknown.output, /Unknown command/);

  const alias = runTerminalCommand("observability");
  assert.equal(alias.kind, "navigation");
  assert.equal(alias.href, "/lab/observability");
});
