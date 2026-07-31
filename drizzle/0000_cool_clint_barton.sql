CREATE TABLE `admin_audit` (
	`id` text PRIMARY KEY NOT NULL,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`actor` text NOT NULL,
	`metadata` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `audit_created_at_idx` ON `admin_audit` (`created_at`);--> statement-breakpoint
CREATE TABLE `analytics_events` (
	`id` text PRIMARY KEY NOT NULL,
	`event` text NOT NULL,
	`path` text NOT NULL,
	`metadata` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `analytics_event_idx` ON `analytics_events` (`event`);--> statement-breakpoint
CREATE INDEX `analytics_created_at_idx` ON `analytics_events` (`created_at`);--> statement-breakpoint
CREATE TABLE `contact_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`source_hash` text NOT NULL,
	`payload_hash` text NOT NULL,
	`accepted` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `attempt_source_created_idx` ON `contact_attempts` (`source_hash`,`created_at`);--> statement-breakpoint
CREATE INDEX `attempt_payload_created_idx` ON `contact_attempts` (`payload_hash`,`created_at`);--> statement-breakpoint
CREATE TABLE `contact_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`company` text,
	`subject` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`spam_score` integer DEFAULT 0 NOT NULL,
	`email_delivery_status` text DEFAULT 'pending' NOT NULL,
	`payload_hash` text NOT NULL,
	`source_hash` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `contact_request_id_unique` ON `contact_submissions` (`request_id`);--> statement-breakpoint
CREATE INDEX `contact_created_at_idx` ON `contact_submissions` (`created_at`);--> statement-breakpoint
CREATE INDEX `contact_status_idx` ON `contact_submissions` (`status`);--> statement-breakpoint
CREATE INDEX `contact_payload_hash_idx` ON `contact_submissions` (`payload_hash`);