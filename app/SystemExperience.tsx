"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { trackEvent } from "@/lib/analytics-client";
import { publicRoutes } from "@/lib/routes";
import { projects } from "@/content/projects";
import { simulationStore } from "@/lib/simulation/store";

type Command = { label: string; aliases: string; hint: string; action: () => void };

const logMessages = [
  ["INFO", "Request accepted", "GET /api/v1/projects"],
  ["OK", "Cache hit", "redis://portfolio:featured"],
  ["QUEUE", "Worker finished", "job.render-profile"],
  ["AUTH", "JWT validated", "scope:public.read"],
  ["INFO", "Response delivered", "200 · 31ms"],
  ["OK", "Database healthy", "postgres primary"],
] as const;

function fuzzyMatch(value: string, query: string) {
  let cursor = 0;
  const target = value.toLowerCase();
  for (const character of query.toLowerCase()) {
    cursor = target.indexOf(character, cursor);
    if (cursor === -1) return false;
    cursor += 1;
  }
  return true;
}

export function SystemChrome() {
  const loader = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const commands = useMemo<Command[]>(() => [
    ...publicRoutes.map((route) => ({ label: route.command, aliases: `${route.label} ${route.module}`, hint: route.href, action: () => { window.location.href = route.href; } })),
    ...projects.map((project) => ({ label: `open project ${project.title}`, aliases: `${project.slug} ${project.stack.join(" ")}`, hint: `/projects/${project.slug}`, action: () => { window.location.href = `/projects/${project.slug}`; } })),
    { label: "open API explorer", aliases: "lab api explorer developer portal", hint: "/lab/api", action: () => { window.location.href = "/lab/api"; } },
    { label: "open architecture playground", aliases: "lab architecture presets", hint: "/lab/architecture", action: () => { window.location.href = "/lab/architecture"; } },
    { label: "open observability", aliases: "lab metrics traces logs", hint: "/lab/observability", action: () => { window.location.href = "/lab/observability"; } },
    { label: "open terminal", aliases: "developer console terminal", hint: "/terminal", action: () => { window.location.href = "/terminal"; } },
    { label: "simulate cache miss", aliases: "failure scenario redis miss", hint: "ACTION", action: () => simulationStore.setScenario("cache-miss") },
    { label: "simulate database delay", aliases: "slow database scenario", hint: "ACTION", action: () => simulationStore.setScenario("slow-database") },
    { label: "reset simulation", aliases: "stable reset observability", hint: "RESET", action: () => simulationStore.reset() },
    { label: "open GitHub", aliases: "source repository", hint: "↗", action: () => window.open("https://github.com/AliDvlpr", "_blank", "noopener,noreferrer") },
    { label: "copy email", aliases: "contact address", hint: "COPY", action: () => { void navigator.clipboard.writeText("alimohammadi.8773@gmail.com"); } },
    { label: "toggle motion", aliases: "reduced animation", hint: "MOTION", action: () => document.documentElement.classList.toggle("motion-paused") },
    { label: "toggle logs", aliases: "stream console", hint: "LOGS", action: () => document.documentElement.classList.toggle("logs-hidden") },
  ], []);
  const filtered = useMemo(() => commands.filter((command) => fuzzyMatch(`${command.label} ${command.aliases} ${command.hint}`, query)), [commands, query]);

  function closePalette() {
    setPaletteOpen(false);
    window.setTimeout(() => previousFocus.current?.focus(), 0);
  }

  function openPalette() {
    previousFocus.current = document.activeElement as HTMLElement;
    setPaletteOpen(true);
    trackEvent("command_palette_opened");
  }

  useEffect(() => {
    const element = loader.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      element.remove();
      return;
    }
    const timeline = gsap.timeline({ onComplete: () => element.remove() });
    timeline
      .to(element.querySelectorAll(".boot-line"), { opacity: 1, y: 0, stagger: 0.38, duration: 0.28, ease: "power2.out" })
      .to(".boot-progress i", { scaleX: 1, duration: 1.45, ease: "power2.inOut" }, 0)
      .to(element, { yPercent: -100, duration: 0.8, ease: "power4.inOut", delay: 0.25 });
    return () => {
      timeline.kill();
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((current) => {
          if (!current) {
            previousFocus.current = document.activeElement as HTMLElement;
            trackEvent("command_palette_opened");
          }
          return !current;
        });
      }
      if (event.key === "Escape") closePalette();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function runCommand(index: number) {
    const command = filtered[index];
    if (!command) return;
    command.action();
    trackEvent("command_navigation_used", { source: command.label });
    closePalette();
    setQuery("");
  }

  return (
    <>
      <div className="global-loader" ref={loader} role="status" aria-label="AliDvlpr portfolio loading">
        <div className="boot-mark">ALIDVLPR<span>_SYS</span></div>
        <div className="boot-copy">
          {["Initializing services...", "Loading architecture...", "Connecting database...", "Ready."].map((line) => (
            <p className="boot-line" key={line}><span>›</span>{line}</p>
          ))}
        </div>
        <div className="boot-progress"><i /></div>
      </div>
      <div className="ambient-layer" aria-hidden="true"><i /><i /><i /></div>
      <button ref={trigger} className="palette-trigger" onClick={openPalette} aria-label="Open command palette">
        <span>COMMAND</span><kbd>CTRL K</kbd>
      </button>
      {paletteOpen && (
        <div className="palette-backdrop" role="presentation" onMouseDown={closePalette}>
          <div className="command-palette" role="dialog" aria-modal="true" aria-label="Command palette" onMouseDown={(event) => event.stopPropagation()}>
            <div className="palette-input">
              <span>›_</span>
              <input autoFocus aria-label="Search commands" placeholder="Type a command..." value={query}
                onChange={(event) => { setQuery(event.target.value); setActive(0); }}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") { event.preventDefault(); setActive((value) => Math.min(value + 1, filtered.length - 1)); }
                  if (event.key === "ArrowUp") { event.preventDefault(); setActive((value) => Math.max(value - 1, 0)); }
                  if (event.key === "Enter") runCommand(active);
                }} />
              <kbd>ESC</kbd>
            </div>
            <div className="palette-results" role="listbox">
              {filtered.map((command, index) => (
                <button role="option" aria-selected={index === active} className={index === active ? "is-active" : ""}
                  onMouseEnter={() => setActive(index)} onClick={() => runCommand(index)} key={command.label}>
                  <span><i />{command.label}</span><kbd>{command.hint}</kbd>
                </button>
              ))}
              {!filtered.length && <p className="palette-empty">No command found.</p>}
            </div>
            <div className="palette-help"><span>↑↓ navigate</span><span>↵ select</span><span>esc close</span></div>
          </div>
        </div>
      )}
    </>
  );
}

export function LiveSystems() {
  const root = useRef<HTMLElement>(null);
  const [tick, setTick] = useState(0);
  const [logs, setLogs] = useState(() => logMessages.slice(0, 4));
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "120px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const metricTimer = window.setInterval(() => setTick((value) => value + 1), 1300);
    let index = 4;
    const logTimer = window.setInterval(() => {
      setLogs((current) => [...current.slice(-4), logMessages[index % logMessages.length]]);
      index += 1;
    }, 1800);
    return () => { window.clearInterval(metricTimer); window.clearInterval(logTimer); };
  }, [visible]);

  const metrics = [
    ["REQUESTS / SEC", `${(2842 + Math.sin(tick) * 94).toFixed(0)}`, "LIVE"],
    ["UPTIME", "99.98%", "30D"],
    ["P50 LATENCY", `${(18 + (tick % 3) * .8).toFixed(1)}ms`, "NORMAL"],
    ["P95 LATENCY", `${(34 + (tick % 5) * 1.7).toFixed(1)}ms`, "HEALTHY"],
    ["REDIS", `${96 + (tick % 3)}%`, "HIT RATE"],
    ["POSTGRES", `${12 + (tick % 4)}`, "CONNECTIONS"],
    ["WORKERS", `${8 + (tick % 2)}`, "ACTIVE"],
    ["QUEUE SIZE", `${3 + (tick % 5)}`, "JOBS"],
    ["ERROR RATE", `${(0.06 + (tick % 3) * .01).toFixed(2)}%`, "NOMINAL"],
    ["DEPLOYMENT", "v2.4.1", "STABLE"],
  ];

  return (
    <section ref={root} className="section systems-section" id="systems" aria-labelledby="systems-title">
      <div className="systems-heading reveal">
        <div><p>05 / SYSTEM EXPERIENCE</p><h2 id="systems-title">Live operational<br />intelligence.</h2></div>
        <div className="network-state"><i /> NETWORK ACTIVITY <b>STABLE</b></div>
      </div>
      <div className="metrics-grid" aria-label="Live backend metrics">
        {metrics.map(([label, value, meta], index) => (
          <article className={index === 0 ? "metric metric-primary" : "metric"} key={label}>
            <span>{label}</span><strong>{value}</strong><p><i />{meta}</p>
            <div className="metric-spark" aria-hidden="true">{[2,5,3,7,4,8,6,9,5,7,8,6].map((height, i) => <b key={i} style={{ height: `${height * 8}%` }} />)}</div>
          </article>
        ))}
      </div>
      <div className="stream-console">
        <div className="stream-head"><span>STREAM / backend.production</span><span><i /> FOLLOWING</span></div>
        <div className="stream-body" aria-live="polite" aria-label="Streaming backend logs">
          {logs.map(([level, message, detail], index) => (
            <div className="stream-row" key={`${level}-${message}-${index}`}>
              <time>{`12:04:${String((tick + index + 12) % 60).padStart(2, "0")}`}</time>
              <b data-level={level}>[{level}]</b><span>{message}</span><code>{detail}</code>
            </div>
          ))}
          <div className="stream-prompt"><span>›</span><i /></div>
        </div>
      </div>
    </section>
  );
}
