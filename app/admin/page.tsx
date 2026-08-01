import type { Metadata } from "next";
import Link from "next/link";
import { count, desc } from "drizzle-orm";
import { getDb } from "@/db";
import { contactSubmissions } from "@/db/schema";
import { requireAdminSession } from "@/lib/auth";
import { getCmsCounts, listAdminPosts, listAdminProjects, listAudit } from "@/lib/cms/repository";
import { AdminNav } from "./AdminNav";
import { CmsImportButton } from "./CmsImportButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin CMS | AliDvlpr", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const session = await requireAdminSession();
  let databaseUnavailable = false;
  let counts = { posts: [] as Array<{ status: string; value: number }>, projects: [] as Array<{ status: string; value: number }> };
  let recentPosts: Awaited<ReturnType<typeof listAdminPosts>> = [];
  let recentProjects: Awaited<ReturnType<typeof listAdminProjects>> = [];
  let audit: Awaited<ReturnType<typeof listAudit>> = [];
  let recentSubmissions: Array<{ id: string; requestId: string; subject: string; status: string; createdAt: string }> = [];
  let submissionCount = 0;
  try {
    const db = getDb();
    const [cmsCounts, posts, projects, actions, submissions, [submissionTotal]] = await Promise.all([
      getCmsCounts(), listAdminPosts(), listAdminProjects(), listAudit(8),
      db.select({ id: contactSubmissions.id, requestId: contactSubmissions.requestId, subject: contactSubmissions.subject, status: contactSubmissions.status, createdAt: contactSubmissions.createdAt }).from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt)).limit(5),
      db.select({ value: count() }).from(contactSubmissions),
    ]);
    counts = cmsCounts; recentPosts = posts.slice(0, 5); recentProjects = projects.slice(0, 5); audit = actions; recentSubmissions = submissions; submissionCount = submissionTotal?.value ?? 0;
  } catch { databaseUnavailable = true; }
  const postCount = (status: string) => counts.posts.find((item) => item.status === status)?.value ?? 0;
  const projectCount = (status: string) => counts.projects.find((item) => item.status === status)?.value ?? 0;
  const contentEmpty = counts.posts.length === 0 && counts.projects.length === 0;
  return <main className="admin-page" id="main-content"><AdminNav email={session.user.email} />
    <section className="admin-heading"><p>PROTECTED / CONTENT CONTROL PLANE</p><h1>CMS overview.</h1><span>{databaseUnavailable ? "DATABASE MIGRATION REQUIRED" : "DATABASE CONNECTED / OWNER SESSION ACTIVE"}</span></section>
    <section className="admin-metrics cms-dashboard-metrics">
      <article><span>TOTAL POSTS</span><strong>{counts.posts.reduce((sum, item) => sum + item.value, 0)}</strong></article><article><span>DRAFT POSTS</span><strong>{postCount("draft")}</strong></article><article><span>SCHEDULED</span><strong>{postCount("scheduled")}</strong></article><article><span>PUBLISHED POSTS</span><strong>{postCount("published")}</strong></article><article><span>TOTAL PROJECTS</span><strong>{counts.projects.reduce((sum, item) => sum + item.value, 0)}</strong></article><article><span>DRAFT PROJECTS</span><strong>{projectCount("draft")}</strong></article><article><span>PUBLISHED PROJECTS</span><strong>{projectCount("published")}</strong></article><article><span>SUBMISSIONS</span><strong>{submissionCount}</strong></article>
    </section>
    {(databaseUnavailable || contentEmpty) && <section className="admin-panel cms-setup-panel"><div className="admin-panel-head"><h2>{databaseUnavailable ? "CMS setup required" : "Import existing content"}</h2><span>{databaseUnavailable ? "MIGRATION 0001" : "IDEMPOTENT SEED"}</span></div><p>{databaseUnavailable ? <>Apply <code>drizzle/0001_phase_seven_cms.sql</code> to the local D1 database, restart the dev server, then import the checked-in posts and projects once.</> : "The CMS database is ready. Import the existing MDX posts and typed project records without creating duplicates."}</p>{!databaseUnavailable && <CmsImportButton />}</section>}
    <section className="admin-panel"><div className="admin-panel-head"><h2>Quick actions</h2><span>OWNER ONLY</span></div><div className="admin-action-grid"><Link className="admin-action-card" href="/admin/posts/new"><span>CREATE</span><strong>New post</strong><small>Write, preview, schedule, or publish an article.</small></Link><Link className="admin-action-card" href="/admin/projects/new"><span>CREATE</span><strong>New project</strong><small>Add a structured project case study.</small></Link><Link className="admin-action-card" href="/admin/media"><span>R2</span><strong>Upload media</strong><small>Manage editorial images and accessible alt text.</small></Link><Link className="admin-action-card" href="/admin/posts?status=draft"><span>REVIEW</span><strong>Review drafts</strong><small>Continue unpublished work.</small></Link><Link className="admin-action-card" href="/" target="_blank"><span>PUBLIC</span><strong>View public site</strong><small>Open the production-facing portfolio.</small></Link></div></section>
    <section className="admin-two-column"><div className="admin-panel"><div className="admin-panel-head"><h2>Recent edits</h2><span>CONTENT</span></div>{[...recentPosts.map((item) => ({ type: "POST", id: item.id, title: item.title, updatedAt: item.updatedAt, href: `/admin/posts/${item.id}/edit` })), ...recentProjects.map((item) => ({ type: "PROJECT", id: item.id, title: item.title, updatedAt: item.updatedAt, href: `/admin/projects/${item.id}/edit` }))].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 7).map((item) => <Link className="admin-list-row" href={item.href} key={`${item.type}-${item.id}`}><span>{item.type}</span><b>{item.title}</b><time>{item.updatedAt.slice(0, 10)}</time></Link>)}</div><div className="admin-panel"><div className="admin-panel-head"><h2>Scheduled publications</h2><span>UTC</span></div>{recentPosts.filter((post) => post.status === "scheduled").map((post) => <Link className="admin-list-row" href={`/admin/posts/${post.id}/edit`} key={post.id}><span>SCHEDULED</span><b>{post.title}</b><time>{post.scheduledAt?.replace("T", " ").slice(0, 16)}</time></Link>)}{!recentPosts.some((post) => post.status === "scheduled") && <div className="admin-empty-inline">No scheduled posts.</div>}</div></section>
    <section className="admin-two-column"><div className="admin-panel"><div className="admin-panel-head"><h2>Recent contact submissions</h2><span>{submissionCount} TOTAL</span></div>{recentSubmissions.map((item) => <Link className="admin-list-row" href={`/admin/submissions/${item.id}`} key={item.id}><span>{item.status}</span><b>{item.subject}</b><time>{item.createdAt.slice(0, 10)}</time></Link>)}</div><div className="admin-panel"><div className="admin-panel-head"><h2>Recent admin actions</h2><Link href="/admin/audit">VIEW ALL</Link></div>{audit.map((event) => <article className="admin-list-row" key={event.id}><span>{event.action}</span><b>{event.entityType}</b><time>{event.createdAt.slice(0, 16).replace("T", " ")}</time></article>)}</div></section>
  </main>;
}
