import type { Metadata } from "next";
import Link from "next/link";
import { count, desc } from "drizzle-orm";
import { getDb } from "@/db";
import { analyticsEvents, contactSubmissions } from "@/db/schema";
import { requireAdminSession } from "@/lib/auth";
import { getAllBlogPosts } from "@/lib/content";
import { projects } from "@/content/projects";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin | Ali Mohammadi", robots: { index: false, follow: false } };

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const session = await requireAdminSession();
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const drafts = getAllBlogPosts({ includeDrafts: true }).filter((post) => post.status === "draft");
  let submissions: Array<{
    id: string;
    requestId: string;
    name: string;
    email: string;
    subject: string;
    status: string;
    delivery: string;
    spamScore: number;
    createdAt: string;
  }> = [];
  let total = { value: 0 };
  let eventSummary: Array<{ event: string; value: number }> = [];
  let databaseUnavailable = false;

  try {
    const db = getDb();
    const [submissionRows, [totalRow], analyticsRows] = await Promise.all([
      db.select({
        id: contactSubmissions.id, requestId: contactSubmissions.requestId, name: contactSubmissions.name,
        email: contactSubmissions.email, subject: contactSubmissions.subject, status: contactSubmissions.status,
        delivery: contactSubmissions.emailDeliveryStatus, spamScore: contactSubmissions.spamScore, createdAt: contactSubmissions.createdAt,
      }).from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt)).limit(20).offset((page - 1) * 20),
      db.select({ value: count() }).from(contactSubmissions),
      db.select({ event: analyticsEvents.event, value: count() }).from(analyticsEvents).groupBy(analyticsEvents.event),
    ]);

    submissions = submissionRows;
    total = totalRow ?? { value: 0 };
    eventSummary = analyticsRows;
  } catch {
    databaseUnavailable = true;
  }

  const deliveryFailures = submissions.filter((submission) => submission.delivery === "failed").length;
  const spamFlagged = submissions.filter((submission) => submission.status === "spam").length;

  return <main className="admin-page" id="main-content">
    <header className="admin-nav"><Link href="/">AM / SYSTEM</Link><div><span>{session.user.email}</span><form action="/api/admin/logout" method="post"><button type="submit">SIGN OUT</button></form></div></header>
    <section className="admin-heading"><p>PROTECTED / CONTROL PLANE</p><h1>Admin overview.</h1><span>{databaseUnavailable ? "LOCAL SESSION ACTIVE / DATABASE OFFLINE" : "LOCAL SESSION ACTIVE / DATABASE CONNECTED"}</span></section>
    <section className="admin-metrics">
      <article><span>SUBMISSIONS</span><strong>{total.value}</strong></article>
      <article><span>DRAFT POSTS</span><strong>{drafts.length}</strong></article>
      <article><span>PROJECT RECORDS</span><strong>{projects.length}</strong></article>
      <article><span>EVENT TYPES</span><strong>{eventSummary.length}</strong></article>
    </section>
    <section className="admin-two-column admin-top-grid">
      <div className="admin-panel">
        <div className="admin-panel-head"><h2>Quick actions</h2><span>LOCAL</span></div>
        <div className="admin-action-grid">
          <Link href="/admin" className="admin-action-card"><span>QUEUE</span><strong>Review submissions</strong><small>Inspect recent contact requests and moderation states.</small></Link>
          <Link href="/contact" className="admin-action-card"><span>CONTACT</span><strong>Open public contact page</strong><small>Verify the visitor flow in the live interface.</small></Link>
          <Link href="/blog" className="admin-action-card"><span>CONTENT</span><strong>Review published blog</strong><small>Check public content routes without leaving the current app.</small></Link>
          <Link href="/projects" className="admin-action-card"><span>PROJECTS</span><strong>Inspect portfolio entries</strong><small>Confirm case studies and service content are present.</small></Link>
        </div>
      </div>
      <div className="admin-panel">
        <div className="admin-panel-head"><h2>System status</h2><span>{databaseUnavailable ? "DEGRADED" : "HEALTHY"}</span></div>
        <div className="admin-health-grid">
          <article><span>SESSION</span><strong>ACTIVE</strong><small>Local owner session cookie is present.</small></article>
          <article><span>DATABASE</span><strong>{databaseUnavailable ? "OFFLINE" : "CONNECTED"}</strong><small>{databaseUnavailable ? "Admin overview is running in fallback mode." : "D1-backed admin data is available."}</small></article>
          <article><span>DELIVERY FAILURES</span><strong>{deliveryFailures}</strong><small>Recent contact rows with failed delivery.</small></article>
          <article><span>SPAM FLAGGED</span><strong>{spamFlagged}</strong><small>Recent contact rows currently marked as spam.</small></article>
        </div>
      </div>
    </section>
    <section className="admin-panel">
      <div className="admin-panel-head"><h2>Contact submissions</h2><span>PAGE {page}</span></div>
      {databaseUnavailable ? <div className="admin-empty-state"><strong>Database unavailable</strong><p>The admin shell is working, but the local database binding is not available right now. Restart the local stack or verify D1 state if you want live submissions here.</p></div> : submissions.length ? <>
        <div className="admin-table-wrap"><table><thead><tr><th>TIME</th><th>REQUEST</th><th>SENDER</th><th>SUBJECT</th><th>STATUS</th><th>DELIVERY</th></tr></thead>
        <tbody>{submissions.map((submission) => <tr key={submission.id}>
          <td><time>{submission.createdAt.slice(0, 16).replace("T", " ")}</time></td>
          <td><Link href={`/admin/submissions/${submission.id}`}>{submission.requestId.slice(0, 18)}…</Link></td>
          <td>{submission.name}<small>{submission.email}</small></td><td>{submission.subject}</td><td><b>{submission.status}</b></td><td>{submission.delivery}</td>
        </tr>)}</tbody></table></div>
        <nav className="admin-pagination">{page > 1 ? <Link href={`/admin?page=${page - 1}`}>← PREVIOUS</Link> : <span />} {page * 20 < total.value ? <Link href={`/admin?page=${page + 1}`}>NEXT →</Link> : <span />}</nav>
      </> : <div className="admin-empty-state"><strong>No submissions yet</strong><p>When visitors send messages through the contact form, they’ll appear here for review and moderation.</p></div>}
    </section>
    <section className="admin-two-column">
      <div className="admin-panel">
        <div className="admin-panel-head"><h2>Content queue</h2><span>{drafts.length} DRAFTS</span></div>
        {drafts.length ? drafts.map((post) => <article className="admin-list-row" key={post.slug}><span>DRAFT</span><b>{post.title}</b></article>) : <div className="admin-empty-inline">No draft posts are waiting right now.</div>}
        {projects.map((project) => <article className="admin-list-row" key={project.slug}><span>PROJECT</span><b>{project.title}</b></article>)}
      </div>
      <div className="admin-panel">
        <div className="admin-panel-head"><h2>Privacy-first analytics</h2><span>{eventSummary.length} EVENTS</span></div>
        {eventSummary.length ? eventSummary.map((item) => <article className="admin-list-row" key={item.event}><span>{item.event}</span><b>{item.value}</b></article>) : <div className="admin-empty-inline">No analytics events have been captured in this local session yet.</div>}
      </div>
    </section>
  </main>;
}
