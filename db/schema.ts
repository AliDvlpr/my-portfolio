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
