import type { Metadata } from "next";
import Link from "next/link";
import { getAllBlogPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Backend Engineering Notes | Ali Mohammadi",
  description: "Practical notes on FastAPI, Redis, queues, reliability, and production backend architecture.",
  alternates: { canonical: "/blog" },
  openGraph: { title: "Backend Engineering Notes", description: "Production-minded backend engineering articles.", url: "/blog", type: "website" },
};

export default function BlogPage() {
  const posts = getAllBlogPosts();
  return <main className="content-page" id="main-content">
    <ContentNav />
    <header className="content-hero"><p>CONTENT / ENGINEERING NOTES</p><h1>Systems, explained<br />without the noise.</h1><span>{posts.length} PUBLISHED ARTICLES</span></header>
    <section className="post-index" aria-label="Published articles">
      {posts.map((post, index) => <Link className="post-row" href={`/blog/${post.slug}`} key={post.slug}>
        <span>{String(index + 1).padStart(2, "0")}</span>
        <div><p>{post.tags.join(" / ")}</p><h2>{post.title}</h2><em>{post.description}</em></div>
        <div><time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time><b>{post.readingTime} MIN READ ↗</b></div>
      </Link>)}
    </section>
  </main>;
}

export function ContentNav() {
  return <nav className="content-nav" aria-label="Content navigation"><Link href="/">AM / PORTFOLIO</Link><div><Link href="/blog">BLOG</Link><Link href="/projects/django-store">PROJECTS</Link><Link href="/resume">RESUME</Link></div></nav>;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "2-digit", timeZone: "UTC" }).format(new Date(value));
}
