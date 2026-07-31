import assert from "node:assert/strict";
import test from "node:test";
import { parseBlogSource, parseBlogSources } from "../lib/content";
import { validateProjects } from "../content/projects";

const post = (title: string, date: string, status = "published") => `---
title: ${title}
description: A sufficiently detailed article description.
publishedAt: ${date}
status: ${status}
tags:
  - Backend
featured: false
---

## Introduction

Useful production engineering guidance lives here.
`;

test("rejects invalid blog frontmatter", () => {
  assert.throws(() => parseBlogSource("invalid", "---\ntitle: No\n---\nBody"));
});

test("excludes drafts and sorts published posts newest first", () => {
  const sources = {
    "/content/blog/older.mdx": post("Older article", "2025-01-01"),
    "/content/blog/newer.mdx": post("Newer article", "2026-01-01"),
    "/content/blog/draft.mdx": post("Draft article", "2027-01-01", "draft"),
  };
  assert.deepEqual(parseBlogSources(sources).map(({ slug }) => slug), ["newer", "older"]);
});

test("rejects duplicate blog and project slugs", () => {
  assert.throws(() => parseBlogSources({
    "/one/same.mdx": post("First article", "2025-01-01"),
    "/two/same.mdx": post("Second article", "2026-01-01"),
  }));
  const validProject = {
    slug: "service", index: "01", title: "Service", category: "API",
    summary: "A sufficiently descriptive project summary.",
    description: "A sufficiently descriptive project description.",
    status: "healthy", version: "v1", role: "Engineer", timeline: "2026",
    stack: ["TypeScript"], architecture: ["API", "Database"], metrics: [],
    challenges: [], decisions: [], outcomes: [], featured: true,
    region: "eu-central", requests: "1M", response: "{}",
  };
  assert.throws(() => validateProjects([validProject, validProject]));
  assert.throws(() => validateProjects([{ ...validProject, title: "" }]));
});
