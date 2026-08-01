export type HomepageStageId =
  | "hero"
  | "edge"
  | "api"
  | "cache"
  | "database"
  | "worker"
  | "projects"
  | "experience"
  | "toolbox"
  | "writing"
  | "contact"
  | "response";

export type HomepageStage = {
  id: HomepageStageId;
  label: string;
  event: string;
  service: string;
  status: string;
  latency: string;
  section: string;
  mobileLabel: string;
};

export const homepageStages: readonly HomepageStage[] = [
  { id: "hero", label: "REQUEST RECEIVED", event: "GET /", service: "CLIENT", status: "ACCEPTED", latency: "0ms", section: "top", mobileLabel: "CLIENT" },
  { id: "edge", label: "REQUEST ENTERED", event: "GET /api/v1/projects", service: "CLIENT", status: "TLS 1.3", latency: "0ms", section: "snapshot", mobileLabel: "CLIENT" },
  { id: "api", label: "API VALIDATED", event: "schema.validate", service: "API GATEWAY", status: "PASS", latency: "7ms", section: "snapshot", mobileLabel: "API" },
  { id: "cache", label: "CACHE LOOKUP", event: "redis.get", service: "REDIS", status: "MISS", latency: "3ms", section: "snapshot", mobileLabel: "CACHE" },
  { id: "database", label: "DATA LOADED", event: "projects.select", service: "POSTGRES", status: "3 ROWS", latency: "18ms", section: "snapshot", mobileLabel: "DATABASE" },
  { id: "worker", label: "WORK DISPATCHED", event: "job.enqueue", service: "WORKER", status: "QUEUED", latency: "4ms", section: "systems", mobileLabel: "WORKER" },
  { id: "projects", label: "SERVICES DISCOVERED", event: "registry.query", service: "PROJECTS", status: "HEALTHY", latency: "24ms", section: "projects-stage", mobileLabel: "SERVICES" },
  { id: "experience", label: "VERSIONS LOADED", event: "history.resolve", service: "EXPERIENCE", status: "CURRENT", latency: "29ms", section: "experience-stage", mobileLabel: "HISTORY" },
  { id: "toolbox", label: "DEPENDENCIES READY", event: "dependency.resolve", service: "TOOLBOX", status: "READY", latency: "33ms", section: "toolbox-stage", mobileLabel: "TOOLBOX" },
  { id: "writing", label: "DOCS INDEXED", event: "docs.index", service: "WRITING", status: "3 FOUND", latency: "36ms", section: "writing-stage", mobileLabel: "DOCS" },
  { id: "contact", label: "ENDPOINT READY", event: "POST /contact", service: "CONTACT", status: "LISTENING", latency: "39ms", section: "contact-stage", mobileLabel: "CONTACT" },
  { id: "response", label: "RESPONSE SENT", event: "connection.reuse", service: "RESPONSE", status: "200 OK", latency: "42ms", section: "response-stage", mobileLabel: "RESPONSE" },
] as const;

export function clampProgress(progress: number) {
  return Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0));
}

export function progressToStageIndex(progress: number, count = homepageStages.length) {
  if (count <= 1) return 0;
  return Math.min(count - 1, Math.floor(clampProgress(progress) * count));
}

export function lifecycleStageIndex(progress: number, count: number) {
  return progressToStageIndex(progress, count);
}

export function stageState(index: number, activeIndex: number) {
  if (index < activeIndex) return "completed" as const;
  if (index === activeIndex) return "active" as const;
  return "pending" as const;
}

export function stageAtProgress(progress: number) {
  return homepageStages[progressToStageIndex(progress)];
}
