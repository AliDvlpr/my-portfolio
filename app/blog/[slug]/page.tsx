import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllBlogPosts, getBlogPost, getRelatedPosts } from "@/lib/content";
import { ContentNav, formatDate } from "../page";
import { mdxComponents } from "../mdx-components";
import { ArticleTracker } from "./ArticleTracker";

export function generateStaticParams() {
  return getAllBlogPosts().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} | Ali Mohammadi`,
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: { title: post.title, description: post.description, type: "article", url: `/blog/${slug}`, publishedTime: post.publishedAt, modifiedTime: post.updatedAt, tags: post.tags },
    twitter: { card: "summary_large_image", title: post.title, description: post.description },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();
  const posts = getAllBlogPosts();
  const index = posts.findIndex((candidate) => candidate.slug === post.slug);
  const previous = posts[index + 1];
  const next = posts[index - 1];
  const related = getRelatedPosts(post);
  const jsonLd = {
    "@context": "https://schema.org", "@type": "TechArticle", headline: post.title,
    description: post.description, datePublished: post.publishedAt, dateModified: post.updatedAt ?? post.publishedAt,
    author: { "@type": "Person", name: "Ali Mohammadi", url: "https://github.com/AliDvlpr" },
  };
  return <main className="content-page article-page" id="main-content">
    <ContentNav /><ArticleTracker slug={slug} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replaceAll("<", "\\u003c") }} />
    <header className="article-header"><p>{post.tags.join(" / ")}</p><h1>{post.title}</h1><em>{post.description}</em><div><time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time><span>{post.readingTime} MIN READ</span><span>STATUS / PUBLISHED</span></div></header>
    <div className="article-layout">
      <aside className="article-toc" aria-label="Table of contents"><p>ON THIS PAGE</p>{post.headings.map((heading) => <a className={`level-${heading.level}`} href={`#${heading.id}`} key={heading.id}>{heading.text}</a>)}</aside>
      <article className="article-body"><MDXRemote source={post.body} components={mdxComponents} /></article>
    </div>
    <nav className="article-pagination" aria-label="Article pagination">
      <div>{previous && <Link href={`/blog/${previous.slug}`}><span>PREVIOUS</span>{previous.title}</Link>}</div>
      <div>{next && <Link href={`/blog/${next.slug}`}><span>NEXT</span>{next.title}</Link>}</div>
    </nav>
    {!!related.length && <section className="related-posts"><p>RELATED SYSTEMS</p>{related.map((item) => <Link href={`/blog/${item.slug}`} key={item.slug}>{item.title}<span>↗</span></Link>)}</section>}
  </main>;
}
