CREATE TABLE `blog_posts` (
  `id` text PRIMARY KEY NOT NULL, `slug` text NOT NULL, `title` text NOT NULL, `description` text NOT NULL,
  `content` text NOT NULL, `status` text DEFAULT 'draft' NOT NULL, `featured` integer DEFAULT false NOT NULL,
  `cover_image_id` text, `seo_title` text, `seo_description` text, `canonical_url` text, `published_at` text,
  `scheduled_at` text, `created_at` text NOT NULL, `updated_at` text NOT NULL, `created_by` text NOT NULL,
  `updated_by` text NOT NULL, `version` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `blog_posts_slug_unique` ON `blog_posts` (`slug`);
--> statement-breakpoint
CREATE INDEX `blog_posts_status_idx` ON `blog_posts` (`status`);
--> statement-breakpoint
CREATE INDEX `blog_posts_published_at_idx` ON `blog_posts` (`published_at`);
--> statement-breakpoint
CREATE INDEX `blog_posts_featured_idx` ON `blog_posts` (`featured`);
--> statement-breakpoint
CREATE INDEX `blog_posts_updated_at_idx` ON `blog_posts` (`updated_at`);
--> statement-breakpoint
CREATE TABLE `tags` (`id` text PRIMARY KEY NOT NULL, `slug` text NOT NULL, `name` text NOT NULL);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_slug_unique` ON `tags` (`slug`);
--> statement-breakpoint
CREATE TABLE `blog_post_tags` (
  `post_id` text NOT NULL REFERENCES `blog_posts`(`id`) ON DELETE cascade,
  `tag_id` text NOT NULL REFERENCES `tags`(`id`) ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `blog_post_tags_unique` ON `blog_post_tags` (`post_id`,`tag_id`);
--> statement-breakpoint
CREATE TABLE `cms_projects` (
  `id` text PRIMARY KEY NOT NULL, `slug` text NOT NULL, `title` text NOT NULL, `summary` text NOT NULL,
  `description` text NOT NULL, `status` text DEFAULT 'draft' NOT NULL, `featured` integer DEFAULT false NOT NULL,
  `sort_order` integer DEFAULT 0 NOT NULL, `version_label` text NOT NULL, `role` text NOT NULL, `timeline` text NOT NULL,
  `project_type` text NOT NULL, `architecture` text NOT NULL, `challenges` text NOT NULL, `decisions` text NOT NULL,
  `outcomes` text NOT NULL, `metrics` text NOT NULL, `region` text, `requests` text, `response` text,
  `repository_url` text, `live_url` text, `cover_image_id` text, `seo_title` text, `seo_description` text,
  `published_at` text, `created_at` text NOT NULL, `updated_at` text NOT NULL, `created_by` text NOT NULL,
  `updated_by` text NOT NULL, `version` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cms_projects_slug_unique` ON `cms_projects` (`slug`);
--> statement-breakpoint
CREATE INDEX `cms_projects_status_idx` ON `cms_projects` (`status`);
--> statement-breakpoint
CREATE INDEX `cms_projects_published_at_idx` ON `cms_projects` (`published_at`);
--> statement-breakpoint
CREATE INDEX `cms_projects_featured_idx` ON `cms_projects` (`featured`);
--> statement-breakpoint
CREATE INDEX `cms_projects_updated_at_idx` ON `cms_projects` (`updated_at`);
--> statement-breakpoint
CREATE INDEX `cms_projects_sort_order_idx` ON `cms_projects` (`sort_order`);
--> statement-breakpoint
CREATE TABLE `project_technologies` (
  `id` text PRIMARY KEY NOT NULL, `project_id` text NOT NULL REFERENCES `cms_projects`(`id`) ON DELETE cascade,
  `name` text NOT NULL, `sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `project_technologies_project_idx` ON `project_technologies` (`project_id`);
--> statement-breakpoint
CREATE TABLE `media_assets` (
  `id` text PRIMARY KEY NOT NULL, `storage_key` text NOT NULL, `url` text NOT NULL, `filename` text NOT NULL,
  `mime_type` text NOT NULL, `size` integer NOT NULL, `width` integer, `height` integer, `alt_text` text NOT NULL,
  `created_at` text NOT NULL, `created_by` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `media_assets_storage_key_unique` ON `media_assets` (`storage_key`);
--> statement-breakpoint
CREATE INDEX `media_assets_created_at_idx` ON `media_assets` (`created_at`);
--> statement-breakpoint
CREATE TABLE `content_revisions` (
  `id` text PRIMARY KEY NOT NULL, `entity_type` text NOT NULL, `entity_id` text NOT NULL, `version` integer NOT NULL,
  `snapshot` text NOT NULL, `action` text NOT NULL, `created_at` text NOT NULL, `created_by` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `content_revisions_entity_version_unique` ON `content_revisions` (`entity_type`,`entity_id`,`version`);
--> statement-breakpoint
CREATE INDEX `content_revisions_entity_idx` ON `content_revisions` (`entity_type`,`entity_id`);
--> statement-breakpoint
CREATE INDEX `content_revisions_created_at_idx` ON `content_revisions` (`created_at`);
