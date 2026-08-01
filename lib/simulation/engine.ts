import { apiEndpoints, buildEndpointResponse, getEndpointById } from "./api";
import { scenarioDescriptions } from "./scenarios";
import { createServiceSnapshots } from "./services";
import type {
  ApiExecution,
  ArchitecturePreset,
  LogRecord,
  ServiceSnapshot,
  SimulationScenario,
  SimulationState,
  TraceRecord,
  TraceSpan,
} from "./types";

const MAX_LOGS = 80;
const MAX_TRACES = 24;

function mulberry32(seed: number) {
  return function next() {
    let value = seed += 0x6d2b79f5;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function summarizeScenario(scenario: SimulationScenario) {
  return scenarioDescriptions[scenario];
}

export function createInitialSimulationState(
  preset: ArchitecturePreset = "crm",
  scenario: SimulationScenario = "stable",
  seed = 20260731,
): SimulationState {
  return {
    seed,
    sequence: 0,
    preset,
    scenario,
    paused: false,
    services: createServiceSnapshots(preset),
    metrics: {
      requestsPerSecond: 124,
      errorRate: 0.4,
      p50Latency: 18,
      p95Latency: 42,
      p99Latency: 63,
      cacheHitRate: 92,
      activeDbConnections: 14,
      queueDepth: 3,
      workerUtilization: 42,
      uptimeHours: 318,
      deploymentVersion: "v5.0.0",
    },
    traces: [],
    logs: [],
    labNote: summarizeScenario(scenario),
  };
}

function createLog(
  id: string,
  level: LogRecord["level"],
  service: string,
  event: string,
  message: string,
  extra: Partial<LogRecord> = {},
): LogRecord {
  return {
    id,
    timestamp: new Date().toISOString(),
    level,
    service,
    event,
    message,
    ...extra,
  };
}

function makeRequestId(sequence: number) {
  return `req_${String(sequence).padStart(5, "0")}`;
}

function makeTraceId(sequence: number) {
  return `tr_${String(sequence).padStart(5, "0")}`;
}

function createSpan(id: string, service: string, event: string, startMs: number, durationMs: number, status: TraceSpan["status"], tags?: TraceSpan["tags"], parentId?: string): TraceSpan {
  return { id, service, event, startMs, durationMs, status, tags, parentId };
}

function patchService(services: ServiceSnapshot[], id: string, patch: Partial<ServiceSnapshot>) {
  return services.map((service) => (service.id === id ? { ...service, ...patch } : service));
}

export function stepSimulation(state: SimulationState) {
  const random = mulberry32(state.seed + state.sequence * 17);
  const direction = state.scenario === "queue-backlog" ? 1 : state.scenario === "stable" ? 0 : 0.35;
  const requestsPerSecond = clamp(state.metrics.requestsPerSecond + (random() - 0.5) * 12 + direction, 88, 230);
  const queueDepth = clamp(state.metrics.queueDepth + (state.scenario === "queue-backlog" ? 1.4 : -0.4) + (random() - 0.5) * 1.2, 0, 24);
  const workerUtilization = clamp(state.metrics.workerUtilization + (queueDepth > 8 ? 2.4 : -0.8) + (random() - 0.5) * 4, 18, 96);
  const cacheHitRate = clamp(state.metrics.cacheHitRate + (state.scenario === "cache-hit" ? 1.6 : state.scenario === "cache-miss" ? -2 : (random() - 0.5) * 1.8), 62, 99);
  const p50Latency = clamp(state.metrics.p50Latency + (state.scenario === "slow-database" ? 2.8 : (random() - 0.5) * 1.8), 11, 84);
  const p95Latency = clamp(Math.max(p50Latency + 12, state.metrics.p95Latency + (state.scenario === "slow-database" ? 6 : (random() - 0.5) * 4)), 24, 180);
  const p99Latency = clamp(Math.max(p95Latency + 12, state.metrics.p99Latency + (state.scenario === "service-unavailable" ? 10 : (random() - 0.5) * 4)), 36, 260);
  const errorRate = clamp(state.metrics.errorRate + (state.scenario === "service-unavailable" || state.scenario === "rate-limited" ? 0.28 : -0.03) + (random() - 0.5) * 0.04, 0.02, 18);
  const activeDbConnections = clamp(state.metrics.activeDbConnections + (state.scenario === "slow-database" ? 1.6 : (random() - 0.5) * 1.1), 8, 48);
  const services = state.services.map((service) => {
    if (state.scenario === "redis-unavailable" && service.id === "redis") {
      return { ...service, status: "offline" as const, latencyMs: 0, utilization: 0, healthNote: "Simulated cache outage" };
    }
    if (state.scenario === "worker-offline" && service.id === "worker") {
      return { ...service, status: "offline" as const, latencyMs: 0, utilization: 0, healthNote: "Workers unavailable" };
    }
    if (state.scenario === "slow-database" && service.id === "postgres") {
      return { ...service, status: "degraded" as const, latencyMs: 48, utilization: 0.82, healthNote: "Queries are slower than normal" };
    }
    if (state.scenario === "queue-backlog" && (service.id === "queue" || service.id === "worker")) {
      return { ...service, status: "busy" as const, latencyMs: service.id === "queue" ? 8 : 24, utilization: 0.88, healthNote: "Queue throughput is elevated" };
    }
    return {
      ...service,
      status: "healthy" as const,
      latencyMs: clamp(service.latencyMs + (random() - 0.5) * 2, 2, 30),
      utilization: clamp(service.utilization + (random() - 0.5) * 0.06, 0.12, 0.84),
      healthNote: "Nominal service health",
    };
  }) satisfies ServiceSnapshot[];

  const nextState: SimulationState = {
    ...state,
    sequence: state.sequence + 1,
    services,
    metrics: {
      ...state.metrics,
      requestsPerSecond: Number(requestsPerSecond.toFixed(0)),
      errorRate: Number(errorRate.toFixed(2)),
      p50Latency: Number(p50Latency.toFixed(1)),
      p95Latency: Number(p95Latency.toFixed(1)),
      p99Latency: Number(p99Latency.toFixed(1)),
      cacheHitRate: Number(cacheHitRate.toFixed(1)),
      activeDbConnections: Number(activeDbConnections.toFixed(0)),
      queueDepth: Number(queueDepth.toFixed(0)),
      workerUtilization: Number(workerUtilization.toFixed(0)),
      uptimeHours: Number((state.metrics.uptimeHours + 0.01).toFixed(2)),
    },
    labNote: summarizeScenario(state.scenario),
  };

  if (nextState.sequence % 4 !== 0) return nextState;

  const syntheticId = makeRequestId(nextState.sequence);
  const syntheticTrace = makeTraceId(nextState.sequence);
  const level = state.scenario === "stable" ? "INFO" : state.scenario === "queue-backlog" ? "WARN" : "DEBUG";
  const syntheticLog = createLog(
    syntheticId,
    level,
    "observability",
    "simulation.tick",
    `Scenario ${state.scenario} updated system metrics`,
    { requestId: syntheticId, traceId: syntheticTrace, data: { requestsPerSecond: nextState.metrics.requestsPerSecond, queueDepth: nextState.metrics.queueDepth } },
  );
  return { ...nextState, logs: [...nextState.logs.slice(-(MAX_LOGS - 1)), syntheticLog] };
}

export function executeSimulationRequest(
  state: SimulationState,
  endpointId: string,
  params: Record<string, string> = {},
  body = "",
  scenarioOverride?: SimulationScenario,
) {
  const endpoint = getEndpointById(endpointId);
  const scenario = scenarioOverride ?? state.scenario;
  const requestId = makeRequestId(state.sequence + 1);
  const traceId = makeTraceId(state.sequence + 1);
  const random = mulberry32(state.seed + state.sequence * 97 + endpoint.path.length);

  if (endpoint.id === "project-detail" && !params.slug) {
    return failExecution(state, endpoint, scenario, requestId, traceId, 400, "INVALID_QUERY", "The slug parameter is required.");
  }

  if (scenario === "rate-limited") {
    return failExecution(state, endpoint, scenario, requestId, traceId, 429, "RATE_LIMITED", "The gateway rejected the request before service execution.");
  }

  if (scenario === "auth-failure" && endpoint.auth !== "public") {
    return failExecution(state, endpoint, scenario, requestId, traceId, 401, "AUTH_REQUIRED", "The simulated token could not be validated.");
  }

  if (scenario === "service-unavailable") {
    return failExecution(state, endpoint, scenario, requestId, traceId, 503, "SERVICE_UNAVAILABLE", "The selected service is unavailable in this simulation.");
  }

  const response = buildEndpointResponse(endpoint.id, params, body);
  if (response == null) {
    return failExecution(state, endpoint, scenario, requestId, traceId, 404, "RESOURCE_NOT_FOUND", "The requested resource is not registered.");
  }

  if ("success" in response && !response.success) {
    return failExecution(state, endpoint, scenario, requestId, traceId, 422, String(response.code ?? "VALIDATION_ERROR"), "The submitted payload failed validation.", body, params, response);
  }

  const cacheHit = scenario === "cache-hit" || (scenario !== "cache-miss" && endpoint.method === "GET" && random() > 0.42);
  const dbDuration = scenario === "slow-database" ? 46 : cacheHit ? 0 : Math.round(14 + random() * 10);
  const cacheDuration = scenario === "redis-unavailable" ? 0 : Math.round(2 + random() * 4);
  const workerDuration = state.preset === "async-jobs" || state.preset === "crm" || state.preset === "ecommerce" ? Math.round(5 + random() * 8) : 0;
  const spans: TraceSpan[] = [];
  let cursor = 0;

  spans.push(createSpan("edge", "edge", "edge.accepted", cursor, 2, "ok", { method: endpoint.method }));
  cursor += 2;
  spans.push(createSpan("router", "router", "router.matched", cursor, 2, "ok", { path: endpoint.path }, "edge"));
  cursor += 2;
  spans.push(createSpan("auth", "auth", endpoint.auth === "public" ? "auth.skipped" : "auth.validated", cursor, endpoint.auth === "public" ? 1 : 3, endpoint.auth === "public" ? "skipped" : "ok", { auth: endpoint.auth }, "router"));
  cursor += endpoint.auth === "public" ? 1 : 3;
  spans.push(createSpan("rate", "rate-limiter", "rate_limit.allowed", cursor, 1, "ok", { policy: endpoint.rateLimit }, "auth"));
  cursor += 1;
  spans.push(createSpan("service", endpoint.service, "service.dispatched", cursor, 4, "ok", { endpoint: endpoint.id }, "rate"));
  cursor += 4;

  if (endpoint.method === "GET") {
    spans.push(createSpan("cache", "redis", "cache.lookup", cursor, cacheDuration || 1, scenario === "redis-unavailable" ? "error" : "ok", { cache: scenario === "redis-unavailable" ? "unavailable" : cacheHit ? "hit" : "miss" }, "service"));
    cursor += cacheDuration || 1;
    if (!cacheHit || scenario === "redis-unavailable") {
      spans.push(createSpan("db", "postgres", "postgres.query", cursor, dbDuration || 18, "ok", { queryMs: dbDuration || 18 }, "service"));
      cursor += dbDuration || 18;
      if (scenario !== "redis-unavailable") {
        spans.push(createSpan("cache-write", "redis", "cache.write", cursor, 2, "ok", { repopulated: true }, "db"));
        cursor += 2;
      }
    }
  } else if (workerDuration) {
    spans.push(createSpan("queue", "queue", "job.created", cursor, 2, "ok", { queue: "notifications" }, "service"));
    cursor += 2;
    spans.push(createSpan("worker", "worker", scenario === "worker-offline" ? "worker.idle" : "worker.claimed", cursor, workerDuration, scenario === "worker-offline" ? "error" : "ok", { durationMs: workerDuration }, "queue"));
    cursor += workerDuration;
  }

  spans.push(createSpan("serializer", endpoint.service, "response.serialized", cursor, 2, "ok", undefined, "service"));
  cursor += 2;
  spans.push(createSpan("response", "edge", "response.sent", cursor, 1, "ok", { status: 200 }, "serializer"));
  cursor += 1;

  const responseBody = JSON.stringify(response, null, 2);
  const execution: ApiExecution = {
    endpoint,
    requestId,
    traceId,
    status: 200,
    latencyMs: cursor,
    responseHeaders: {
      "cache-control": endpoint.method === "GET" ? "public, max-age=300" : "no-store",
      "x-request-id": requestId,
      "x-response-time": `${cursor}ms`,
    },
    responseBody,
    requestBody: body || endpoint.bodyExample,
    params,
    cached: cacheHit,
    scenario,
    note: "This request is simulated using real portfolio content and illustrative backend behavior.",
  };

  const trace: TraceRecord = {
    traceId,
    requestId,
    endpointId: endpoint.id,
    method: endpoint.method,
    path: materializePath(endpoint.path, params),
    status: 200,
    totalDurationMs: cursor,
    createdAt: new Date().toISOString(),
    summary: `${endpoint.method} ${materializePath(endpoint.path, params)}`,
    cached: cacheHit,
    scenario,
    spans,
  };

  const logs = [
    createLog(`${requestId}-1`, "INFO", "edge", "request.accepted", `${endpoint.method} ${trace.path}`, { requestId, traceId, data: { status: 200 } }),
    createLog(`${requestId}-2`, cacheHit ? "INFO" : "DEBUG", "redis", cacheHit ? "cache.hit" : "cache.miss", cacheHit ? "Cache served the response payload." : "Primary database query required.", { requestId, traceId }),
    createLog(`${requestId}-3`, "INFO", endpoint.service, "request.completed", "Response sent to client.", { requestId, traceId, data: { durationMs: cursor, cached: cacheHit } }),
  ];

  let services = state.services;
  if (scenario === "slow-database") {
    services = patchService(services, "postgres", { status: "degraded", latencyMs: dbDuration, healthNote: "Slow query simulation active" });
  } else if (scenario === "redis-unavailable") {
    services = patchService(services, "redis", { status: "offline", latencyMs: 0, utilization: 0, healthNote: "Cache unavailable, using DB fallback" });
  } else if (scenario === "worker-offline") {
    services = patchService(services, "worker", { status: "offline", latencyMs: 0, utilization: 0, healthNote: "Jobs accepted but not claimed" });
  }

  const nextState: SimulationState = {
    ...state,
    sequence: state.sequence + 1,
    services,
    latestExecution: execution,
    traces: [trace, ...state.traces].slice(0, MAX_TRACES),
    logs: [...logs, ...state.logs].slice(0, MAX_LOGS),
    metrics: {
      ...state.metrics,
      requestsPerSecond: clamp(state.metrics.requestsPerSecond + 1, 88, 230),
      p50Latency: Number(((state.metrics.p50Latency * 0.82) + (cursor * 0.18)).toFixed(1)),
      p95Latency: Number(Math.max(state.metrics.p95Latency, cursor + 10).toFixed(1)),
      p99Latency: Number(Math.max(state.metrics.p99Latency, cursor + 18).toFixed(1)),
      cacheHitRate: Number(clamp((state.metrics.cacheHitRate * 0.9) + (cacheHit ? 9 : 2), 40, 99).toFixed(1)),
      queueDepth: clamp(state.metrics.queueDepth + (workerDuration && scenario === "worker-offline" ? 2 : workerDuration ? 1 : 0), 0, 24),
      errorRate: Number((state.metrics.errorRate * 0.92).toFixed(2)),
    },
    labNote: summarizeScenario(scenario),
  };

  return { state: nextState, execution, trace };
}

function failExecution(
  state: SimulationState,
  endpoint = apiEndpoints[0],
  scenario: SimulationScenario,
  requestId: string,
  traceId: string,
  status: number,
  errorCode: string,
  message: string,
  body = "",
  params: Record<string, string> = {},
  responseBody?: unknown,
) {
  const spans: TraceSpan[] = [
    createSpan("edge", "edge", "edge.accepted", 0, 2, "ok", { method: endpoint.method }),
    createSpan("router", "router", "router.matched", 2, 2, "ok", { path: endpoint.path }, "edge"),
  ];
  if (status === 401) {
    spans.push(createSpan("auth", "auth", "auth.failed", 4, 3, "error", { code: errorCode }, "router"));
  } else if (status === 429) {
    spans.push(createSpan("auth", "auth", endpoint.auth === "public" ? "auth.skipped" : "auth.validated", 4, endpoint.auth === "public" ? 1 : 3, endpoint.auth === "public" ? "skipped" : "ok", undefined, "router"));
    spans.push(createSpan("rate", "rate-limiter", "rate_limit.blocked", endpoint.auth === "public" ? 5 : 7, 1, "error", { code: errorCode }, "auth"));
  } else {
    spans.push(createSpan("service", endpoint.service, "service.failed", 4, 4, "error", { code: errorCode }, "router"));
  }
  const total = spans.reduce((sum, span) => sum + span.durationMs, 0);
  const trace: TraceRecord = {
    traceId,
    requestId,
    endpointId: endpoint.id,
    method: endpoint.method,
    path: materializePath(endpoint.path, params),
    status,
    totalDurationMs: total,
    createdAt: new Date().toISOString(),
    summary: `${endpoint.method} ${materializePath(endpoint.path, params)}`,
    cached: false,
    scenario,
    spans,
  };
  const execution: ApiExecution = {
    endpoint,
    requestId,
    traceId,
    status,
    latencyMs: total,
    responseHeaders: {
      "cache-control": "no-store",
      "x-request-id": requestId,
      "x-response-time": `${total}ms`,
    },
    responseBody: JSON.stringify(responseBody ?? { success: false, code: errorCode, message }, null, 2),
    requestBody: body || endpoint.bodyExample,
    params,
    cached: false,
    scenario,
    errorCode,
    note: "The failure path is illustrative and intentionally selected.",
  };
  const services = status === 503 ? patchService(state.services, endpoint.service, { status: "offline", healthNote: "Selected failure scenario" }) : state.services;
  const logs = [
    createLog(`${requestId}-1`, "INFO", "edge", "request.accepted", `${endpoint.method} ${trace.path}`, { requestId, traceId }),
    createLog(`${requestId}-2`, status >= 500 ? "ERROR" : "WARN", endpoint.service, "request.failed", message, { requestId, traceId, data: { status, errorCode } }),
  ];
  return {
    state: {
      ...state,
      sequence: state.sequence + 1,
      services,
      latestExecution: execution,
      traces: [trace, ...state.traces].slice(0, MAX_TRACES),
      logs: [...logs, ...state.logs].slice(0, MAX_LOGS),
      metrics: {
        ...state.metrics,
        errorRate: Number(clamp(state.metrics.errorRate + 0.6, 0.02, 18).toFixed(2)),
        p95Latency: Number(Math.max(state.metrics.p95Latency, total + 6).toFixed(1)),
      },
      labNote: summarizeScenario(scenario),
    },
    execution,
    trace,
  };
}

export function materializePath(path: string, params: Record<string, string>) {
  return path.replace(":slug", params.slug || ":slug");
}

export function setSimulationPreset(state: SimulationState, preset: ArchitecturePreset) {
  return { ...createInitialSimulationState(preset, state.scenario, state.seed), paused: state.paused };
}

export function setSimulationScenario(state: SimulationState, scenario: SimulationScenario) {
  return { ...state, scenario, labNote: summarizeScenario(scenario) };
}
