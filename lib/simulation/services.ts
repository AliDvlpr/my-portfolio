import type { ArchitecturePreset, ServiceDefinition, ServiceSnapshot } from "./types";

export const serviceRegistry: ServiceDefinition[] = [
  {
    id: "edge",
    name: "Edge",
    version: "v2.9.0",
    runtime: "Workers",
    framework: "Cloudflare",
    layer: "edge",
    dependencies: ["router"],
    description: "Accepts requests, assigns IDs, and forwards traffic into the system.",
  },
  {
    id: "router",
    name: "API Router",
    version: "v1.8.4",
    runtime: "Node 22",
    framework: "Next / Vinext",
    layer: "gateway",
    dependencies: ["auth", "rate-limiter", "project-service"],
    description: "Matches routes and directs requests to the correct backend boundary.",
  },
  {
    id: "auth",
    name: "Authentication",
    version: "v1.3.1",
    runtime: "Python 3.13",
    framework: "FastAPI",
    layer: "gateway",
    dependencies: [],
    description: "Validates access tokens for protected or state-changing requests.",
  },
  {
    id: "rate-limiter",
    name: "Rate Limiter",
    version: "v1.1.0",
    runtime: "Workers",
    framework: "KV policy",
    layer: "gateway",
    dependencies: ["redis"],
    description: "Applies burst and duplicate-request limits before services execute.",
  },
  {
    id: "project-service",
    name: "Project Service",
    version: "v1.4.2",
    runtime: "Python 3.13",
    framework: "FastAPI",
    layer: "service",
    dependencies: ["redis", "postgres", "queue"],
    description: "Serves portfolio content and project-oriented case-study payloads.",
  },
  {
    id: "content-service",
    name: "Content Service",
    version: "v2.0.3",
    runtime: "Node 22",
    framework: "MDX pipeline",
    layer: "service",
    dependencies: ["postgres"],
    description: "Loads article, profile, and toolbox content into response contracts.",
  },
  {
    id: "redis",
    name: "Redis",
    version: "v7.4.0",
    runtime: "Redis OSS",
    framework: "Cache",
    layer: "data",
    dependencies: [],
    description: "Caches public reads, rate-limit state, and short-lived queue metadata.",
  },
  {
    id: "postgres",
    name: "PostgreSQL",
    version: "v16.4",
    runtime: "Postgres",
    framework: "Primary DB",
    layer: "data",
    dependencies: [],
    description: "Stores structured project, profile, and contact-review content.",
  },
  {
    id: "queue",
    name: "Message Queue",
    version: "v1.0.8",
    runtime: "Workers Queue",
    framework: "Async",
    layer: "queue",
    dependencies: ["worker"],
    description: "Buffers asynchronous tasks such as notifications and derived updates.",
  },
  {
    id: "worker",
    name: "Background Worker",
    version: "v1.6.7",
    runtime: "Python 3.13",
    framework: "RQ-style worker",
    layer: "worker",
    dependencies: ["queue", "postgres"],
    description: "Processes background jobs and keeps response latency predictable.",
  },
  {
    id: "observability",
    name: "Observability",
    version: "v0.9.5",
    runtime: "OpenTelemetry",
    framework: "Structured logging",
    layer: "observability",
    dependencies: ["project-service", "postgres", "redis", "worker"],
    description: "Collects logs, spans, and system health summaries for the developer lab.",
  },
];

const presetAffinity: Record<ArchitecturePreset, string[]> = {
  "simple-rest": ["edge", "router", "project-service", "postgres", "observability"],
  "cached-api": ["edge", "router", "project-service", "redis", "postgres", "observability"],
  "async-jobs": ["edge", "router", "project-service", "queue", "worker", "observability"],
  ecommerce: ["edge", "router", "auth", "rate-limiter", "project-service", "redis", "postgres", "queue", "worker", "observability"],
  crm: ["edge", "router", "auth", "rate-limiter", "project-service", "redis", "postgres", "queue", "worker", "observability"],
  "content-platform": ["edge", "router", "content-service", "redis", "postgres", "observability"],
};

export function getPresetServices(preset: ArchitecturePreset) {
  const active = new Set(presetAffinity[preset]);
  return serviceRegistry.filter((service) => active.has(service.id));
}

export function createServiceSnapshots(preset: ArchitecturePreset): ServiceSnapshot[] {
  return getPresetServices(preset).map((service) => ({
    ...service,
    status: "healthy",
    latencyMs: service.layer === "data" ? 14 : service.layer === "worker" ? 19 : 7,
    utilization: service.layer === "worker" ? 0.42 : service.layer === "data" ? 0.35 : 0.28,
    healthNote: "Nominal service health",
  }));
}
