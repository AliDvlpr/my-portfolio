import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { adminAudit, contactSubmissions } from "@/db/schema";
import { requireAdminSession } from "@/lib/auth";
import { StatusForm } from "./StatusForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Submission | Admin", robots: { index: false, follow: false } };

export default async function SubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  const id = (await params).id;
  const db = getDb();
  const [submission] = await db.select().from(contactSubmissions).where(eq(contactSubmissions.id, id)).limit(1);
  if (!submission) notFound();
  await db.insert(adminAudit).values({
    id: crypto.randomUUID(), action: "submission.read", entityType: "contact_submission",
    entityId: id, actor: session.user.email, metadata: null, createdAt: new Date().toISOString(),
  });
  return <main className="admin-page admin-detail" id="main-content">
    <header className="admin-nav"><Link href="/admin">← SUBMISSIONS</Link><span>{submission.requestId}</span></header>
    <section className="admin-heading"><p>CONTACT / {submission.status.toUpperCase()}</p><h1>{submission.subject}</h1><span>{submission.createdAt}</span></section>
    <section className="submission-card"><dl><div><dt>NAME</dt><dd>{submission.name}</dd></div><div><dt>EMAIL</dt><dd>{submission.email}</dd></div><div><dt>COMPANY</dt><dd>{submission.company || "—"}</dd></div><div><dt>DELIVERY</dt><dd>{submission.emailDeliveryStatus}</dd></div><div><dt>SPAM SCORE</dt><dd>{submission.spamScore}</dd></div></dl><article>{submission.message}</article><StatusForm id={id} initialStatus={submission.status} /></section>
  </main>;
}
