import type { MetadataRoute } from "next";
import { getAllBlogPosts } from "@/lib/content";
import { projects } from "@/content/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.SITE_URL ?? "http://localhost:5173").replace(/\/$/, "");
  return [
    { url: base, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: .8 },
    { url: `${base}/resume`, changeFrequency: "monthly", priority: .7 },
    ...getAllBlogPosts().map((post) => ({ url: `${base}/blog/${post.slug}`, lastModified: post.updatedAt ?? post.publishedAt, changeFrequency: "monthly" as const, priority: .7 })),
    ...projects.map((project) => ({ url: `${base}/projects/${project.slug}`, changeFrequency: "monthly" as const, priority: .8 })),
  ];
}
