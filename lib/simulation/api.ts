import { getAllBlogPosts } from "@/lib/content";
import { experience as profileTimeline } from "@/content/profile";
import { projects } from "@/content/projects";
import { uses as usesSections } from "@/content/uses";
import type { ApiEndpoint } from "./types";

export const apiEndpoints: ApiEndpoint[] = [
  {
    id: "profile",
    method: "GET",
    path: "/api/v1/profile",
    summary: "Returns the engineer profile, focus areas, and operating principles.",
    auth: "public",
    service: "content-service",
    rateLimit: "120 req/min",
  },
  {
    id: "projects",
    method: "GET",
    path: "/api/v1/projects",
    summary: "Lists projects, with optional featured filtering.",
    auth: "public",
    service: "project-service",
    params: [{ key: "featured", label: "featured", placeholder: "true" }],
    rateLimit: "120 req/min",
  },
  {
    id: "project-detail",
    method: "GET",
    path: "/api/v1/projects/:slug",
    summary: "Returns a single project case-study summary.",
    auth: "public",
    service: "project-service",
    params: [{ key: "slug", label: "slug", required: true, placeholder: "django-store" }],
    rateLimit: "120 req/min",
  },
  {
    id: "experience",
    method: "GET",
    path: "/api/v1/experience",
    summary: "Returns the engineering timeline and role progression.",
    auth: "public",
    service: "content-service",
    rateLimit: "120 req/min",
  },
  {
    id: "stack",
    method: "GET",
    path: "/api/v1/stack",
    summary: "Returns the current tools and infrastructure preferences.",
    auth: "public",
    service: "content-service",
    rateLimit: "120 req/min",
  },
  {
    id: "articles",
    method: "GET",
    path: "/api/v1/articles",
    summary: "Returns published engineering writing.",
    auth: "public",
    service: "content-service",
    params: [{ key: "tag", label: "tag", placeholder: "Redis" }],
    rateLimit: "120 req/min",
  },
  {
    id: "health",
    method: "GET",
    path: "/api/v1/system/health",
    summary: "Returns simulated health for core services.",
    auth: "public",
    service: "observability",
    rateLimit: "240 req/min",
  },
  {
    id: "contact-validate",
    method: "POST",
    path: "/api/v1/contact/validate",
    summary: "Validates a contact-style payload without storing or sending it.",
    auth: "optional",
    service: "project-service",
    bodyExample: `{\n  "name": "Jane Doe",\n  "email": "jane@example.com",\n  "subject": "Project inquiry",\n  "message": "I would like to discuss a backend project."\n}`,
    rateLimit: "30 req/min",
  },
];

export function getEndpointById(id: string) {
  return apiEndpoints.find((endpoint) => endpoint.id === id) ?? apiEndpoints[0];
}

export function buildEndpointResponse(id: string, params: Record<string, string>, body?: string) {
  switch (id) {
    case "profile":
      return {
        data: {
          name: "Ali Mohammadi",
          title: "Backend Engineer",
          focus: ["FastAPI services", "Django systems", "PostgreSQL", "Redis", "queues", "observability"],
          currentLearning: "Production-ready architecture and backend platform design",
        },
        meta: { cached: true, source: "content/profile.ts" },
      };
    case "projects": {
      const featured = params.featured === "true";
      const data = (featured ? projects.filter((project) => project.featured) : projects).map((project) => ({
        slug: project.slug,
        title: project.title,
        status: project.status,
        stack: project.stack,
        version: project.version,
      }));
      return { data, meta: { count: data.length, cached: featured } };
    }
    case "project-detail": {
      const project = projects.find((entry) => entry.slug === params.slug);
      if (!project) return null;
      return {
        data: {
          slug: project.slug,
          title: project.title,
          summary: project.summary,
          architecture: project.architecture,
          metrics: project.metrics,
          responseExample: project.response,
        },
        meta: { cached: false },
      };
    }
    case "experience":
      return {
        data: profileTimeline.map((entry) => ({
          period: entry.period,
          role: entry.role,
          company: entry.company,
          detail: entry.detail,
        })),
        meta: { count: profileTimeline.length },
      };
    case "stack":
      return {
        data: usesSections.map((section) => ({
          category: section.category,
          tools: section.items.map((item) => ({ name: item[0], status: item[2] })),
        })),
        meta: { count: usesSections.length },
      };
    case "articles": {
      const tag = params.tag?.toLowerCase();
      const posts = getAllBlogPosts()
        .filter((post) => !tag || post.tags.some((value) => value.toLowerCase() === tag))
        .map((post) => ({
          slug: post.slug,
          title: post.title,
          readingTime: post.readingTime,
          publishedAt: post.publishedAt,
          tags: post.tags,
        }));
      return { data: posts, meta: { count: posts.length, filteredByTag: params.tag || null } };
    }
    case "health":
      return {
        data: {
          status: "online",
          services: ["edge", "router", "project-service", "redis", "postgres", "worker"],
          note: "Illustrative health generated by the Phase 5 simulation engine.",
        },
      };
    case "contact-validate": {
      const payload = body ? JSON.parse(body) as Record<string, string> : {};
      const fields: Record<string, string> = {};
      if (!payload.name?.trim()) fields.name = "Name is required.";
      if (!payload.email?.includes("@")) fields.email = "Enter a valid email address.";
      if (!payload.subject?.trim()) fields.subject = "Subject is required.";
      if (!payload.message?.trim() || payload.message.trim().length < 20) fields.message = "Message must be at least 20 characters.";
      return Object.keys(fields).length
        ? { success: false, code: "VALIDATION_ERROR", fields }
        : { success: true, message: "Payload accepted for further processing." };
    }
    default:
      return { data: null };
  }
}
