import { and, asc, count, desc, eq, inArray, lte, ne } from "drizzle-orm";
import { getDb } from "@/db";
import { adminAudit, blogPosts, blogPostTags, cmsProjects, contentRevisions, mediaAssets, projectTechnologies, tags } from "@/db/schema";
import { featuredProjects as sourceFeaturedProjects, projects as sourceProjects, type Project } from "@/content/projects";
import { getAllBlogPosts, parseBlogSource, slugify, type BlogPost } from "@/lib/content";
import { blogPostInputSchema, projectInputSchema, type ProjectInput } from "./schemas";

const OWNER = "alimohammadi.8773@gmail.com";
const now = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}_${crypto.randomUUID()}`;
const json = <T>(value: string, fallback: T): T => {
  try { return JSON.parse(value) as T; } catch { return fallback; }
};

export type CmsPostRecord = typeof blogPosts.$inferSelect & { tags: string[] };
export type CmsProjectRecord = typeof cmsProjects.$inferSelect & { stack: string[] };

function toBlogPost(row: CmsPostRecord): BlogPost {
  const parsed = parseBlogSource(row.slug, `---\ntitle: ${row.title}\ndescription: ${row.description}\npublishedAt: ${row.publishedAt ?? row.updatedAt}\nupdatedAt: ${row.updatedAt}\nstatus: published\ntags:\n${row.tags.map((tag) => `  - ${tag}`).join("\n")}\nfeatured: ${row.featured}\n---\n${row.content}`);
  return parsed;
}

function toProject(row: CmsProjectRecord, index: number): Project {
  return {
    slug: row.slug,
    index: String(index + 1).padStart(2, "0"),
    title: row.title,
    category: row.projectType,
    summary: row.summary,
    description: row.description,
    status: "healthy",
    version: row.versionLabel,
    role: row.role,
    timeline: row.timeline,
    stack: row.stack,
    architecture: json<string[]>(row.architecture, []),
    metrics: json<Array<{ label: string; value: string }>>(row.metrics, []),
    challenges: json<string[]>(row.challenges, []),
    decisions: json<string[]>(row.decisions, []),
    outcomes: json<string[]>(row.outcomes, []),
    repositoryUrl: row.repositoryUrl ?? undefined,
    liveUrl: row.liveUrl ?? undefined,
    featured: row.featured,
    region: row.region ?? "global",
    requests: row.requests ?? "N/A",
    response: row.response ?? "{}",
  };
}

async function attachPostTags(rows: Array<typeof blogPosts.$inferSelect>) {
  if (!rows.length) return [];
  const db = getDb();
  const links = await db.select({ postId: blogPostTags.postId, name: tags.name }).from(blogPostTags).innerJoin(tags, eq(blogPostTags.tagId, tags.id)).where(inArray(blogPostTags.postId, rows.map((row) => row.id)));
  return rows.map((row) => ({ ...row, tags: links.filter((link) => link.postId === row.id).map((link) => link.name) }));
}

async function attachProjectStack(rows: Array<typeof cmsProjects.$inferSelect>) {
  if (!rows.length) return [];
  const db = getDb();
  const technologies = await db.select().from(projectTechnologies).where(inArray(projectTechnologies.projectId, rows.map((row) => row.id))).orderBy(asc(projectTechnologies.sortOrder));
  return rows.map((row) => ({ ...row, stack: technologies.filter((item) => item.projectId === row.id).map((item) => item.name) }));
}

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  try {
    const current = now();
    const db = getDb();
    const due = await db.update(blogPosts).set({ status: "published", publishedAt: current, updatedAt: current, updatedBy: "scheduler@alidvlpr.local" }).where(and(eq(blogPosts.status, "scheduled"), lte(blogPosts.scheduledAt, current))).returning({ id: blogPosts.id, slug: blogPosts.slug, version: blogPosts.version });
    for (const post of due) await db.insert(adminAudit).values({ id: id("audit"), action: "post.scheduled_published", entityType: "post", entityId: post.id, actor: "scheduler@alidvlpr.local", metadata: JSON.stringify({ slug: post.slug }), createdAt: current });
    const rows = await db.select().from(blogPosts).where(eq(blogPosts.status, "published")).orderBy(desc(blogPosts.publishedAt), desc(blogPosts.updatedAt));
    if (!rows.length) return getAllBlogPosts();
    return (await attachPostTags(rows)).map(toBlogPost);
  } catch { return getAllBlogPosts(); }
}

export async function getPublishedBlogPost(slugValue: string) {
  return (await getPublishedBlogPosts()).find((post) => post.slug === slugValue);
}

export async function getPublishedProjects(): Promise<Project[]> {
  try {
    const db = getDb();
    const rows = await db.select().from(cmsProjects).where(eq(cmsProjects.status, "published")).orderBy(asc(cmsProjects.sortOrder), desc(cmsProjects.updatedAt));
    if (!rows.length) return sourceProjects;
    return (await attachProjectStack(rows)).map(toProject);
  } catch { return sourceProjects; }
}

export async function getPublishedProject(slugValue: string) {
  return (await getPublishedProjects()).find((project) => project.slug === slugValue);
}

export async function getFeaturedProjects() {
  const values = (await getPublishedProjects()).filter((project) => project.featured);
  return values.length ? values : sourceFeaturedProjects;
}

export async function listAdminPosts() {
  const db = getDb();
  return attachPostTags(await db.select().from(blogPosts).orderBy(desc(blogPosts.updatedAt)));
}

export async function getAdminPost(postId: string) {
  const rows = await attachPostTags(await getDb().select().from(blogPosts).where(eq(blogPosts.id, postId)).limit(1));
  return rows[0];
}

export async function listAdminProjects() {
  return attachProjectStack(await getDb().select().from(cmsProjects).orderBy(asc(cmsProjects.sortOrder), desc(cmsProjects.updatedAt)));
}

export async function getAdminProject(projectId: string) {
  const rows = await attachProjectStack(await getDb().select().from(cmsProjects).where(eq(cmsProjects.id, projectId)).limit(1));
  return rows[0];
}

export async function getRevisions(entityType: "post" | "project", entityId: string) {
  return getDb().select({ id: contentRevisions.id, version: contentRevisions.version, action: contentRevisions.action, createdAt: contentRevisions.createdAt, createdBy: contentRevisions.createdBy }).from(contentRevisions).where(and(eq(contentRevisions.entityType, entityType), eq(contentRevisions.entityId, entityId))).orderBy(desc(contentRevisions.version));
}

export async function restoreRevision(revisionId: string, expectedVersion: number, actor = OWNER) {
  const db = getDb();
  const [revision] = await db.select().from(contentRevisions).where(eq(contentRevisions.id, revisionId)).limit(1);
  if (!revision) return null;
  const snapshot = json<Record<string, unknown>>(revision.snapshot, {});
  const restored = revision.entityType === "post"
    ? await savePost({ ...snapshot, version: expectedVersion }, actor, revision.entityId)
    : await saveProject({ ...snapshot, version: expectedVersion }, actor, revision.entityId);
  if (!restored) return null;
  await db.update(contentRevisions).set({ action: "restored" }).where(and(eq(contentRevisions.entityType, revision.entityType), eq(contentRevisions.entityId, revision.entityId), eq(contentRevisions.version, restored.version)));
  await db.insert(adminAudit).values({ id: id("audit"), action: `${revision.entityType}.revision_restored`, entityType: revision.entityType, entityId: revision.entityId, actor, metadata: JSON.stringify({ restoredFrom: revision.version, version: restored.version }), createdAt: now() });
  return { entityType: revision.entityType, entityId: revision.entityId, version: restored.version };
}

async function ensureTags(names: string[]) {
  const db = getDb();
  const uniqueNames = [...new Set(names.map((name) => name.trim()).filter(Boolean))];
  for (const name of uniqueNames) {
    const tagSlug = slugify(name);
    await db.insert(tags).values({ id: id("tag"), slug: tagSlug, name }).onConflictDoUpdate({ target: tags.slug, set: { name } });
  }
  return db.select().from(tags).where(inArray(tags.slug, uniqueNames.map(slugify)));
}

export class ContentConflictError extends Error {}
export class DuplicateSlugError extends Error {}

export async function savePost(raw: unknown, actor = OWNER, postId?: string) {
  const input = blogPostInputSchema.parse(raw);
  const db = getDb();
  const duplicate = await db.select({ id: blogPosts.id }).from(blogPosts).where(and(eq(blogPosts.slug, input.slug), postId ? ne(blogPosts.id, postId) : undefined)).limit(1);
  if (duplicate.length) throw new DuplicateSlugError("A post already uses this slug.");
  const timestamp = now();
  const action = input.status === "published" ? "published" : "updated";

  if (postId) {
    const current = await getAdminPost(postId);
    if (!current) return null;
    if (input.version !== current.version) throw new ContentConflictError("This post was modified in another tab.");
    const version = current.version + 1;
    const values = { slug: input.slug, title: input.title, description: input.description, content: input.content, status: input.status, featured: input.featured, coverImageId: input.coverImageId ?? null, seoTitle: input.seoTitle ?? null, seoDescription: input.seoDescription ?? null, canonicalUrl: input.canonicalUrl ?? null, scheduledAt: input.scheduledAt ?? null, publishedAt: input.status === "published" ? current.publishedAt ?? timestamp : current.publishedAt, updatedAt: timestamp, updatedBy: actor, version };
    const revisionId = id("rev");
    await db.batch([
      db.update(blogPosts).set(values).where(and(eq(blogPosts.id, postId), eq(blogPosts.version, current.version))),
      db.delete(blogPostTags).where(eq(blogPostTags.postId, postId)),
      db.insert(contentRevisions).values({ id: revisionId, entityType: "post", entityId: postId, version, snapshot: JSON.stringify({ ...input, version }), action, createdAt: timestamp, createdBy: actor }),
      db.insert(adminAudit).values({ id: id("audit"), action: `post.${action}`, entityType: "post", entityId: postId, actor, metadata: JSON.stringify({ slug: input.slug, version }), createdAt: timestamp }),
    ]);
    const tagRows = await ensureTags(input.tags);
    if (tagRows.length) await db.insert(blogPostTags).values(tagRows.map((tag) => ({ postId, tagId: tag.id })));
    return getAdminPost(postId);
  }

  const newId = id("post");
  const values = { id: newId, slug: input.slug, title: input.title, description: input.description, content: input.content, status: input.status, featured: input.featured, coverImageId: input.coverImageId ?? null, seoTitle: input.seoTitle ?? null, seoDescription: input.seoDescription ?? null, canonicalUrl: input.canonicalUrl ?? null, scheduledAt: input.scheduledAt ?? null, publishedAt: input.status === "published" ? timestamp : null, createdAt: timestamp, updatedAt: timestamp, createdBy: actor, updatedBy: actor, version: 1 };
  await db.batch([
    db.insert(blogPosts).values(values),
    db.insert(contentRevisions).values({ id: id("rev"), entityType: "post", entityId: newId, version: 1, snapshot: JSON.stringify({ ...input, version: 1 }), action: "created", createdAt: timestamp, createdBy: actor }),
    db.insert(adminAudit).values({ id: id("audit"), action: "post.created", entityType: "post", entityId: newId, actor, metadata: JSON.stringify({ slug: input.slug }), createdAt: timestamp }),
  ]);
  const tagRows = await ensureTags(input.tags);
  if (tagRows.length) await db.insert(blogPostTags).values(tagRows.map((tag) => ({ postId: newId, tagId: tag.id })));
  return getAdminPost(newId);
}

function projectValues(input: ProjectInput) {
  return { slug: input.slug, title: input.title, summary: input.summary, description: input.description, status: input.status, featured: input.featured, sortOrder: input.sortOrder, versionLabel: input.versionLabel, role: input.role, timeline: input.timeline, projectType: input.projectType, architecture: JSON.stringify(input.architecture), challenges: JSON.stringify(input.challenges), decisions: JSON.stringify(input.decisions), outcomes: JSON.stringify(input.outcomes), metrics: JSON.stringify(input.metrics), region: input.region ?? null, requests: input.requests ?? null, response: input.response ?? null, repositoryUrl: input.repositoryUrl ?? null, liveUrl: input.liveUrl ?? null, coverImageId: input.coverImageId ?? null, seoTitle: input.seoTitle ?? null, seoDescription: input.seoDescription ?? null };
}

export async function saveProject(raw: unknown, actor = OWNER, projectId?: string) {
  const input = projectInputSchema.parse(raw);
  const db = getDb();
  const duplicate = await db.select({ id: cmsProjects.id }).from(cmsProjects).where(and(eq(cmsProjects.slug, input.slug), projectId ? ne(cmsProjects.id, projectId) : undefined)).limit(1);
  if (duplicate.length) throw new DuplicateSlugError("A project already uses this slug.");
  const timestamp = now();
  if (projectId) {
    const current = await getAdminProject(projectId);
    if (!current) return null;
    if (input.version !== current.version) throw new ContentConflictError("This project was modified in another tab.");
    const version = current.version + 1;
    const action = input.status === "published" ? "published" : input.status === "archived" ? "archived" : "updated";
    await db.batch([
      db.update(cmsProjects).set({ ...projectValues(input), publishedAt: input.status === "published" ? current.publishedAt ?? timestamp : current.publishedAt, updatedAt: timestamp, updatedBy: actor, version }).where(and(eq(cmsProjects.id, projectId), eq(cmsProjects.version, current.version))),
      db.delete(projectTechnologies).where(eq(projectTechnologies.projectId, projectId)),
      db.insert(contentRevisions).values({ id: id("rev"), entityType: "project", entityId: projectId, version, snapshot: JSON.stringify({ ...input, version }), action, createdAt: timestamp, createdBy: actor }),
      db.insert(adminAudit).values({ id: id("audit"), action: `project.${action}`, entityType: "project", entityId: projectId, actor, metadata: JSON.stringify({ slug: input.slug, version }), createdAt: timestamp }),
    ]);
    if (input.stack.length) await db.insert(projectTechnologies).values(input.stack.map((name, sortOrder) => ({ id: id("tech"), projectId, name, sortOrder })));
    return getAdminProject(projectId);
  }
  const newId = id("project");
  await db.batch([
    db.insert(cmsProjects).values({ id: newId, ...projectValues(input), publishedAt: input.status === "published" ? timestamp : null, createdAt: timestamp, updatedAt: timestamp, createdBy: actor, updatedBy: actor, version: 1 }),
    db.insert(contentRevisions).values({ id: id("rev"), entityType: "project", entityId: newId, version: 1, snapshot: JSON.stringify({ ...input, version: 1 }), action: "created", createdAt: timestamp, createdBy: actor }),
    db.insert(adminAudit).values({ id: id("audit"), action: "project.created", entityType: "project", entityId: newId, actor, metadata: JSON.stringify({ slug: input.slug }), createdAt: timestamp }),
  ]);
  await db.insert(projectTechnologies).values(input.stack.map((name, sortOrder) => ({ id: id("tech"), projectId: newId, name, sortOrder })));
  return getAdminProject(newId);
}

export async function reorderProjects(items: Array<{ id: string; sortOrder: number }>, actor = OWNER) {
  const db = getDb(); const timestamp = now();
  const statements = items.map((item) => db.update(cmsProjects).set({ sortOrder: item.sortOrder, updatedAt: timestamp, updatedBy: actor }).where(eq(cmsProjects.id, item.id)));
  await db.batch(statements as [typeof statements[number], ...Array<typeof statements[number]>]);
  await db.insert(adminAudit).values({ id: id("audit"), action: "project.reordered", entityType: "project", entityId: "registry", actor, metadata: JSON.stringify({ ids: items.map((item) => item.id) }), createdAt: timestamp });
}

export async function deleteContent(entityType: "post" | "project", entityId: string, actor = OWNER) {
  const db = getDb();
  const timestamp = now();
  const table = entityType === "post" ? blogPosts : cmsProjects;
  await db.batch([
    db.delete(table).where(eq(table.id, entityId)),
    db.insert(adminAudit).values({ id: id("audit"), action: `${entityType}.deleted`, entityType, entityId, actor, metadata: null, createdAt: timestamp }),
  ]);
}

export async function applyContentAction(entityType: "post" | "project", entityId: string, action: "publish" | "unpublish" | "archive" | "duplicate" | "feature" | "unfeature", actor = OWNER) {
  if (entityType === "post") {
    const current = await getAdminPost(entityId); if (!current) return null;
    const base = { title: current.title, slug: current.slug, description: current.description, content: current.content, status: current.status, featured: current.featured, tags: current.tags, coverImageId: current.coverImageId, seoTitle: current.seoTitle ?? undefined, seoDescription: current.seoDescription ?? undefined, canonicalUrl: current.canonicalUrl ?? undefined, scheduledAt: current.scheduledAt, version: current.version };
    if (action === "duplicate") return savePost({ ...base, title: `${current.title} Copy`, slug: `${current.slug}-copy-${Date.now().toString().slice(-6)}`, status: "draft", featured: false, version: undefined }, actor);
    const status = action === "publish" ? "published" : action === "archive" ? "archived" : action === "unpublish" ? "draft" : current.status;
    return savePost({ ...base, status, featured: action === "feature" ? true : action === "unfeature" ? false : current.featured }, actor, entityId);
  }
  const current = await getAdminProject(entityId); if (!current) return null;
  const base = { title: current.title, slug: current.slug, summary: current.summary, description: current.description, status: current.status, featured: current.featured, sortOrder: current.sortOrder, versionLabel: current.versionLabel, role: current.role, timeline: current.timeline, projectType: current.projectType, stack: current.stack, architecture: json<string[]>(current.architecture, []), challenges: json<string[]>(current.challenges, []), decisions: json<string[]>(current.decisions, []), outcomes: json<string[]>(current.outcomes, []), metrics: json<Array<{ label: string; value: string }>>(current.metrics, []), region: current.region ?? undefined, requests: current.requests ?? undefined, response: current.response ?? undefined, repositoryUrl: current.repositoryUrl ?? undefined, liveUrl: current.liveUrl ?? undefined, coverImageId: current.coverImageId, seoTitle: current.seoTitle ?? undefined, seoDescription: current.seoDescription ?? undefined, version: current.version };
  if (action === "duplicate") return saveProject({ ...base, title: `${current.title} Copy`, slug: `${current.slug}-copy-${Date.now().toString().slice(-6)}`, status: "draft", featured: false, sortOrder: current.sortOrder + 1, version: undefined }, actor);
  const status = action === "publish" ? "published" : action === "archive" ? "archived" : action === "unpublish" ? "draft" : current.status;
  return saveProject({ ...base, status, featured: action === "feature" ? true : action === "unfeature" ? false : current.featured }, actor, entityId);
}

export async function listMedia() { return getDb().select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt)); }
export async function listAudit(limit = 100) { return getDb().select().from(adminAudit).orderBy(desc(adminAudit.createdAt)).limit(limit); }

export async function getCmsCounts() {
  const db = getDb();
  const [postRows, projectRows] = await Promise.all([
    db.select({ status: blogPosts.status, value: count() }).from(blogPosts).groupBy(blogPosts.status),
    db.select({ status: cmsProjects.status, value: count() }).from(cmsProjects).groupBy(cmsProjects.status),
  ]);
  return { posts: postRows, projects: projectRows };
}
