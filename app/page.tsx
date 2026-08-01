import type { Metadata } from "next";
import { getFeaturedProjects, getPublishedBlogPosts } from "@/lib/cms/repository";
import { HomeOverview } from "./HomeOverview";

export const metadata: Metadata = {
  title: "Ali Mohammadi — Backend Engineer",
  description: "Backend engineer building maintainable Python systems, APIs, data paths, and production infrastructure.",
  alternates: { canonical: "/" },
  openGraph: { title: "Ali Mohammadi — Backend Engineer", description: "Backend systems designed for clarity, reliability, and growth.", url: "/", type: "profile" },
};

export default async function Home() {
  const [posts, featuredProjects] = await Promise.all([getPublishedBlogPosts(), getFeaturedProjects()]);
  const articles = posts.slice(0, 3).map(({ slug, title, description, publishedAt, readingTime, tags }) => ({
    slug, title, description, publishedAt, readingTime, tags,
  }));
  return <HomeOverview articles={articles} featuredProjects={featuredProjects} />;
}
