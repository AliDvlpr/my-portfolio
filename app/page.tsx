"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TerminalContact from "./TerminalContact";
import { LiveSystems, SystemChrome } from "./SystemExperience";
import { InfrastructureFlow, RequestLifecycle } from "./BackendMotionSystem";

const stack = ["Python", "FastAPI", "Django", "PostgreSQL", "Redis", "Docker", "Go"];

const experience = [
  {
    period: "2025—NOW",
    role: "Senior Backend Engineer",
    company: "QCode",
    detail:
      "Leading backend architecture across EdTech, women’s health, and commerce products. Designing APIs, optimizing data paths, and integrating third-party services.",
    tech: "FASTAPI / POSTGRESQL / REDIS",
  },
  {
    period: "2024—NOW",
    role: "Founder",
    company: "Code Gap",
    detail:
      "Building a developer community around practical web engineering, collaborative software projects, and educational events.",
    tech: "COMMUNITY / EDUCATION / EVENTS",
  },
  {
    period: "2023—NOW",
    role: "Freelance Web Developer",
    company: "Independent",
    detail:
      "Delivering reliable backend systems for product teams, including investment and commerce platforms.",
    tech: "DJANGO / DRF / SYSTEM DESIGN",
  },
  {
    period: "2019—2025",
    role: "Backend Developer → Team Lead",
    company: "Alborz Institute",
    detail:
      "Progressed from intern to mid-senior engineer, leading CRM projects, mentoring developers, and teaching full-stack web development.",
    tech: "PYTHON / JAVASCRIPT / GO / DOCKER",
  },
];

const projects = [
  {
    index: "01",
    title: "Django Store",
    category: "Commerce backend",
    description:
      "A clean, extensible store API built around Django REST Framework and PostgreSQL.",
    tags: ["Django", "DRF", "PostgreSQL"],
    href: "https://github.com/AliDvlpr/Django_Store",
    service: "django-store",
    version: "v1.4.2",
    region: "eu-central",
    requests: "1.2M",
    response: '{"status":"healthy","items":24}',
  },
  {
    index: "02",
    title: "Ecostore",
    category: "E-commerce platform",
    description:
      "A comprehensive Django commerce platform designed for maintainable product and order workflows.",
    tags: ["Python", "Django", "PostgreSQL"],
    href: "https://github.com/AliDvlpr/ecostore",
    service: "ecostore-api",
    version: "v2.1.0",
    region: "eu-west",
    requests: "864K",
    response: '{"orders":18,"latency_ms":36}',
  },
  {
    index: "03",
    title: "Code Gap",
    category: "Developer community",
    description:
      "A community and event platform connecting developers through education and real software projects.",
    tags: ["Community", "Events", "Education"],
    href: "https://codegap.ir/",
    service: "codegap-core",
    version: "v1.8.6",
    region: "me-central",
    requests: "438K",
    response: '{"community":"online","events":12}',
  },
];

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function ArchitectureMap() {
  return (
    <div className="architecture" aria-label="Animated backend architecture diagram">
      <div className="map-meta map-meta-top">
        <span>REQUESTS / S</span>
        <strong data-counter>2,842</strong>
      </div>
      <svg className="map-lines" viewBox="0 0 660 680" role="img" aria-hidden="true">
        <defs>
          <linearGradient id="route" x1="0" x2="1">
            <stop stopColor="#cfff35" />
            <stop offset="1" stopColor="#6e7d20" />
          </linearGradient>
        </defs>
        <g className="route-lines" fill="none" stroke="url(#route)" strokeWidth="1.2">
          <path d="M280 95V180" />
          <path d="M300 95V180" />
          <path d="M320 95V180" />
          <path d="M280 250V330" />
          <path d="M300 250V330" />
          <path d="M320 250V330" />
          <path d="M280 400V480" />
          <path d="M300 400V480" />
          <path d="M320 400V480" />
          <path d="M365 215C470 215 410 330 545 330" />
          <path d="M365 365C470 365 430 330 545 330" />
          <path d="M365 365C470 365 430 505 545 505" />
          <path d="M365 515C470 515 455 505 545 505" />
        </g>
        <g className="packets" fill="#d7ff3f">
          <circle className="packet packet-a" cx="280" cy="130" r="4" />
          <circle className="packet packet-b" cx="300" cy="290" r="3" />
          <circle className="packet packet-c" cx="430" cy="330" r="4" />
          <circle className="packet packet-d" cx="450" cy="505" r="3" />
        </g>
      </svg>
      <div className="map-stages">
        {[
          ["01", "CLIENTS", "Web / Mobile / API", "◎"],
          ["02", "EDGE", "Rate limit / routing", "⬡"],
          ["03", "API LAYER", "FastAPI / Pydantic", "</>"],
          ["04", "SERVICES", "Business logic / async", "◇"],
          ["05", "DATA LAYER", "Persistent storage", "▱"],
        ].map(([num, label, copy, icon]) => (
          <div className="map-row" key={num}>
            <span className="map-num">{num}</span>
            <div className="map-label">
              <b>{label}</b>
              <small>{copy}</small>
            </div>
            <div className="map-node">{icon}</div>
          </div>
        ))}
      </div>
      <div className="side-node cache-node">
        <span>▰</span>
        <div><b>CACHE</b><small>Redis</small></div>
      </div>
      <div className="side-node db-node">
        <span>◉</span>
        <div><b>DATABASE</b><small>PostgreSQL</small></div>
      </div>
      <div className="map-meta map-meta-bottom">
        <span>UPTIME</span>
        <strong>99.98%</strong>
      </div>
    </div>
  );
}

export default function Home() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const context = gsap.context(() => {
      const select = gsap.utils.selector(root);
      const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
      intro
        .from(".nav-shell", { y: -24, opacity: 0, duration: 0.7 })
        .from(".hero-kicker, .status-chip", { y: 18, opacity: 0, stagger: 0.08, duration: 0.65 }, "-=.3")
        .from(".hero-name span", { yPercent: 115, rotate: 2, stagger: 0.08, duration: 1.05 }, "-=.35")
        .from(".hero-role, .hero-copy, .hero-actions, .tech-strip", { y: 26, opacity: 0, stagger: 0.1, duration: 0.75 }, "-=.65")
        .from(".map-row", { x: 36, opacity: 0, stagger: 0.09, duration: 0.65 }, "-=.9")
        .from(".side-node, .map-meta", { opacity: 0, scale: 0.92, stagger: 0.08, duration: 0.5 }, "-=.45");

      gsap.from(".route-lines path", {
        strokeDasharray: 500,
        strokeDashoffset: 500,
        duration: 1.8,
        stagger: 0.06,
        ease: "power2.inOut",
        delay: 0.65,
      });
      const architectureIdle = gsap.timeline({ paused: true, repeat: -1 })
        .to(".packet-a", { y: 85, duration: 1.8, ease: "none" }, 0)
        .to(".packet-b", { y: 80, duration: 2.2, ease: "none" }, 0.5)
        .to(".packet-c", { x: 110, duration: 2.4, ease: "none" }, 0)
        .to(".packet-d", { x: 95, duration: 2.8, ease: "none" }, 0.8)
        .to(".cache-node", { "--pulse": 1, duration: .25, yoyo: true, repeat: 1 }, 1.1)
        .to(".db-node", { "--pulse": 1, duration: .25, yoyo: true, repeat: 1 }, 2.1);
      ScrollTrigger.create({
        trigger: ".architecture",
        start: "top bottom",
        end: "bottom top",
        onEnter: () => architectureIdle.play(),
        onEnterBack: () => architectureIdle.play(),
        onLeave: () => architectureIdle.pause(),
        onLeaveBack: () => architectureIdle.pause(),
      });

      gsap.to(".system-spine i", {
        scaleY: 1,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: .35 },
      });

      gsap.utils.toArray<HTMLElement>(".reveal").forEach((element) => {
        gsap.from(element, {
          y: 54,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 86%", once: true },
        });
      });
      gsap.utils.toArray<HTMLElement>(".project-card").forEach((card, index) => {
        gsap.from(card, {
          clipPath: "inset(0 0 100% 0)",
          y: 30,
          duration: 1,
          delay: index * 0.08,
          ease: "power4.out",
          scrollTrigger: { trigger: card, start: "top 88%", once: true },
        });
      });
      gsap.fromTo(".timeline", { "--timeline-progress": 0 }, {
        "--timeline-progress": 1,
        ease: "none",
        scrollTrigger: { trigger: ".timeline", start: "top 78%", end: "bottom 42%", scrub: .3 },
      });
      select("[data-timeline-node]").forEach((row) => {
        gsap.to(row, {
          "--timeline-active": 1,
          scrollTrigger: { trigger: row, start: "top 72%", end: "bottom 48%", toggleActions: "play reverse play reverse" },
        });
      });
    }, root);
    return () => context.revert();
  }, []);

  return (
    <main ref={root}>
      <SystemChrome />
      <div className="system-spine" aria-hidden="true"><i /></div>
      <header className="nav-shell">
        <a className="brand" href="#top" aria-label="Ali Mohammadi home">
          A<span>M</span><i />
          <small>Ali Mohammadi</small>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#experience">Experience</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy-column">
          <div className="status-chip">
            <span>SYSTEM STATUS</span>
            <b><i /> AVAILABLE FOR SELECT PROJECTS</b>
          </div>
          <p className="hero-kicker">BACKEND ENGINEER / BAKU</p>
          <h1 className="hero-name" aria-label="Ali Mohammadi">
            <span>ALI</span>
            <span>MOHAMMADI</span>
          </h1>
          <h2 className="hero-role">Backend Engineer</h2>
          <p className="hero-copy">
            I build scalable Python systems with FastAPI and Django—designed for
            speed, clarity, and reliable growth.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#work">View selected work <Arrow /></a>
            <a className="button button-secondary" href="#contact">Let&apos;s talk <Arrow /></a>
          </div>
          <div className="tech-strip" aria-label="Primary technologies">
            {["Python", "FastAPI", "PostgreSQL", "Redis"].map((item, index) => (
              <span key={item}><b>0{index + 1}</b>{item}</span>
            ))}
          </div>
        </div>
        <ArchitectureMap />
        <a className="scroll-indicator" href="#work">
          <span>SCROLL</span><i />01 / 05
        </a>
      </section>

      <RequestLifecycle />

      <section className="section work-section" id="work">
        <div className="section-heading reveal">
          <p>01 / SELECTED WORK</p>
          <h2>Systems built to<br />hold their shape.</h2>
          <span>PRODUCT BACKENDS, PLATFORMS & COMMUNITIES</span>
        </div>
        <div className="project-grid">
          {projects.map((project) => (
            <a className="project-card" href={project.href} target="_blank" rel="noreferrer" key={project.title}>
              <div className="project-top">
                <span>{project.index}</span><b><i /> HEALTHY</b><Arrow />
              </div>
              <div className="project-visual">
                <div className="visual-grid" />
                <span className="visual-label">SERVICE / {project.service}</span>
                <div className="visual-core">{project.index === "01" ? "API" : project.index === "02" ? "DB" : "CG"}</div>
                <i className="orbit orbit-one" /><i className="orbit orbit-two" />
                <i className="service-request" />
                <div className="deploy-state"><span>DEPLOYING</span><i /><b>READY</b></div>
              </div>
              <dl className="service-meta">
                <div><dt>VERSION</dt><dd>{project.version}</dd></div>
                <div><dt>UPTIME</dt><dd>99.98%</dd></div>
                <div><dt>REGION</dt><dd>{project.region}</dd></div>
                <div><dt>REQUESTS</dt><dd>{project.requests}</dd></div>
              </dl>
              <p className="project-category">{project.category}</p>
              <h3>{project.title}</h3>
              <p className="project-description">{project.description}</p>
              <code className="service-response">{project.response}</code>
              <div className="project-tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            </a>
          ))}
        </div>
      </section>

      <section className="section about-section" id="about">
        <div className="about-index reveal">02</div>
        <div className="about-content reveal">
          <p className="section-label">ABOUT / OPERATING PRINCIPLES</p>
          <h2>Complex underneath.<br /><em>Clear everywhere else.</em></h2>
          <div className="about-columns">
            <p>
              I&apos;m a backend engineer with 5+ years of experience turning
              complicated product requirements into dependable systems.
            </p>
            <p>
              My work lives at the intersection of thoughtful API design, pragmatic
              architecture, and performance that stays predictable as products grow.
            </p>
          </div>
          <div className="principles">
            {[
              ["01", "Design for change", "Architecture should make the next version easier, not harder."],
              ["02", "Make failure visible", "Observability and clear boundaries are part of the product."],
              ["03", "Keep it understandable", "The best system is one a team can confidently evolve."],
            ].map(([num, title, copy]) => (
              <article key={num}><span>{num}</span><h3>{title}</h3><p>{copy}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="section experience-section" id="experience">
        <div className="section-heading reveal">
          <p>03 / EXPERIENCE</p>
          <h2>From implementation<br />to architecture.</h2>
        </div>
        <div className="timeline">
          {experience.map((item) => (
            <article className="timeline-row reveal" data-timeline-node key={item.period + item.company}>
              <i className="timeline-node" />
              <p className="timeline-period">{item.period}</p>
              <div><h3>{item.role}</h3><p className="timeline-company">{item.company}</p></div>
              <p className="timeline-detail">{item.detail}</p>
              <span className="timeline-tech">{item.tech}</span>
              <b className="upgrade-label">SYSTEM UPGRADE</b>
            </article>
          ))}
        </div>
      </section>

      <section className="section stack-section">
        <p className="section-label reveal">04 / TOOLBOX</p>
        <div className="marquee reveal">
          <div>{[...stack, ...stack].map((item, i) => <span key={`${item}-${i}`}>{item}<b>✳</b></span>)}</div>
        </div>
      </section>

      <LiveSystems />
      <InfrastructureFlow />
      <TerminalContact />
      <footer className="legacy-contact" aria-hidden="true">
        <div className="footer-status reveal"><i /> OPEN TO AMBITIOUS BACKEND PROJECTS</div>
        <h2 className="reveal">Have a system<br />worth building?</h2>
        <a className="footer-email reveal" href="mailto:alimohammadi.8773@gmail.com">
          alimohammadi.8773@gmail.com <Arrow />
        </a>
        <div className="footer-bottom">
          <p>ALI MOHAMMADI © 2026</p>
          <div>
            <a href="https://github.com/AliDvlpr" target="_blank" rel="noreferrer">GITHUB</a>
            <a href="https://linkedin.com/in/alidvlpr" target="_blank" rel="noreferrer">LINKEDIN</a>
            <a href="https://t.me/Ali_Dvlpr" target="_blank" rel="noreferrer">TELEGRAM</a>
          </div>
          <a href="#top">BACK TO TOP ↑</a>
        </div>
      </footer>
    </main>
  );
}
