export const usesUpdatedAt = "2026-07-31";

export const uses = [
  {
    category: "Languages",
    items: [
      ["Python", "Primary language for APIs, automation, and data-heavy product work.", "CURRENT"],
      ["Go", "Used when a small deployable service benefits from predictable concurrency.", "LEARNING"],
      ["TypeScript", "For typed product interfaces and full-stack integration boundaries.", "CURRENT"],
    ],
  },
  {
    category: "Backend frameworks",
    items: [
      ["FastAPI", "Typed asynchronous APIs with explicit dependency and validation boundaries.", "CURRENT"],
      ["Django + DRF", "Mature product backends where admin workflows and domain breadth matter.", "CURRENT"],
    ],
  },
  {
    category: "Data, caching and queues",
    items: [
      ["PostgreSQL", "Primary relational store for constraints, transactional work, and reporting.", "CURRENT"],
      ["Redis", "Caching, rate limiting, ephemeral state, and bounded queue coordination.", "CURRENT"],
      ["Background workers", "Explicit asynchronous jobs with retries, idempotency, and visibility.", "CURRENT"],
    ],
  },
  {
    category: "Infrastructure and observability",
    items: [
      ["Docker", "Reproducible local environments and simple deployment boundaries.", "CURRENT"],
      ["Cloudflare", "Edge delivery, Workers, D1, security controls, and privacy-aware analytics.", "CURRENT"],
      ["Structured logs", "Request IDs, safe metadata, latency, and actionable failure events.", "CURRENT"],
    ],
  },
  {
    category: "Development workflow",
    items: [
      ["VS Code + terminal", "A keyboard-first workflow with focused automation and reviewable commands.", "CURRENT"],
      ["Pytest + integration tests", "Fast domain tests backed by targeted boundary and contract coverage.", "CURRENT"],
      ["Architecture notes", "Short decision records before complexity becomes institutional memory.", "CURRENT"],
    ],
  },
] as const;
