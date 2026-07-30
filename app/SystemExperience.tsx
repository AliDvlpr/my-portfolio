"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

function downloadResume() {
  const resume = `ALI MOHAMMADI — BACKEND ENGINEER
Baku · alimohammadi.8773@gmail.com · github.com/AliDvlpr

PROFILE
Backend engineer with 5+ years of experience building scalable Python systems with FastAPI, Django, PostgreSQL, Redis, Docker, and Go.

EXPERIENCE
2025—NOW  Senior Backend Engineer, QCode
2024—NOW  Founder, Code Gap
2023—NOW  Freelance Web Developer
2019—2025 Backend Developer → Team Lead, Alborz Institute

SELECTED WORK
Django Store · Ecostore · Code Gap
`;
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([resume], { type: "text/plain;charset=utf-8" }));
  link.download = "Ali-Mohammadi-Resume.txt";
  link.click();
  URL.revokeObjectURL(link.href);
}

const commands = [
  { label: "Go to selected work", hint: "#work", action: () => document.querySelector("#work")?.scrollIntoView() },
  { label: "Go to about", hint: "#about", action: () => document.querySelector("#about")?.scrollIntoView() },
  { label: "Go to experience", hint: "#experience", action: () => document.querySelector("#experience")?.scrollIntoView() },
  { label: "Open contact terminal", hint: "#contact", action: () => document.querySelector("#contact")?.scrollIntoView() },
  { label: "Open GitHub", hint: "↗", action: () => window.open("https://github.com/AliDvlpr", "_blank", "noopener,noreferrer") },
  { label: "Download résumé", hint: "TXT", action: downloadResume },
  { label: "Toggle theme", hint: "SOON", action: () => document.documentElement.classList.toggle("theme-preview") },
];

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
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const filtered = useMemo(() => commands.filter((command) => fuzzyMatch(`${command.label} ${command.hint}`, query)), [query]);

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
    return () => timeline.kill();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((current) => !current);
      }
      if (event.key === "Escape") setPaletteOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function runCommand(index: number) {
    const command = filtered[index];
    if (!command) return;
    command.action();
    setPaletteOpen(false);
    setQuery("");
  }

  return (
    <>
      <div className="global-loader" ref={loader} role="status" aria-label="Portfolio loading">
        <div className="boot-mark">AM<span>_SYS</span></div>
        <div className="boot-copy">
          {["Initializing services...", "Loading architecture...", "Connecting database...", "Ready."].map((line) => (
            <p className="boot-line" key={line}><span>›</span>{line}</p>
          ))}
        </div>
        <div className="boot-progress"><i /></div>
      </div>
      <div className="ambient-layer" aria-hidden="true"><i /><i /><i /></div>
      <button className="palette-trigger" onClick={() => setPaletteOpen(true)} aria-label="Open command palette">
        <span>COMMAND</span><kbd>CTRL K</kbd>
      </button>
      {paletteOpen && (
        <div className="palette-backdrop" role="presentation" onMouseDown={() => setPaletteOpen(false)}>
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
  const [tick, setTick] = useState(0);
  const [logs, setLogs] = useState(() => logMessages.slice(0, 4));

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const metricTimer = window.setInterval(() => setTick((value) => value + 1), 1300);
    let index = 4;
    const logTimer = window.setInterval(() => {
      setLogs((current) => [...current.slice(-4), logMessages[index % logMessages.length]]);
      index += 1;
    }, 1800);
    return () => { window.clearInterval(metricTimer); window.clearInterval(logTimer); };
  }, []);

  const metrics = [
    ["REQUESTS / SEC", `${(2842 + Math.sin(tick) * 94).toFixed(0)}`, "LIVE"],
    ["UPTIME", "99.98%", "30D"],
    ["P95 LATENCY", `${(34 + (tick % 5) * 1.7).toFixed(1)}ms`, "HEALTHY"],
    ["REDIS", `${96 + (tick % 3)}%`, "HIT RATE"],
    ["POSTGRES", `${12 + (tick % 4)}`, "CONNECTIONS"],
    ["WORKERS", `${8 + (tick % 2)}`, "ACTIVE"],
    ["QUEUE SIZE", `${3 + (tick % 5)}`, "JOBS"],
  ];

  return (
    <section className="section systems-section" id="systems" aria-labelledby="systems-title">
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
