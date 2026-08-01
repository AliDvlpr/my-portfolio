# Ali Developer Portfolio

A React 19 portfolio running on Vinext and Cloudflare Workers. The public experience combines the Phase 1 system interface and Phase 2 backend motion system with a production contact pipeline, validated MDX content, project case studies, a protected owner console, privacy-conscious analytics, and D1 persistence.

## Phase 7 CMS

The authenticated `/admin` area is a single-owner content control plane. Editable posts and projects live in D1; the checked-in MDX and TypeScript sources are import-only fallback content and are never mutated at runtime. Public routes prefer published D1 records and fall back to source content only while the CMS migration is unavailable or empty.

```text
Admin session
  ├─ Posts → D1 blog_posts + normalized tags
  ├─ Projects → D1 cms_projects + project_technologies
  ├─ Media → R2 MEDIA bucket + D1 metadata
  ├─ Revisions → immutable content_revisions snapshots
  └─ Operations → privacy-safe admin_audit events

Public routes
  ├─ /blog + /blog/:slug → published posts only
  ├─ /projects + /projects/:slug → published projects only
  ├─ / → published featured content
  └─ sitemap + RSS → published content only
```

Apply migrations in order. For local development, the helper config uses the same D1 and R2 binding names as the Vite preview:

```bash
npx wrangler d1 execute DB --local --config wrangler.local.jsonc --persist-to .wrangler/state --file drizzle/0000_cool_clint_barton.sql --yes
npm run db:cms:migrate:local
npm run dev
```

Sign in, open `/admin`, and select **Import existing content**. The import is idempotent by slug and seeds existing MDX posts and typed project records. Production migrations must be applied explicitly to the production D1 database before deployment; never use automatic destructive schema synchronization. To roll back the application, deploy the previous Worker version and retain the additive CMS tables. Export D1 before destructive cleanup.

Content operations include draft save, preview, immediate publishing, request-time scheduled publishing in UTC, unpublishing, archiving, duplication, permanent deletion confirmation, project ordering, immutable revisions, revision restore, and optimistic concurrency via the `version` column. A stale write returns `409 Conflict`. Publishing and content mutations revalidate the homepage, indexes, detail routes, RSS, and sitemap.

Media uses the `MEDIA` R2 binding. Uploads are limited to JPEG, PNG, WebP, and AVIF under 8 MB; both MIME type and file signatures are checked. Alt text is mandatory. Relational metadata is stored in D1, while binary data stays in R2. Production must provision an R2 bucket named for the deployment and bind it as `MEDIA`.

Draft previews are under `/admin/preview/*`, require the owner session, set no-index metadata, and never enter public route queries, RSS, or sitemap. Stored MDX rejects imports, exports, and arbitrary React components; the renderer exposes only controlled Markdown structures.

Known limitations: scheduling uses an idempotent request-time publisher rather than a cron trigger, media dimensions are populated with safe display defaults until an image-metadata worker is added, and source fallback remains enabled to protect first deployment before import. Back up D1 and R2 together for a complete CMS restore.

## Route architecture

```text
Public layout
├─ /                  focused overview and live system snapshot
├─ /about             profile, principles, and experience history
├─ /projects          searchable, URL-filtered service registry
│  └─ /projects/:slug engineering case study
├─ /blog              searchable, tag-filtered writing archive
│  └─ /blog/:slug     long-form engineering article
├─ /uses              maintained tools and workflow inventory
├─ /resume            accessible HTML resume and PDF download
└─ /contact           complete production contact gateway

Protected layout
└─ /admin             authenticated owner console
```

`lib/routes.ts` is the public navigation and command-palette registry. `content/profile.ts`, `content/projects.ts`, `content/uses.ts`, and `content/blog/*.mdx` are shared by homepage previews and full routes, preventing parallel copies from drifting.

The public shell owns active-route navigation, the keyboard-accessible mobile drawer, short route traces, the command palette, skip link, and shared footer. Route transitions use transform/opacity-friendly CSS and defer to native history and scroll restoration. Reduced-motion mode removes transition and continuous motion.

### Navigation commands

Press `Ctrl+K` or `Command+K` and search route names, project names, aliases, or stacks. Commands include home, about, projects, blog, uses, resume, contact, copy email, toggle motion, toggle logs, GitHub, and every registered project.

### Updating route content

- Add a project by extending the validated source in `content/projects.ts`; the registry, homepage, sitemap, command palette, and detail route update from that source.
- Add an article under `content/blog/` with valid frontmatter. Drafts stay out of public routes, RSS, and sitemap. Article Markdown is rendered through a controlled server-side parser; arbitrary components are not executed.
- Update `/uses` through `content/uses.ts`, including its visible update date.
- Update professional history in `content/profile.ts`; About, homepage previews, and the HTML resume reuse it.
- Regenerate the downloadable resume with `scripts/generate_resume_pdf.py` after material resume changes.

Every public index has unique metadata and a canonical URL. Project and article metadata derives from validated content. `app/sitemap.ts` includes public indexes and published detail pages, RSS contains published articles only, and robots excludes admin/API surfaces.

For local route testing, start the development server and test direct loads plus client navigation at widths from 320px through desktop. The project filter uses `?type=`/`?q=` and blog filters use `?tag=`/`?q=`, so filtered archives are deep-linkable.

## Architecture

```text
Browser
  ↓
Portfolio application
  ├─ MDX blog and project case studies
  ├─ Resume and SEO feeds
  └─ Contact terminal
       ↓ POST /api/contact
       ├─ strict payload validation + abuse scoring
       ├─ Cloudflare Turnstile verification
       ├─ D1-backed rate and duplicate limiting
       ├─ D1 contact persistence
       └─ Resend owner + visitor email

Admin
  ├─ Sign in with ChatGPT identity
  ├─ explicit ADMIN_EMAILS authorization
  ├─ contact review and status mutations
  └─ append-only audit records
```

The contact record is stored before email is sent. A delivery failure therefore leaves one reviewable record marked `failed`; retries cannot silently create duplicate records or emails because recent normalized payload hashes are rejected.

## Local setup

Requirements:

- Node.js 22.13 or newer
- npm
- Bash for the checked-in Sites lifecycle scripts (Git Bash, WSL, or Linux)

```bash
npm ci
cp .env.example .env.local
npm run db:generate
npm run dev
```

Open `http://localhost:5173/`. Development mode can render the contact flow without Resend or Turnstile credentials, but production builds require all security-sensitive contact variables. Apply the generated SQL in `drizzle/` to the D1 database through the hosting platform before enabling contact submissions.

## Environment configuration

Copy `.env.example`; never commit real values.

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | public | Cloudflare Turnstile widget key |
| `TURNSTILE_SECRET_KEY` | server | Turnstile Siteverify secret |
| `RESEND_API_KEY` | server | transactional email API key |
| `CONTACT_FROM_EMAIL` | server | verified Resend sender |
| `CONTACT_TO_EMAIL` | server | owner notification recipient |
| `CONTACT_REPLY_TO_EMAIL` | server | optional fallback reply-to |
| `RATE_LIMIT_SALT` | server | hashes source identifiers; use 16+ random characters |
| `ADMIN_EMAILS` | server | comma-separated owner allowlist |
| `SITE_URL` | server | canonical production origin |
| `ANALYTICS_ENABLED` | server | enables first-party event storage |

Production contact policy is three attempts per ten minutes, ten per day per hashed source, plus a 30-minute duplicate-payload cooldown. Raw IP addresses, Turnstile tokens, message bodies, authentication tokens, and secrets are never written to logs.

## Contact and email configuration

1. Create a Turnstile widget and configure its public and secret keys.
2. Verify a sending domain in Resend.
3. Set the sender and recipient variables.
4. Bind D1 as `DB` (declared by `.openai/hosting.json`).
5. Apply the migration in `drizzle/`.

The owner notification includes safe submission metadata and the visitor message. The confirmation is intentionally non-promissory and includes a short copy of the request. Both templates have plain-text fallbacks.

Minimal stored contact data is intended for operational follow-up. Establish and document a retention window appropriate to the deployment (for example, archive or delete resolved messages after 12 months). Turnstile tokens and raw source addresses are never stored.

## Content authoring

Blog posts live in `content/blog/*.mdx`. Required frontmatter:

```yaml
title: Building a Scalable FastAPI Service
description: Practical architecture decisions for production APIs.
publishedAt: 2026-07-31
updatedAt: 2026-07-31
status: published
tags: [FastAPI, Python, Architecture]
featured: true
```

Drafts are excluded from public listings and remain visible to an authorized admin. MDX is compiled on the server with a controlled component map; do not add arbitrary executable components. Headings, reading time, table of contents, copyable code, related posts, RSS, and sitemap entries are derived automatically.

Project content is validated in `content/projects.ts`. Each project supplies service metadata plus case-study fields for `/projects/[slug]`. Validation rejects malformed fields and duplicate slugs.

## Admin authentication

`/admin` uses the hosting platform’s Sign in with ChatGPT identity and then enforces `ADMIN_EMAILS` on every page and mutation. Authentication alone does not confer authorization. Status mutations also require a same-origin request and produce an audit event without copying message content.

The admin is intentionally small: paginated contact review, status updates, delivery state, draft previews, project inventory, and a compact analytics summary.

## Analytics and observability

The first-party endpoint accepts only these event names:

- `page_view`
- `project_opened`
- `article_opened`
- `resume_downloaded`
- `contact_started`
- `contact_submitted`
- `contact_failed`
- `command_palette_opened`
- `terminal_command_used`

Event delivery is asynchronous and failure-safe. Only an event name, page path, timestamp, and allowlisted short metadata are stored. There is no session replay, fingerprinting, advertising identifier, or raw IP storage.

Server logs are structured JSON events with request IDs and safe timing/status metadata. User messages and credentials are deliberately excluded.

## Security

The Worker applies CSP, HSTS on HTTPS, `X-Content-Type-Options`, a strict referrer policy, a restrictive permissions policy, and frame protection. Turnstile and Resend are server-verified. CSP currently permits inline scripts and styles because Vinext hydration and React Email/GSAP-generated styles require them; remote scripts and frames remain restricted to Cloudflare Turnstile.

The contact endpoint uses strict schemas, request identifiers, normalized payload hashing, a honeypot, minimum completion time, link/repetition scoring, D1-backed rate limits, and safe structured errors. Production configuration fails clearly when required secrets are missing.

## Resume, feeds, and metadata

- `/resume` is an accessible, printable resume route.
- `/rss.xml` exposes published articles.
- `/sitemap.xml` includes public pages, articles, and projects.
- `/robots.txt` blocks admin and API routes.
- Canonical, Open Graph, Twitter, Person, Article, and CreativeWork metadata are generated server-side.

## Validation

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run test
npm run build
npm run validate:artifact
```

Tests mock verification, persistence, and email delivery. No test sends real email or calls Turnstile.

## Deployment

1. Provision the Sites D1 binding declared in `.openai/hosting.json`.
2. Apply `drizzle/*.sql`.
3. Configure all production environment variables.
4. Configure Turnstile allowed hostnames and a verified Resend sender domain.
5. Configure Sign in with ChatGPT and set the owner allowlist.
6. Build and deploy the saved Sites version.
7. Verify `/api/contact`, `/admin`, `/rss.xml`, `/sitemap.xml`, `/robots.txt`, and `/resume`.

Known limitations: blog and project authoring is Git-based rather than a browser CMS; analytics is intentionally aggregate-only; local contact delivery is bypassed without provider credentials; and owner access depends on the hosting platform’s identity headers.
