"use client";

import { simulationStore, useSimulationState } from "@/lib/simulation/store";
import type { SimulationScenario } from "@/lib/simulation/types";

const scenariosBySlug: Record<string, { title: string; endpoint: string; scenario: SimulationScenario; params?: Record<string, string>; copy: string }[]> = {
  "django-store": [
    { title: "Featured catalog read", endpoint: "projects", scenario: "cache-hit", params: { featured: "true" }, copy: "Illustrative catalog reads favor Redis before falling back to PostgreSQL." },
    { title: "Fallback database path", endpoint: "project-detail", scenario: "cache-miss", params: { slug: "django-store" }, copy: "This flow shows the database becoming the primary source when the cache misses." },
  ],
  ecostore: [
    { title: "Order summary request", endpoint: "project-detail", scenario: "slow-database", params: { slug: "ecostore" }, copy: "Order and reporting reads make latency budgets visible quickly when query paths widen." },
    { title: "Notification queue", endpoint: "contact-validate", scenario: "worker-offline", copy: "A worker-offline scenario illustrates why background jobs need explicit recovery behavior." },
  ],
  "code-gap": [
    { title: "Published articles feed", endpoint: "articles", scenario: "cache-hit", copy: "Community and content surfaces benefit from predictable caching and read-heavy request paths." },
    { title: "Event registration backlog", endpoint: "contact-validate", scenario: "queue-backlog", copy: "This shows queue growth when the system accepts work faster than workers can drain it." },
  ],
};

export function ProjectSystemDemo({ slug }: { slug: string }) {
  const state = useSimulationState();
  const demos = scenariosBySlug[slug];
  if (!demos?.length) return null;

  return <section className="case-section case-system-demo">
    <p>05 / PROJECT SYSTEM DEMO</p>
    <h2>Focused request flows.</h2>
    <div className="case-demo-grid">
      {demos.map((demo) => (
        <article key={demo.title}>
          <span>{demo.scenario.toUpperCase()}</span>
          <h3>{demo.title}</h3>
          <p>{demo.copy}</p>
          <button onClick={() => {
            simulationStore.setScenario(demo.scenario);
            simulationStore.execute(demo.endpoint, demo.params ?? {});
          }}
          >RUN SIMULATION</button>
        </article>
      ))}
    </div>
    {state.latestExecution && <div className="case-demo-result" role="status" aria-live="polite">
      <strong>{state.latestExecution.endpoint.method} {state.latestExecution.endpoint.path}</strong>
      <p>{state.latestExecution.status} · {state.latestExecution.latencyMs}ms · {state.latestExecution.scenario}</p>
      <code>{state.latestExecution.requestId} / {state.latestExecution.traceId}</code>
    </div>}
  </section>;
}
