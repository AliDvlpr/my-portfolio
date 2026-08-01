import assert from "node:assert/strict";
import test from "node:test";
import { blogPostInputSchema, orderingInputSchema, projectInputSchema, suggestedSlug } from "../lib/cms/schemas";

const validPost = { title: "A Production Cache", slug: "a-production-cache", description: "A practical article about reliable cache boundaries.", content: "## Cache boundary\n\nValidate every cache interaction before shipping it.", status: "draft", featured: false, tags: ["Redis"] };
test("CMS accepts a valid post draft", () => assert.equal(blogPostInputSchema.parse(validPost).slug, validPost.slug));
test("CMS rejects unsafe MDX imports", () => assert.equal(blogPostInputSchema.safeParse({ ...validPost, content: "import X from 'x'\n\n## Unsafe" }).success, false));
test("CMS rejects an invalid slug", () => assert.equal(blogPostInputSchema.safeParse({ ...validPost, slug: "Invalid Slug" }).success, false));
test("CMS requires a future scheduled time", () => assert.equal(blogPostInputSchema.safeParse({ ...validPost, status: "scheduled", scheduledAt: "2020-01-01T00:00:00.000Z" }).success, false));
test("CMS generates stable slugs", () => assert.equal(suggestedSlug("Redis Cache: Correct by Design"), "redis-cache-correct-by-design"));

const validProject = { title: "Worker API", slug: "worker-api", summary: "A durable asynchronous processing service for portfolio workloads.", description: "A production-focused API that validates jobs and dispatches them to explicit workers.", status: "draft", featured: false, sortOrder: 2, versionLabel: "v1.0.0", role: "Backend engineering", timeline: "2026", projectType: "Infrastructure", stack: ["Python"], architecture: ["API", "Queue"], challenges: [], decisions: [], outcomes: [], metrics: [], repositoryUrl: "https://github.com/AliDvlpr" };
test("CMS accepts a valid project", () => assert.equal(projectInputSchema.parse(validProject).title, validProject.title));
test("CMS rejects unsafe project URLs", () => assert.equal(projectInputSchema.safeParse({ ...validProject, repositoryUrl: "javascript:alert(1)" }).success, false));
test("CMS rejects duplicate order values", () => assert.equal(orderingInputSchema.safeParse({ items: [{ id: "a", sortOrder: 1 }, { id: "b", sortOrder: 1 }] }).success, false));
