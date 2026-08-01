import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { getAdminPost } from "@/lib/cms/repository";
import { SafeArticleBody } from "@/app/blog/SafeArticleBody";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Draft Preview | AliDvlpr CMS", robots: { index: false, follow: false, nocache: true } };
export default async function PostPreview({ params }: { params: Promise<{ id: string }> }) { await requireAdminSession(); const post = await getAdminPost((await params).id); if (!post) notFound(); return <main className="content-page article-page cms-draft-preview" id="main-content"><div className="cms-preview-banner">ADMIN PREVIEW · {post.status.toUpperCase()} · NOT PUBLIC <Link href={`/admin/posts/${post.id}/edit`}>RETURN TO EDITOR</Link></div><header className="article-header"><p>{post.tags.join(" / ")}</p><h1>{post.title}</h1><em>{post.description}</em></header><article className="article-body"><SafeArticleBody source={post.content} /></article></main>; }
