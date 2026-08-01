import type { SimulationScenario } from "./types";

export const scenarioLabels: Record<SimulationScenario, string> = {
  stable: "Stable path",
  "cache-hit": "Cache hit",
  "cache-miss": "Cache miss",
  "slow-database": "Slow database",
  "redis-unavailable": "Redis unavailable",
  "worker-offline": "Worker offline",
  "queue-backlog": "Queue backlog",
  "rate-limited": "Rate limited",
  "auth-failure": "Authentication failure",
  "service-unavailable": "Service unavailable",
};

export const scenarioDescriptions: Record<SimulationScenario, string> = {
  stable: "Healthy request path with balanced latency and normal cache behavior.",
  "cache-hit": "Requests are served from Redis before the primary database is consulted.",
  "cache-miss": "Reads fall through to PostgreSQL and may repopulate the cache afterward.",
  "slow-database": "PostgreSQL queries become the dominant latency contributor.",
  "redis-unavailable": "Cache lookups fail and the system falls back to direct database reads.",
  "worker-offline": "Jobs enqueue successfully but no workers are currently available to claim them.",
  "queue-backlog": "Background jobs accumulate and worker utilization stays elevated.",
  "rate-limited": "The gateway rejects requests before the service executes.",
  "auth-failure": "Protected flows stop at the authentication boundary.",
  "service-unavailable": "The selected application service fails and the request returns a 503.",
};

export const selectableScenarios: SimulationScenario[] = [
  "stable",
  "cache-hit",
  "cache-miss",
  "slow-database",
  "redis-unavailable",
  "worker-offline",
  "queue-backlog",
  "rate-limited",
  "auth-failure",
  "service-unavailable",
];
