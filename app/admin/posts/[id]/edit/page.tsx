import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { getAdminPost, getRevisions } from "@/lib/cms/repository";
import { AdminNav } from "../../../AdminNav";
import { PostEditor } from "../../../ContentEditor";
import { RevisionRestoreButton } from "../../../RevisionRestoreButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit Post | AliDvlpr CMS", robots: { index: false, follow: false } };
export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(); const post = await getAdminPost((await params).id); if (!post) notFound(); const revisions = await getRevisions("post", post.id);
  return <main className="admin-page" id="main-content"><AdminNav email={session.user.email} /><section className="admin-heading"><p>CONTENT / EDIT POST</p><h1>{post.title}</h1><span>CREATED {post.createdAt.slice(0, 10)} / UPDATED {post.updatedAt.slice(0, 10)}</span></section><PostEditor initial={{ ...post, seoTitle: post.seoTitle, seoDescription: post.seoDescription, canonicalUrl: post.canonicalUrl }} /><section className="admin-panel cms-revisions"><div className="admin-panel-head"><h2>Revision history</h2><span>IMMUTABLE</span></div>{revisions.map((revision) => <article key={revision.id}><b>v{revision.version}</b><span>{revision.action}</span><time>{revision.createdAt.replace("T", " ").slice(0, 16)}</time><small>{revision.createdBy}</small>{revision.version !== post.version && <RevisionRestoreButton revisionId={revision.id} version={post.version} />}</article>)}</section></main>;
}
