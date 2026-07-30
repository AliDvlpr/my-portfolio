"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

const lifecycle = [
  { name: "Client", meta: "GET /api/v1/projects", value: "TLS 1.3" },
  { name: "Edge / Load Balancer", meta: "Route selected: eu-central", value: "2ms" },
  { name: "API Gateway", meta: "Rate limit accepted", value: "4ms" },
  { name: "FastAPI Service", meta: "Request schema validated", value: "7ms" },
  { name: "Authentication", meta: "JWT validated", value: "PASS" },
  { name: "Redis Cache", meta: "Redis cache miss", value: "3ms" },
  { name: "PostgreSQL", meta: "PostgreSQL query", value: "18ms" },
  { name: "Background Worker", meta: "Worker dispatched", value: "QUEUED" },
  { name: "Response", meta: "200 OK · Total latency", value: "42ms" },
];

function useVisible<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "160px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

export function RequestLifecycle() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.innerWidth <= 760) return;
    gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
    const context = gsap.context(() => {
      const nodes = gsap.utils.toArray<HTMLElement>("[data-request-node]");
      gsap.set(".request-route-progress", { strokeDasharray: 1, strokeDashoffset: 1 });
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: element,
          start: "top top",
          end: "+=2600",
          pin: ".request-stage",
          scrub: 0.45,
          invalidateOnRefresh: true,
          onUpdate: (self) => setActive(Math.min(lifecycle.length - 1, Math.floor(self.progress * lifecycle.length))),
        },
      });
      timeline
        .to(".request-route-progress", { strokeDashoffset: 0, duration: 9, ease: "none" }, 0)
        .to(".request-packet", { motionPath: { path: ".request-route", align: ".request-route", alignOrigin: [0.5, 0.5] }, duration: 9, ease: "none" }, 0);
      nodes.forEach((node, index) => {
        timeline.to(node, { "--node-energy": 1, color: "#d6ff35", duration: 0.35 }, index)
          .to(node, { "--node-energy": 0.16, color: "#7f8378", duration: 0.35 }, index + 0.65);
      });
    }, element);
    return () => context.revert();
  }, []);

  return (
    <section ref={root} className="request-lifecycle" id="request-lifecycle" aria-labelledby="request-title">
      <div className="request-stage">
        <div className="request-heading">
          <div><p>01 / REQUEST LIFECYCLE</p><h2 id="request-title">One request.<br />Every boundary visible.</h2></div>
          <div className="request-counter"><span>TRACE</span><b>req_7f2a9c</b><em>{String(active + 1).padStart(2, "0")} / 09</em></div>
        </div>
        <div className="request-map">
          <svg viewBox="0 0 1280 410" aria-hidden="true">
            <path className="request-route" d="M45 210 C120 210 110 80 205 80 S280 335 370 335 S440 80 530 80 S600 335 690 335 S760 80 850 80 S920 335 1010 335 S1095 210 1230 210" pathLength="1" />
            <path className="request-route-progress" d="M45 210 C120 210 110 80 205 80 S280 335 370 335 S440 80 530 80 S600 335 690 335 S760 80 850 80 S920 335 1010 335 S1095 210 1230 210" pathLength="1" />
            <circle className="request-packet" cx="45" cy="210" r="7" />
          </svg>
          <div className="request-nodes">
            {lifecycle.map((step, index) => (
              <article data-request-node className={index === active ? "is-current" : index < active ? "is-complete" : ""} key={step.name}>
                <span>{String(index + 1).padStart(2, "0")}</span><i />
                <div><h3>{step.name}</h3><p>{step.meta}</p><b>{step.value}</b></div>
              </article>
            ))}
          </div>
        </div>
        <div className="request-status" aria-live="polite">
          <span>ACTIVE SERVICE</span><strong>{lifecycle[active].name}</strong>
          <span>EVENT</span><strong>{lifecycle[active].meta}</strong>
          <span>STATUS</span><strong>{lifecycle[active].value}</strong>
        </div>
      </div>
    </section>
  );
}

const jobStates = ["job.created", "job.queued", "worker.claimed", "job.processing", "job.completed"];

export function InfrastructureFlow() {
  const { ref, visible } = useVisible<HTMLElement>();
  const [step, setStep] = useState(0);
  const [cacheHit, setCacheHit] = useState(false);
  useEffect(() => {
    if (!visible || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setStep((value) => {
      const next = (value + 1) % jobStates.length;
      if (next === 0) setCacheHit((current) => !current);
      return next;
    }), 1450);
    return () => window.clearInterval(timer);
  }, [visible]);

  return (
    <section ref={ref} className="infrastructure-flow" aria-labelledby="infra-title">
      <div className="infra-heading">
        <div><p>07 / ASYNC INFRASTRUCTURE</p><h2 id="infra-title">Work moves.<br />State stays coherent.</h2></div>
        <p>Queue processing and data access share one bounded simulation. Activity pauses when this system is offscreen.</p>
      </div>
      <div className="infra-grid">
        <div className="queue-visualizer" aria-label={`Queue state: ${jobStates[step]}`}>
          <div className="sim-bar"><span>QUEUE / jobs.default</span><b>{jobStates[step]}</b></div>
          <div className="queue-track">
            {[0,1,2,3].map((job) => <i className={job <= step ? "has-moved" : ""} style={{ "--job": job } as React.CSSProperties} key={job}>J{job + 1}</i>)}
          </div>
          <div className="worker-pool">
            {[0,1,2].map((worker) => <article className={step >= 2 && worker === step % 3 ? "is-busy" : ""} key={worker}><span>W{worker + 1}</span><i /><b>{step >= 2 && worker === step % 3 ? "BUSY" : "IDLE"}</b></article>)}
          </div>
          <ol>{jobStates.map((state, index) => <li className={index === step ? "is-active" : index < step ? "is-done" : ""} key={state}><i />{state}<b>{index < step ? "DONE" : index === step ? "ACTIVE" : "WAIT"}</b></li>)}</ol>
        </div>
        <div className="data-visualizer" aria-label={`Cache database flow: ${cacheHit ? "cache hit" : "cache miss"}`}>
          <div className="sim-bar"><span>DATA PATH / read.projects</span><b>{cacheHit ? "CACHE HIT" : "CACHE MISS"}</b></div>
          <div className="data-flow">
            {["REQUEST", "REDIS", cacheHit ? "HIT" : "MISS", cacheHit ? "RESPONSE" : "POSTGRES", cacheHit ? "200 OK" : "CACHE WRITE", "RESPONSE"].map((label, index) => (
              <div className={index <= (step % 4) + 1 ? "is-active" : ""} key={`${label}-${index}`}><i /><span>{label}</span><small>{label === "REDIS" ? "2.8ms" : label === "POSTGRES" ? "18ms" : label === "RESPONSE" ? "42ms" : "—"}</small></div>
            ))}
          </div>
          <div className="data-query"><span>SQL</span><code>SELECT id, title FROM projects<br />WHERE status = &apos;published&apos;;</code><b>3 rows · 18ms</b></div>
        </div>
      </div>
    </section>
  );
}
