"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { BlogPost } from "@/lib/content";
import { trackEvent } from "@/lib/analytics-client";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "2-digit", timeZone: "UTC" }).format(new Date(value));
}

export function BlogArchive({ posts }: { posts: BlogPost[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [tag, setTag] = useState(params.get("tag") ?? "All");
  const tags = ["All", ...new Set(posts.flatMap((post) => post.tags))];
  const filtered = useMemo(() => posts.filter((post) => {
    const matchesTag = tag === "All" || post.tags.includes(tag);
    const haystack = `${post.title} ${post.description} ${post.tags.join(" ")}`.toLowerCase();
    return matchesTag && haystack.includes(query.toLowerCase().trim());
  }), [posts, query, tag]);
  const featured = posts.find((post) => post.featured) ?? posts[0];

  function update(nextTag: string, nextQuery = query) {
    setTag(nextTag);
    const search = new URLSearchParams();
    if (nextTag !== "All") search.set("tag", nextTag);
    if (nextQuery.trim()) search.set("q", nextQuery.trim());
    router.replace(`${pathname}${search.size ? `?${search}` : ""}`, { scroll: false });
    if (nextTag !== tag) trackEvent("article_tag_selected", { tag: nextTag });
  }

  return <>
    {featured && <Link className="featured-article" href={`/blog/${featured.slug}`}><span>FEATURED DOCUMENT</span><div><p>{featured.tags.join(" / ")}</p><h2>{featured.title}</h2><em>{featured.description}</em></div><b>{featured.readingTime} MIN READ ↗</b></Link>}
    <div className="archive-controls"><label><span>SEARCH NOTES</span><input type="search" value={query} placeholder="architecture, Redis, workers…" onChange={(event) => { setQuery(event.target.value); update(tag, event.target.value); }} /></label><div aria-label="Filter articles by tag">{tags.map((item) => <button aria-pressed={tag === item} onClick={() => update(item)} key={item}>{item}</button>)}</div><p role="status">{filtered.length} DOCUMENTS</p></div>
    <section className="post-index" aria-label="Published articles">{filtered.map((post, index) => <Link className="post-row" href={`/blog/${post.slug}`} key={post.slug}>
      <span>{String(index + 1).padStart(2, "0")}</span><div><p>{post.tags.join(" / ")}</p><h2>{post.title}</h2><em>{post.description}</em></div><div><time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>{post.updatedAt && <small>UPDATED {formatDate(post.updatedAt)}</small>}<b>{post.readingTime} MIN READ ↗</b></div>
    </Link>)}</section>
  </>;
}
