import type { Metadata } from "next";
import { getAllBlogPosts } from "@/lib/content";
import { HomeOverview } from "./HomeOverview";

export const metadata: Metadata = {
  title: "Ali Mohammadi — Backend Engineer",
  description: "Backend engineer building maintainable Python systems, APIs, data paths, and production infrastructure.",
  alternates: { canonical: "/" },
  openGraph: { title: "Ali Mohammadi — Backend Engineer", description: "Backend systems designed for clarity, reliability, and growth.", url: "/", type: "profile" },
};

export default function Home() {
  const articles = getAllBlogPosts().slice(0, 3).map(({ slug, title, description, publishedAt, readingTime, tags }) => ({
    slug, title, description, publishedAt, readingTime, tags,
  }));
  return <HomeOverview articles={articles} />;
}
