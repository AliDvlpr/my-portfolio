import { z } from "zod";

const blogFrontmatterSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  status: z.enum(["published", "draft"]),
  tags: z.array(z.string().min(1)).min(1),
  featured: z.boolean().default(false),
});

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  status: "published" | "draft";
  tags: string[];
  featured: boolean;
  readingTime: number;
  body: string;
  headings: { level: number; text: string; id: string }[];
};

const blogModules = typeof import.meta.glob === "function"
  ? import.meta.glob("/content/blog/*.mdx", { query: "?raw", import: "default", eager: true }) as Record<string, string>
  : {};

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

function parseFrontmatter(source: string) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) throw new Error("MDX frontmatter is required.");
  const data: Record<string, unknown> = {};
  let activeList: string | null = null;
  for (const rawLine of match[1].split(/\r?\n/)) {
    const listItem = rawLine.match(/^\s+-\s+(.+)$/);
    if (listItem && activeList) {
      (data[activeList] as string[]).push(listItem[1].trim());
      continue;
    }
    const field = rawLine.match(/^([A-Za-z][\w]*):\s*(.*)$/);
    if (!field) throw new Error(`Unsupported frontmatter line: ${rawLine}`);
    const [, key, rawValue] = field;
    activeList = null;
    if (!rawValue) {
      data[key] = [];
      activeList = key;
    } else if (rawValue === "true" || rawValue === "false") {
      data[key] = rawValue === "true";
    } else {
      data[key] = rawValue.trim();
    }
  }
  return { data, content: source.slice(match[0].length) };
}

export function parseBlogSource(slug: string, source: string): BlogPost {
  const parsed = parseFrontmatter(source);
  const frontmatter = blogFrontmatterSchema.parse(parsed.data);
  const words = parsed.content.replace(/```[\s\S]*?```/g, "").trim().split(/\s+/).filter(Boolean).length;
  const headings = [...parsed.content.matchAll(/^(#{2,3})\s+(.+)$/gm)].map((match) => ({
    level: match[1].length,
    text: match[2].trim(),
    id: slugify(match[2]),
  }));
  return {
    slug,
    ...frontmatter,
    publishedAt: frontmatter.publishedAt.toISOString(),
    updatedAt: frontmatter.updatedAt?.toISOString(),
    readingTime: Math.max(1, Math.ceil(words / 210)),
    body: parsed.content,
    headings,
  };
}

export function parseBlogSources(sources: Record<string, string>, { includeDrafts = false } = {}) {
  const posts = Object.entries(sources).map(([path, source]) => {
    const slug = path.split("/").pop()!.replace(/\.mdx$/, "");
    return parseBlogSource(slug, source);
  });
  const seen = new Set<string>();
  for (const post of posts) {
    if (seen.has(post.slug)) throw new Error(`Duplicate blog slug: ${post.slug}`);
    seen.add(post.slug);
  }
  return posts
    .filter((post) => includeDrafts || post.status === "published")
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getAllBlogPosts({ includeDrafts = false } = {}) {
  return parseBlogSources(blogModules, { includeDrafts });
}

export function getBlogPost(slug: string, includeDrafts = false) {
  return getAllBlogPosts({ includeDrafts }).find((post) => post.slug === slug);
}

export function getRelatedPosts(post: BlogPost, limit = 2) {
  return getAllBlogPosts().filter((candidate) => candidate.slug !== post.slug)
    .map((candidate) => ({ candidate, score: candidate.tags.filter((tag) => post.tags.includes(tag)).length }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}
