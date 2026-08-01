import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminSession } from "@/lib/auth";
import { listAdminPosts } from "@/lib/cms/repository";
import { AdminNav } from "../AdminNav";
import { ContentActions } from "../ContentActions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Posts | AliDvlpr CMS", robots: { index: false, follow: false } };

export default async function AdminPostsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const session = await requireAdminSession();
  const params = await searchParams;
  let posts: Awaited<ReturnType<typeof listAdminPosts>> = [];
  let unavailable = false;
  try { posts = await listAdminPosts(); } catch { unavailable = true; }
  const query = (params.q ?? "").toLowerCase();
  const filtered = posts.filter((post) => (!query || `${post.title} ${post.slug} ${post.tags.join(" ")}`.toLowerCase().includes(query)) && (!params.status || post.status === params.status));
  return <main className="admin-page" id="main-content"><AdminNav email={session.user.email} /><section className="admin-heading"><p>CONTENT / BLOG</p><h1>Posts.</h1><Link className="admin-primary-link" href="/admin/posts/new">NEW POST</Link></section>
    <form className="cms-filter-bar"><label>Search<input name="q" defaultValue={params.q} /></label><label>Status<select name="status" defaultValue={params.status ?? ""}><option value="">All</option><option value="draft">Draft</option><option value="scheduled">Scheduled</option><option value="published">Published</option><option value="archived">Archived</option></select></label><button>FILTER</button></form>
    <section className="admin-panel"><div className="admin-panel-head"><h2>Article registry</h2><span>{filtered.length} POSTS</span></div>{unavailable ? <div className="admin-empty-state"><strong>CMS tables unavailable</strong><p>Apply migration 0001 and import the existing source content.</p></div> : filtered.length ? <div className="admin-table-wrap"><table><thead><tr><th>TITLE</th><th>STATUS</th><th>TAGS</th><th>PUBLISHED</th><th>UPDATED</th><th>ACTIONS</th></tr></thead><tbody>{filtered.map((post) => <tr key={post.id}><td><b>{post.title}</b><small>/{post.slug}</small></td><td>{post.status}</td><td>{post.tags.join(", ")}</td><td>{post.publishedAt?.slice(0, 10) ?? "—"}</td><td>{post.updatedAt.slice(0, 16).replace("T", " ")}</td><td><ContentActions type="posts" id={post.id} slug={post.slug} status={post.status} editHref={`/admin/posts/${post.id}/edit`} previewHref={`/admin/preview/posts/${post.id}`} /></td></tr>)}</tbody></table></div> : <div className="admin-empty-state"><strong>No posts found</strong><p>Create a draft or import existing MDX content.</p></div>}</section>
  </main>;
}
