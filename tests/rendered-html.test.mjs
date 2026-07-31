import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

async function collectJavaScript(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const chunks = [];
  for (const entry of entries) {
    const path = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, directory);
    if (entry.isDirectory()) chunks.push(...await collectJavaScript(path));
    else if (entry.name.endsWith(".js")) chunks.push(await readFile(path, "utf8"));
  }
  return chunks;
}

test("build artifact contains portfolio metadata without starter preview marker", async () => {
  const chunks = await collectJavaScript(new URL("../dist/server/", import.meta.url));
  const source = chunks.join("\n");
  assert.match(source, /Ali Mohammadi/);
  assert.match(source, /Backend Engineer/);
  assert.doesNotMatch(source, /\bcodex-preview\b/i);
});
