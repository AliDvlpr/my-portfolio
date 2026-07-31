import type { Metadata } from "next";
import Link from "next/link";
import { count, desc } from "drizzle-orm";
import { getDb } from "@/db";
import { analyticsEvents, contactSubmissions } from "@/db/schema";
import { requireChatGPTUser, chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { isAdminEmail } from "@/lib/env";
import { getAllBlogPosts } from "@/lib/content";
import { projects } from "@/content/projects";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin | Ali Mohammadi", robots: { index: false, follow: false } };

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const user = await requireChatGPTUser("/admin");
  if (!isAdminEmail(user.email)) return <AdminDenied email={user.email} />;
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const db = getDb();
  const [submissions, [total], eventSummary] = await Promise.all([
    db.select({
      id: contactSubmissions.id, requestId: contactSubmissions.requestId, name: contactSubmissions.name,
      email: contactSubmissions.email, subject: contactSubmissions.subject, status: contactSubmissions.status,
      delivery: contactSubmissions.emailDeliveryStatus, spamScore: contactSubmissions.spamScore, createdAt: contactSubmissions.createdAt,
    }).from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt)).limit(20).offset((page - 1) * 20),
    db.select({ value: count() }).from(contactSubmissions),
    db.select({ event: analyticsEvents.event, value: count() }).from(analyticsEvents).groupBy(analyticsEvents.event),
  ]);
  const drafts = getAllBlogPosts({ includeDrafts: true }).filter((post) => post.status === "draft");
  return <main className="admin-page" id="main-content">
    <header className="admin-nav"><Link href="/">AM / SYSTEM</Link><div><span>{user.email}</span><a href={chatGPTSignOutPath("/")}>SIGN OUT</a></div></header>
    <section className="admin-heading"><p>PROTECTED / CONTROL PLANE</p><h1>Production overview.</h1><span>AUTHENTICATED VIA CHATGPT</span></section>
    <section className="admin-metrics">
      <article><span>SUBMISSIONS</span><strong>{total.value}</strong></article>
      <article><span>DRAFT POSTS</span><strong>{drafts.length}</strong></article>
      <article><span>PROJECT RECORDS</span><strong>{projects.length}</strong></article>
      <article><span>EVENT TYPES</span><strong>{eventSummary.length}</strong></article>
    </section>
    <section className="admin-panel">
      <div className="admin-panel-head"><h2>Contact submissions</h2><span>PAGE {page}</span></div>
      <div className="admin-table-wrap"><table><thead><tr><th>TIME</th><th>REQUEST</th><th>SENDER</th><th>SUBJECT</th><th>STATUS</th><th>DELIVERY</th></tr></thead>
      <tbody>{submissions.map((submission) => <tr key={submission.id}>
        <td><time>{submission.createdAt.slice(0, 16).replace("T", " ")}</time></td>
        <td><Link href={`/admin/submissions/${submission.id}`}>{submission.requestId.slice(0, 18)}…</Link></td>
        <td>{submission.name}<small>{submission.email}</small></td><td>{submission.subject}</td><td><b>{submission.status}</b></td><td>{submission.delivery}</td>
      </tr>)}</tbody></table></div>
      <nav className="admin-pagination">{page > 1 && <Link href={`/admin?page=${page - 1}`}>← PREVIOUS</Link>}{page * 20 < total.value && <Link href={`/admin?page=${page + 1}`}>NEXT →</Link>}</nav>
    </section>
    <section className="admin-two-column"><div className="admin-panel"><div className="admin-panel-head"><h2>Content</h2></div>{drafts.map((post) => <article className="admin-list-row" key={post.slug}><span>DRAFT</span><b>{post.title}</b></article>)}{projects.map((project) => <article className="admin-list-row" key={project.slug}><span>PROJECT</span><b>{project.title}</b></article>)}</div>
    <div className="admin-panel"><div className="admin-panel-head"><h2>Privacy-first analytics</h2></div>{eventSummary.map((item) => <article className="admin-list-row" key={item.event}><span>{item.event}</span><b>{item.value}</b></article>)}</div></section>
  </main>;
}

function AdminDenied({ email }: { email: string }) {
  return <main className="admin-denied" id="main-content"><p>403 / AUTHORIZATION FAILED</p><h1>Authenticated,<br />not authorized.</h1><span>{email}</span><Link href="/">RETURN TO PORTFOLIO</Link></main>;
}
