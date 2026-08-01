import type { Metadata } from "next";
import { getPublishedBlogPosts } from "@/lib/cms/repository";
import { PageHeader } from "../PagePrimitives";
import { BlogArchive } from "./BlogArchive";

export const metadata: Metadata = {
  title: "Blog | Ali — Backend Engineering Notes",
  description: "Practical writing about architecture, FastAPI, Django, databases, caching, workers, and production reliability.",
  alternates: { canonical: "/blog" },
  openGraph: { title: "Backend Engineering Notes", description: "Production-minded backend engineering articles.", url: "/blog", type: "website" },
};

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();
  return <main className="route-page blog-route" id="main-content">
    <PageHeader index="03" module="ENGINEERING_NOTES" path="/blog" title={<>Systems, explained<br />without the noise.</>} description="Field notes on production APIs, data boundaries, caching, queues, and the decisions that keep systems operable." />
    <BlogArchive posts={posts} />
  </main>;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "2-digit", timeZone: "UTC" }).format(new Date(value));
}
