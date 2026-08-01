export type SimulationScenario =
  | "stable"
  | "cache-hit"
  | "cache-miss"
  | "slow-database"
  | "redis-unavailable"
  | "worker-offline"
  | "queue-backlog"
  | "rate-limited"
  | "auth-failure"
  | "service-unavailable";

export type ArchitecturePreset =
  | "simple-rest"
  | "cached-api"
  | "async-jobs"
  | "ecommerce"
  | "crm"
  | "content-platform";

export type ServiceStatus = "healthy" | "degraded" | "offline" | "busy";
export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";
export type HttpMethod = "GET" | "POST";

export type ServiceDefinition = {
  id: string;
  name: string;
  version: string;
  runtime: string;
  framework: string;
  layer: "edge" | "gateway" | "service" | "data" | "queue" | "worker" | "observability";
  dependencies: string[];
  description: string;
};

export type ServiceSnapshot = ServiceDefinition & {
  status: ServiceStatus;
  latencyMs: number;
  utilization: number;
  healthNote: string;
};

export type ApiEndpoint = {
  id: string;
  method: HttpMethod;
  path: string;
  summary: string;
  auth: "public" | "optional" | "required";
  service: string;
  params?: { key: string; label: string; required?: boolean; placeholder?: string }[];
  bodyExample?: string;
  rateLimit: string;
};

export type TraceSpan = {
  id: string;
  parentId?: string;
  service: string;
  event: string;
  startMs: number;
  durationMs: number;
  status: "ok" | "error" | "skipped";
  tags?: Record<string, string | number | boolean>;
};

export type TraceRecord = {
  traceId: string;
  requestId: string;
  endpointId: string;
  method: HttpMethod;
  path: string;
  status: number;
  totalDurationMs: number;
  createdAt: string;
  summary: string;
  cached: boolean;
  scenario: SimulationScenario;
  spans: TraceSpan[];
};

export type LogRecord = {
  id: string;
  timestamp: string;
  level: LogLevel;
  service: string;
  event: string;
  requestId?: string;
  traceId?: string;
  message: string;
  data?: Record<string, string | number | boolean>;
};

export type SimulationMetrics = {
  requestsPerSecond: number;
  errorRate: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
  cacheHitRate: number;
  activeDbConnections: number;
  queueDepth: number;
  workerUtilization: number;
  uptimeHours: number;
  deploymentVersion: string;
};

export type ApiExecution = {
  endpoint: ApiEndpoint;
  requestId: string;
  traceId: string;
  status: number;
  latencyMs: number;
  responseHeaders: Record<string, string>;
  responseBody: string;
  requestBody?: string;
  params: Record<string, string>;
  cached: boolean;
  scenario: SimulationScenario;
  errorCode?: string;
  note: string;
};

export type SimulationState = {
  seed: number;
  sequence: number;
  preset: ArchitecturePreset;
  scenario: SimulationScenario;
  paused: boolean;
  services: ServiceSnapshot[];
  metrics: SimulationMetrics;
  traces: TraceRecord[];
  logs: LogRecord[];
  latestExecution?: ApiExecution;
  labNote: string;
};
