import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const contactSubmissions = sqliteTable("contact_submissions", {
  id: text("id").primaryKey(),
  requestId: text("request_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status", { enum: ["new", "read", "replied", "archived", "spam", "failed"] }).notNull().default("new"),
  spamScore: integer("spam_score").notNull().default(0),
  emailDeliveryStatus: text("email_delivery_status", { enum: ["pending", "sent", "failed", "skipped"] }).notNull().default("pending"),
  payloadHash: text("payload_hash").notNull(),
  sourceHash: text("source_hash").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  uniqueIndex("contact_request_id_unique").on(table.requestId),
  index("contact_created_at_idx").on(table.createdAt),
  index("contact_status_idx").on(table.status),
  index("contact_payload_hash_idx").on(table.payloadHash),
]);

export const contactAttempts = sqliteTable("contact_attempts", {
  id: text("id").primaryKey(),
  sourceHash: text("source_hash").notNull(),
  payloadHash: text("payload_hash").notNull(),
  accepted: integer("accepted", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
}, (table) => [
  index("attempt_source_created_idx").on(table.sourceHash, table.createdAt),
  index("attempt_payload_created_idx").on(table.payloadHash, table.createdAt),
]);

export const adminAudit = sqliteTable("admin_audit", {
  id: text("id").primaryKey(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  actor: text("actor").notNull(),
  metadata: text("metadata"),
  createdAt: text("created_at").notNull(),
}, (table) => [index("audit_created_at_idx").on(table.createdAt)]);

export const analyticsEvents = sqliteTable("analytics_events", {
  id: text("id").primaryKey(),
  event: text("event").notNull(),
  path: text("path").notNull(),
  metadata: text("metadata"),
  createdAt: text("created_at").notNull(),
}, (table) => [
  index("analytics_event_idx").on(table.event),
  index("analytics_created_at_idx").on(table.createdAt),
]);

export const blogPosts = sqliteTable("blog_posts", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  status: text("status", { enum: ["draft", "scheduled", "published", "archived"] }).notNull().default("draft"),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  coverImageId: text("cover_image_id"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  canonicalUrl: text("canonical_url"),
  publishedAt: text("published_at"),
  scheduledAt: text("scheduled_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  createdBy: text("created_by").notNull(),
  updatedBy: text("updated_by").notNull(),
  version: integer("version").notNull().default(1),
}, (table) => [
  uniqueIndex("blog_posts_slug_unique").on(table.slug),
  index("blog_posts_status_idx").on(table.status),
  index("blog_posts_published_at_idx").on(table.publishedAt),
  index("blog_posts_featured_idx").on(table.featured),
  index("blog_posts_updated_at_idx").on(table.updatedAt),
]);

export const tags = sqliteTable("tags", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
}, (table) => [uniqueIndex("tags_slug_unique").on(table.slug)]);

export const blogPostTags = sqliteTable("blog_post_tags", {
  postId: text("post_id").notNull().references(() => blogPosts.id, { onDelete: "cascade" }),
  tagId: text("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
}, (table) => [uniqueIndex("blog_post_tags_unique").on(table.postId, table.tagId)]);

export const cmsProjects = sqliteTable("cms_projects", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  description: text("description").notNull(),
  status: text("status", { enum: ["draft", "published", "archived"] }).notNull().default("draft"),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  versionLabel: text("version_label").notNull(),
  role: text("role").notNull(),
  timeline: text("timeline").notNull(),
  projectType: text("project_type").notNull(),
  architecture: text("architecture").notNull(),
  challenges: text("challenges").notNull(),
  decisions: text("decisions").notNull(),
  outcomes: text("outcomes").notNull(),
  metrics: text("metrics").notNull(),
  region: text("region"),
  requests: text("requests"),
  response: text("response"),
  repositoryUrl: text("repository_url"),
  liveUrl: text("live_url"),
  coverImageId: text("cover_image_id"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  publishedAt: text("published_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  createdBy: text("created_by").notNull(),
  updatedBy: text("updated_by").notNull(),
  version: integer("version").notNull().default(1),
}, (table) => [
  uniqueIndex("cms_projects_slug_unique").on(table.slug),
  index("cms_projects_status_idx").on(table.status),
  index("cms_projects_published_at_idx").on(table.publishedAt),
  index("cms_projects_featured_idx").on(table.featured),
  index("cms_projects_updated_at_idx").on(table.updatedAt),
  index("cms_projects_sort_order_idx").on(table.sortOrder),
]);

export const projectTechnologies = sqliteTable("project_technologies", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => cmsProjects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
}, (table) => [index("project_technologies_project_idx").on(table.projectId)]);

export const mediaAssets = sqliteTable("media_assets", {
  id: text("id").primaryKey(),
  storageKey: text("storage_key").notNull(),
  url: text("url").notNull(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  width: integer("width"),
  height: integer("height"),
  altText: text("alt_text").notNull(),
  createdAt: text("created_at").notNull(),
  createdBy: text("created_by").notNull(),
}, (table) => [
  uniqueIndex("media_assets_storage_key_unique").on(table.storageKey),
  index("media_assets_created_at_idx").on(table.createdAt),
]);

export const contentRevisions = sqliteTable("content_revisions", {
  id: text("id").primaryKey(),
  entityType: text("entity_type", { enum: ["post", "project"] }).notNull(),
  entityId: text("entity_id").notNull(),
  version: integer("version").notNull(),
  snapshot: text("snapshot").notNull(),
  action: text("action", { enum: ["created", "updated", "published", "unpublished", "archived", "restored"] }).notNull(),
  createdAt: text("created_at").notNull(),
  createdBy: text("created_by").notNull(),
}, (table) => [
  uniqueIndex("content_revisions_entity_version_unique").on(table.entityType, table.entityId, table.version),
  index("content_revisions_entity_idx").on(table.entityType, table.entityId),
  index("content_revisions_created_at_idx").on(table.createdAt),
]);
