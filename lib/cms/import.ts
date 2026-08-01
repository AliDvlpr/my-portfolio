import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { blogPosts, cmsProjects } from "@/db/schema";
import { projects } from "@/content/projects";
import { getAllBlogPosts } from "@/lib/content";
import { savePost, saveProject } from "./repository";

const IMPORT_ACTOR = "source-import@alidvlpr.local";

export async function importExistingContent() {
  const db = getDb();
  let postsImported = 0;
  let projectsImported = 0;

  for (const post of getAllBlogPosts({ includeDrafts: true })) {
    const existing = await db.select({ id: blogPosts.id }).from(blogPosts).where(eq(blogPosts.slug, post.slug)).limit(1);
    if (existing.length) continue;
    await savePost({
      title: post.title,
      slug: post.slug,
      description: post.description,
      content: post.body,
      status: post.status,
      featured: post.featured,
      tags: post.tags,
    }, IMPORT_ACTOR);
    postsImported += 1;
  }

  for (const [sortOrder, project] of projects.entries()) {
    const existing = await db.select({ id: cmsProjects.id }).from(cmsProjects).where(eq(cmsProjects.slug, project.slug)).limit(1);
    if (existing.length) continue;
    await saveProject({
      title: project.title,
      slug: project.slug,
      summary: project.summary,
      description: project.description,
      status: "published",
      featured: project.featured,
      sortOrder,
      versionLabel: project.version,
      role: project.role,
      timeline: project.timeline,
      projectType: project.category,
      stack: project.stack,
      architecture: project.architecture,
      challenges: project.challenges,
      decisions: project.decisions,
      outcomes: project.outcomes,
      metrics: project.metrics,
      region: project.region,
      requests: project.requests,
      response: project.response,
      repositoryUrl: project.repositoryUrl,
      liveUrl: project.liveUrl,
    }, IMPORT_ACTOR);
    projectsImported += 1;
  }

  return { postsImported, projectsImported };
}
