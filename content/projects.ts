import { z } from "zod";

export const projectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  index: z.string(),
  title: z.string().min(2),
  category: z.string(),
  summary: z.string().min(20),
  description: z.string().min(20),
  status: z.literal("healthy"),
  version: z.string(),
  role: z.string(),
  timeline: z.string(),
  stack: z.array(z.string()).min(1),
  architecture: z.array(z.string()).min(2),
  metrics: z.array(z.object({ label: z.string(), value: z.string() })),
  challenges: z.array(z.string()),
  decisions: z.array(z.string()),
  outcomes: z.array(z.string()),
  repositoryUrl: z.string().url().optional(),
  liveUrl: z.string().url().optional(),
  featured: z.boolean(),
  region: z.string(),
  requests: z.string(),
  response: z.string(),
});

export type Project = z.infer<typeof projectSchema>;

const source = [
  {
    slug: "django-store", index: "01", title: "Django Store", category: "Commerce backend",
    summary: "An extensible commerce API built around explicit domain boundaries.",
    description: "A clean, extensible store API built around Django REST Framework and PostgreSQL.",
    status: "healthy", version: "v1.4.2", role: "Backend architecture and implementation", timeline: "2024",
    stack: ["Django", "DRF", "PostgreSQL"], architecture: ["Django REST API", "Service layer", "PostgreSQL", "Cache boundary"],
    metrics: [{ label: "UPTIME", value: "99.98%" }, { label: "REQUESTS", value: "1.2M" }, { label: "P95", value: "44ms" }],
    challenges: ["Keep product and order workflows evolvable", "Maintain predictable query behavior"],
    decisions: ["Explicit service boundaries", "Database constraints for invariants", "Versioned public API"],
    outcomes: ["Clearer feature ownership", "Safer schema evolution", "Production-ready observability surface"],
    repositoryUrl: "https://github.com/AliDvlpr/Django_Store", featured: true, region: "eu-central", requests: "1.2M",
    response: '{"status":"healthy","items":24}',
  },
  {
    slug: "ecostore", index: "02", title: "Ecostore", category: "E-commerce platform",
    summary: "A maintainable Django commerce system for product and order operations.",
    description: "A comprehensive Django commerce platform designed for maintainable product and order workflows.",
    status: "healthy", version: "v2.1.0", role: "Backend engineering", timeline: "2023–2024",
    stack: ["Python", "Django", "PostgreSQL"], architecture: ["Django application", "Order domain", "PostgreSQL", "Background tasks"],
    metrics: [{ label: "UPTIME", value: "99.98%" }, { label: "REQUESTS", value: "864K" }, { label: "P95", value: "36ms" }],
    challenges: ["Coordinate inventory and order state", "Keep operational workflows understandable"],
    decisions: ["Transactional order updates", "Typed domain statuses", "Bounded asynchronous work"],
    outcomes: ["Reliable order transitions", "Simpler operational review", "Reduced coupling across features"],
    repositoryUrl: "https://github.com/AliDvlpr/ecostore", featured: true, region: "eu-west", requests: "864K",
    response: '{"orders":18,"latency_ms":36}',
  },
  {
    slug: "code-gap", index: "03", title: "Code Gap", category: "Developer community",
    summary: "A community platform connecting developers through projects and events.",
    description: "A community and event platform connecting developers through education and real software projects.",
    status: "healthy", version: "v1.8.6", role: "Founder and technical lead", timeline: "2024–NOW",
    stack: ["Community", "Events", "Education"], architecture: ["Community platform", "Event workflow", "Content layer", "Notification boundary"],
    metrics: [{ label: "UPTIME", value: "99.97%" }, { label: "REQUESTS", value: "438K" }, { label: "REGION", value: "me-central" }],
    challenges: ["Support community and event operations", "Keep contribution paths approachable"],
    decisions: ["Simple content workflows", "Clear event lifecycle", "Pragmatic platform boundaries"],
    outcomes: ["Repeatable events", "Collaborative project delivery", "A growing developer network"],
    liveUrl: "https://codegap.ir/", featured: true, region: "me-central", requests: "438K",
    response: '{"community":"online","events":12}',
  },
] satisfies unknown[];

export const projects: Project[] = source.map((project) => projectSchema.parse(project));
export function validateProjects(values: unknown[]) {
  const parsed = values.map((project) => projectSchema.parse(project));
  const slugs = new Set<string>();
  for (const project of parsed) {
    if (slugs.has(project.slug)) throw new Error(`Duplicate project slug: ${project.slug}`);
    slugs.add(project.slug);
  }
  return parsed;
}
export const featuredProjects = projects.filter((project) => project.featured);
export function getProject(slug: string) { return projects.find((project) => project.slug === slug); }
