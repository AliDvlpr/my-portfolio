"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { apiEndpoints, getEndpointById } from "@/lib/simulation/api";
import { materializePath } from "@/lib/simulation/engine";
import { scenarioLabels, selectableScenarios } from "@/lib/simulation/scenarios";
import { getPresetServices, serviceRegistry } from "@/lib/simulation/services";
import { simulationStore, useSimulationState } from "@/lib/simulation/store";
import type { ArchitecturePreset, SimulationScenario, TraceRecord } from "@/lib/simulation/types";

const presets: { id: ArchitecturePreset; title: string; description: string }[] = [
  { id: "simple-rest", title: "Simple REST API", description: "A direct request path with minimal infrastructure." },
  { id: "cached-api", title: "Cached API", description: "Public reads with Redis in front of PostgreSQL." },
  { id: "async-jobs", title: "Async job system", description: "Foreground requests plus background work." },
  { id: "ecommerce", title: "E-commerce backend", description: "Transactional requests, cache layers, and queued follow-ups." },
  { id: "crm", title: "CRM backend", description: "Authenticated workflows, reporting, and assignment jobs." },
  { id: "content-platform", title: "Content platform", description: "MDX-driven content served through a structured API surface." },
];

const moduleCards = [
  { title: "API Explorer", href: "/lab/api", status: "ONLINE", shortcut: "Ctrl+K", description: "Safe simulated endpoints backed by real portfolio content." },
  { title: "Architecture Playground", href: "/lab/architecture", status: "ONLINE", shortcut: "Shift+A", description: "Curated backend presets with selected failure scenarios." },
  { title: "Observability", href: "/lab/observability", status: "ONLINE", shortcut: "Shift+O", description: "Metrics, traces, structured logs, and service health." },
];

export function LabIndex() {
  return <section className="lab-index-grid" aria-label="Developer lab modules">
    {moduleCards.map((module) => (
      <Link className="lab-module-card" href={module.href} key={module.href}>
        <div><span>MODULE</span><b>{module.status}</b></div>
        <h2>{module.title}</h2>
        <p>{module.description}</p>
        <strong>{module.href}</strong>
        <em>{module.shortcut}</em>
      </Link>
    ))}
  </section>;
}

export function LabApiExplorer() {
  const state = useSimulationState();
  const [endpointId, setEndpointId] = useState(apiEndpoints[0].id);
  const [scenario, setScenario] = useState<SimulationScenario>(state.scenario);
  const endpoint = getEndpointById(endpointId);
  const [params, setParams] = useState<Record<string, string>>(() => Object.fromEntries((endpoint.params ?? []).map((param) => [param.key, param.placeholder ?? ""])));
  const [body, setBody] = useState(endpoint.bodyExample ?? "");
  const execution = state.latestExecution?.endpoint.id === endpointId ? state.latestExecution : undefined;
  const currentTrace = state.traces.find((trace) => trace.requestId === execution?.requestId);

  const summary = useMemo(() => currentTrace?.spans.map((span) => `${String(span.startMs).padStart(4, "0")}.${span.durationMs}ms ${span.event}`).join("\n") ?? "Run a request to inspect the full path.", [currentTrace]);

  function selectEndpoint(nextId: string) {
    const next = getEndpointById(nextId);
    setEndpointId(nextId);
    setParams(Object.fromEntries((next.params ?? []).map((param) => [param.key, param.placeholder ?? ""])));
    setBody(next.bodyExample ?? "");
  }

  function execute() {
    simulationStore.setScenario(scenario);
    simulationStore.execute(endpointId, params, body, scenario);
  }

  return <div className="lab-grid api-lab-grid">
    <section className="lab-panel">
      <div className="lab-panel-head"><span>ENDPOINT REGISTRY</span><b>SIMULATED</b></div>
      <div className="endpoint-list" aria-label="Simulated API endpoints">
        {apiEndpoints.map((item) => (
          <button type="button" key={item.id} aria-pressed={endpointId === item.id} className={endpointId === item.id ? "is-active" : ""} onClick={() => selectEndpoint(item.id)}>
            <strong>{item.method}</strong>
            <div><span>{item.path}</span><small>{item.summary}</small></div>
          </button>
        ))}
      </div>
    </section>

    <section className="lab-panel">
      <div className="lab-panel-head"><span>REQUEST</span><b>{scenarioLabels[scenario]}</b></div>
      <div className="api-request-shell">
        <div className="api-request-line"><strong>{endpoint.method}</strong><span>{materializePath(endpoint.path, params)}</span></div>
        <label>
          <span>Scenario</span>
          <select value={scenario} onChange={(event) => setScenario(event.target.value as SimulationScenario)}>
            {selectableScenarios.map((value) => <option key={value} value={value}>{scenarioLabels[value]}</option>)}
          </select>
        </label>
        {(endpoint.params ?? []).map((param) => (
          <label key={param.key}>
            <span>{param.label}</span>
            <input value={params[param.key] ?? ""} placeholder={param.placeholder} onChange={(event) => setParams((current) => ({ ...current, [param.key]: event.target.value }))} />
          </label>
        ))}
        {endpoint.method === "POST" && (
          <label>
            <span>Request body</span>
            <textarea rows={8} value={body} onChange={(event) => setBody(event.target.value)} />
          </label>
        )}
        <div className="api-doc-grid">
          <div><span>AUTH</span><b>{endpoint.auth.toUpperCase()}</b></div>
          <div><span>RATE LIMIT</span><b>{endpoint.rateLimit}</b></div>
          <div><span>SUMMARY</span><b>{endpoint.summary}</b></div>
        </div>
        <button type="button" className="lab-action" onClick={execute}>EXECUTE REQUEST</button>
      </div>
    </section>

    <section className="lab-panel">
      <div className="lab-panel-head"><span>RESPONSE</span><b>{execution ? `${execution.status} · ${execution.latencyMs}ms` : "READY"}</b></div>
      <div className="api-response-shell">
        <div className="api-meta-row">
          <span>{execution ? execution.note : "Responses are simulated and safely sandboxed."}</span>
          {execution && <button type="button" onClick={() => void navigator.clipboard.writeText(execution.responseBody)}>COPY JSON</button>}
        </div>
        {execution ? <>
          <div className="api-response-head">
            <strong>{execution.status}</strong>
            <div>{Object.entries(execution.responseHeaders).map(([key, value]) => <p key={key}><span>{key}</span><b>{value}</b></p>)}</div>
          </div>
          <pre>{execution.responseBody}</pre>
        </> : <p className="lab-empty-copy">Select an endpoint, adjust a safe parameter if needed, and run the request.</p>}
      </div>
    </section>

    <section className="lab-panel trace-panel">
      <div className="lab-panel-head"><span>TRACE</span><b>{currentTrace ? currentTrace.traceId : "NO TRACE"}</b></div>
      <TraceVisualizer trace={currentTrace} />
      <pre className="trace-summary">{summary}</pre>
    </section>
  </div>;
}

function TraceVisualizer({ trace }: { trace?: TraceRecord }) {
  if (!trace) return <p className="lab-empty-copy">Trace spans will appear here after a request executes.</p>;
  return <ol className="trace-flow" aria-label="Request trace">
    {trace.spans.map((span) => <li key={span.id} data-status={span.status}>
      <span>{span.service}</span>
      <strong>{span.event}</strong>
      <b>{span.durationMs}ms</b>
    </li>)}
  </ol>;
}

export function ArchitecturePlayground() {
  const state = useSimulationState();
  const [selectedPreset, setSelectedPreset] = useState<ArchitecturePreset>(state.preset);
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario>(state.scenario);
  const activeServices = getPresetServices(selectedPreset);

  function apply() {
    simulationStore.setPreset(selectedPreset);
    simulationStore.setScenario(selectedScenario);
    simulationStore.execute("projects", { featured: "true" }, "", selectedScenario);
  }

  return <div className="lab-grid architecture-grid">
    <section className="lab-panel">
      <div className="lab-panel-head"><span>PRESETS</span><b>{selectedPreset.toUpperCase()}</b></div>
      <div className="preset-grid" aria-label="Architecture presets">
        {presets.map((preset) => (
          <button type="button" key={preset.id} className={selectedPreset === preset.id ? "is-active" : ""} aria-pressed={selectedPreset === preset.id} onClick={() => setSelectedPreset(preset.id)}>
            <strong>{preset.title}</strong>
            <p>{preset.description}</p>
          </button>
        ))}
      </div>
    </section>
    <section className="lab-panel">
      <div className="lab-panel-head"><span>SIMULATION</span><b>{scenarioLabels[selectedScenario]}</b></div>
      <div className="api-request-shell">
        <label>
          <span>Failure scenario</span>
          <select value={selectedScenario} onChange={(event) => setSelectedScenario(event.target.value as SimulationScenario)}>
            {selectableScenarios.map((value) => <option key={value} value={value}>{scenarioLabels[value]}</option>)}
          </select>
        </label>
        <p className="lab-note">This playground uses curated presets rather than free-form infrastructure so each interaction remains readable and technically grounded.</p>
        <button type="button" className="lab-action" onClick={apply}>TRIGGER REQUEST PATH</button>
      </div>
      <div className="architecture-diagram" aria-label="Architecture service path">
        {activeServices.map((service) => (
          <article key={service.id} className={state.services.find((item) => item.id === service.id)?.status === "healthy" ? "" : "is-alert"}>
            <span>{service.layer.toUpperCase()}</span>
            <strong>{service.name}</strong>
            <p>{service.description}</p>
          </article>
        ))}
      </div>
    </section>
  </div>;
}

export function ObservabilityDashboard() {
  const state = useSimulationState();
  const [level, setLevel] = useState("ALL");
  const [serviceFilter, setServiceFilter] = useState("ALL");
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);
  const selectedTrace = state.traces.find((trace) => trace.traceId === (selectedTraceId ?? state.traces[0]?.traceId));
  const logs = state.logs.filter((log) => (level === "ALL" || log.level === level) && (serviceFilter === "ALL" || log.service === serviceFilter));

  return <div className="lab-observability">
    <section className="lab-metric-grid" aria-label="Simulated observability metrics">
      {[
        ["REQUESTS / SEC", state.metrics.requestsPerSecond],
        ["ERROR RATE", `${state.metrics.errorRate}%`],
        ["P50 LATENCY", `${state.metrics.p50Latency}ms`],
        ["P95 LATENCY", `${state.metrics.p95Latency}ms`],
        ["P99 LATENCY", `${state.metrics.p99Latency}ms`],
        ["CACHE HIT RATE", `${state.metrics.cacheHitRate}%`],
        ["DB CONNECTIONS", state.metrics.activeDbConnections],
        ["QUEUE DEPTH", state.metrics.queueDepth],
        ["WORKER UTILIZATION", `${state.metrics.workerUtilization}%`],
        ["UPTIME", `${state.metrics.uptimeHours.toFixed(1)}h`],
      ].map(([label, value]) => <article key={label}><span>{label}</span><strong>{value}</strong><small>SIMULATED</small></article>)}
    </section>

    <div className="lab-grid observability-grid">
      <section className="lab-panel">
        <div className="lab-panel-head"><span>SERVICE HEALTH</span><b>{state.labNote}</b></div>
        <div className="service-health-grid">
          {state.services.map((service) => (
            <article key={service.id} data-status={service.status}>
              <div><span>{service.name}</span><b>{service.status.toUpperCase()}</b></div>
              <p>{service.healthNote}</p>
              <small>{Math.round(service.latencyMs)}ms · {Math.round(service.utilization * 100)}% util</small>
            </article>
          ))}
        </div>
      </section>

      <section className="lab-panel">
        <div className="lab-panel-head"><span>RECENT TRACES</span><b>{state.traces.length}</b></div>
        <div className="trace-list" aria-label="Recent traces">
          {state.traces.map((trace) => (
            <button type="button" key={trace.traceId} className={selectedTrace?.traceId === trace.traceId ? "is-active" : ""} aria-pressed={selectedTrace?.traceId === trace.traceId} onClick={() => setSelectedTraceId(trace.traceId)}>
              <span>{trace.traceId}</span>
              <strong>{trace.summary}</strong>
              <b>{trace.totalDurationMs}ms</b>
            </button>
          ))}
          {!state.traces.length && <p className="lab-empty-copy">Run a simulated request to populate traces.</p>}
        </div>
        {selectedTrace && <div className="trace-detail">
          <div className="api-meta-row"><span>{selectedTrace.path}</span><button type="button" onClick={() => void navigator.clipboard.writeText(selectedTrace.traceId)}>COPY TRACE ID</button></div>
          <pre>{selectedTrace.spans.map((span) => `${span.service.padEnd(16, " ")} ${String(span.durationMs).padStart(3, " ")}ms ${span.event}`).join("\n")}</pre>
        </div>}
      </section>

      <section className="lab-panel">
        <div className="lab-panel-head"><span>LOG EXPLORER</span><b>{logs.length}</b></div>
        <div className="lab-filter-row">
          <select value={level} onChange={(event) => setLevel(event.target.value)} aria-label="Filter logs by level">
            {["ALL", "DEBUG", "INFO", "WARN", "ERROR"].map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <select value={serviceFilter} onChange={(event) => setServiceFilter(event.target.value)} aria-label="Filter logs by service">
            {["ALL", ...serviceRegistry.map((service) => service.id)].map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <button type="button" onClick={() => simulationStore.togglePaused()}>{state.paused ? "RESUME" : "PAUSE"}</button>
          <button type="button" onClick={() => simulationStore.clearLogs()}>CLEAR</button>
          <button type="button" onClick={() => simulationStore.reset()}>RESET</button>
        </div>
        <div className="log-stream" aria-label="Structured log explorer">
          {logs.map((log) => (
            <article key={log.id}>
              <div><span>[{log.level}]</span><b>{log.service}</b><small>{log.event}</small></div>
              <p>{log.message}</p>
              <code>{JSON.stringify(log, null, 2)}</code>
            </article>
          ))}
          {!logs.length && <p className="lab-empty-copy">No logs in memory. Execute a request or resume the simulation.</p>}
        </div>
      </section>
    </div>
  </div>;
}
