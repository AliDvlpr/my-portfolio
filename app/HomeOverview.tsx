"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import type { Project } from "@/content/projects";
import { experience } from "@/content/profile";
import { LiveSystems } from "./SystemExperience";
import { RequestLifecycle } from "./BackendMotionSystem";
import { HomepageMotionSystem } from "./HomepageMotionSystem";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

type ArticlePreview = {
  slug: string; title: string; description: string; publishedAt: string; readingTime: number; tags: string[];
};

function Arrow() { return <span aria-hidden="true">↗</span>; }

function ArchitectureMap() {
  const stages = [
    ["01", "CLIENTS", "Web / Mobile / API"],
    ["02", "EDGE", "Rate limit / routing"],
    ["03", "API LAYER", "FastAPI / Pydantic"],
    ["04", "SERVICES", "Business logic / async"],
    ["05", "DATA LAYER", "Persistence orchestration"],
  ];
  return <div className="architecture" aria-label="Animated backend architecture diagram">
    <div className="map-meta map-meta-top"><span>REQUESTS / S</span><strong>2,842</strong></div>
    <svg className="architecture-svg" viewBox="0 0 720 720" role="img" aria-labelledby="architecture-title architecture-description">
      <title id="architecture-title">Backend request architecture</title>
      <desc id="architecture-description">A request moves from clients through edge routing, the API layer, services, cache, database, and the data layer.</desc>
      <g className="architecture-routes" fill="none">
        <path d="M350 112V160M350 232V280M350 352V400M350 472V520" />
        <path className="architecture-cache-route" d="M402 436C465 436 470 386 540 386" />
        <path className="architecture-db-route" d="M402 556C465 556 475 536 540 536" />
        <path className="architecture-main-motion" d="M350 76V556" opacity="0" />
      </g>
      {stages.map(([num, label, copy], index) => {
        const y = 40 + index * 120;
        return <g className="architecture-service" transform={`translate(0 ${y})`} key={num}>
          <text className="architecture-index" x="66" y="29">{num}</text>
          <text className="architecture-label" x="112" y="28">{label}</text>
          <text className="architecture-copy" x="112" y="49">{copy}</text>
          <rect x="300" y="0" width="102" height="72" rx="1" />
          <rect className="architecture-node-core" x="337" y="23" width="28" height="28" rx="1" />
          {index < stages.length - 1 && <circle className="architecture-anchor" cx="350" cy="72" r="3" />}
        </g>;
      })}
      <g className="architecture-side-service">
        <rect x="540" y="350" width="112" height="72" rx="1" />
        <rect className="architecture-node-core is-cache" x="579" y="373" width="28" height="28" rx="1" />
        <text className="architecture-label" x="540" y="445">CACHE</text>
        <text className="architecture-copy" x="540" y="465">Redis · lookup</text>
      </g>
      <g className="architecture-side-service">
        <rect x="540" y="500" width="112" height="72" rx="1" />
        <circle className="architecture-db-core" cx="596" cy="536" r="13" />
        <circle className="architecture-db-dot" cx="596" cy="536" r="5" />
        <text className="architecture-label" x="540" y="595">DATABASE</text>
        <text className="architecture-copy" x="540" y="615">PostgreSQL · query</text>
      </g>
      <g className="architecture-packets">
        <circle className="packet packet-a" r="4" />
        <circle className="packet packet-b" r="4" />
        <circle className="packet packet-c" r="4" />
      </g>
    </svg>
    <ol className="architecture-mobile-flow" aria-label="Backend service flow">
      {[...stages, ["06", "CACHE", "Redis lookup"], ["07", "DATABASE", "PostgreSQL query"]].map(([num, label, copy]) => <li key={num}><span>{num}</span><i /><div><b>{label}</b><small>{copy}</small></div></li>)}
    </ol>
    <div className="map-meta map-meta-bottom"><span>UPTIME</span><strong>99.98%</strong></div>
  </div>;
}

export function HomeOverview({ articles, featuredProjects }: { articles: ArticlePreview[]; featuredProjects: Project[] }) {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const scope = root.current;
    if (!scope) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let removeVisibilityListener: () => void = () => {};
    const context = gsap.context(() => {
      gsap.timeline({ defaults: { ease: "power4.out" } })
        .from(".hero-kicker, .status-chip", { y: 16, opacity: 0, stagger: .08, duration: .55 })
        .from(".hero-name span", { yPercent: 110, stagger: .08, duration: .9 }, "-=.25")
        .from(".hero-role, .hero-copy, .hero-actions, .tech-strip", { y: 22, opacity: 0, stagger: .08, duration: .6 }, "-=.55")
        .from(".architecture-service, .architecture-side-service, .architecture-mobile-flow li", { x: 22, opacity: 0, stagger: .06, duration: .45 }, "-=.8");
      const routeA = scope.querySelector<SVGPathElement>(".architecture-main-motion");
      const routeB = scope.querySelector<SVGPathElement>(".architecture-cache-route");
      const routeCache = scope.querySelector<SVGPathElement>(".architecture-db-route");
      const packetA = scope.querySelector<SVGCircleElement>(".packet-a");
      const packetB = scope.querySelector<SVGCircleElement>(".packet-b");
      const packetC = scope.querySelector<SVGCircleElement>(".packet-c");
      const architecture = scope.querySelector<HTMLElement>(".architecture");
      const idle = gsap.timeline({ repeat: -1, repeatDelay: .3 });
      if (routeA && routeB && routeCache && packetA && packetB && packetC) {
        idle
          .to(packetA, { motionPath: { path: routeA, align: routeA, alignOrigin: [.5, .5] }, duration: 1.8, ease: "none" })
          .to(packetB, { motionPath: { path: routeB, align: routeB, alignOrigin: [.5, .5] }, duration: 2.1, ease: "none" }, 0)
          .to(packetC, { motionPath: { path: routeCache, align: routeCache, alignOrigin: [.5, .5] }, duration: 2.4, ease: "none" }, 0);
      }
      if (architecture) ScrollTrigger.create({ trigger: architecture, start: "top bottom", end: "bottom top", onLeave: () => idle.pause(), onEnterBack: () => idle.play() });
      const onVisibility = () => document.hidden ? idle.pause() : idle.play();
      document.addEventListener("visibilitychange", onVisibility);
      removeVisibilityListener = () => document.removeEventListener("visibilitychange", onVisibility);
    }, root);
    return () => {
      removeVisibilityListener();
      context.revert();
    };
  }, []);

  return <main ref={root} id="main-content" className="home-overview">
    <HomepageMotionSystem />
    <section className="hero" id="top" data-home-stage="0">
      <div className="hero-copy-column">
        <div className="status-chip"><span>SYSTEM STATUS</span><b><i /> AVAILABLE FOR SELECT PROJECTS</b></div>
        <p className="hero-kicker">BACKEND ENGINEER / BAKU</p>
        <h1 className="hero-name" aria-label="Ali Mohammadi"><span>ALI</span><span>MOHAMMADI</span></h1>
        <h2 className="hero-role">Backend Engineer</h2>
        <p className="hero-copy">I build scalable Python systems with FastAPI and Django—designed for speed, clarity, and reliable growth.</p>
        <div className="hero-actions"><Link className="button button-primary" href="/projects">Explore projects <Arrow /></Link><Link className="button button-secondary" href="/contact">Open contact gateway <Arrow /></Link></div>
        <div className="tech-strip" aria-label="Primary technologies">{["Python", "FastAPI", "PostgreSQL", "Redis"].map((item, index) => <span key={item}><b>0{index + 1}</b>{item}</span>)}</div>
      </div>
      <ArchitectureMap />
      <a className="scroll-indicator" href="#snapshot"><span>SCROLL</span><i />01 / 06</a>
    </section>

    <section id="snapshot" className="home-system-snapshot" data-home-stage="1"><RequestLifecycle /></section>

    <LiveSystems />

    <section className="section work-section home-reveal" id="projects-stage" data-home-stage="6">
      <div className="section-heading"><p>02 / FEATURED SERVICES</p><h2>Systems built to<br />hold their shape.</h2><Link href="/projects">Explore all projects <Arrow /></Link></div>
      <div className="project-grid">{featuredProjects.map((project) => <Link className="project-card" href={`/projects/${project.slug}`} key={project.slug}>
        <div className="project-top"><span>{project.index}</span><b><i /> HEALTHY</b><Arrow /></div>
        <div className="project-visual"><div className="visual-grid" /><span className="visual-label">SERVICE / {project.slug}</span><div className="visual-core">API</div><i className="orbit orbit-one" /><i className="service-request" /></div>
        <dl className="service-meta"><div><dt>VERSION</dt><dd>{project.version}</dd></div><div><dt>REGION</dt><dd>{project.region}</dd></div><div><dt>REQUESTS</dt><dd>{project.requests}</dd></div></dl>
        <p className="project-category">{project.category}</p><h3>{project.title}</h3><p className="project-description">{project.description}</p>
      </Link>)}</div>
    </section>

    <section className="section home-experience-preview home-reveal" id="experience-stage" data-home-stage="7">
      <div className="section-heading"><p>03 / SELECTED EXPERIENCE</p><h2>Implementation<br />to architecture.</h2><Link href="/about">Read full background <Arrow /></Link></div>
      <div className="timeline">{experience.slice(0, 2).map((item) => <article className="timeline-row" key={item.period + item.company}><i className="timeline-node" /><p className="timeline-period">{item.period}</p><div><h3>{item.role}</h3><p className="timeline-company">{item.company}</p></div><p className="timeline-detail">{item.detail}</p><span className="timeline-tech">{item.tech.join(" / ")}</span></article>)}</div>
    </section>

    <section className="section home-writing home-reveal" id="writing-stage" data-home-stage="9">
      <div className="section-heading"><p>04 / LATEST WRITING</p><h2>Engineering notes<br />from production.</h2><Link href="/blog">View engineering notes <Arrow /></Link></div>
      <div className="home-article-grid">{articles.map((article) => <Link href={`/blog/${article.slug}`} key={article.slug}><p>{article.tags.join(" / ")}</p><h3>{article.title}</h3><span>{article.description}</span><b>{article.readingTime} MIN READ <Arrow /></b></Link>)}</div>
    </section>

    <section className="home-gateways home-reveal" id="gateway-stage" data-home-stage="10">
      <Link id="toolbox-stage" href="/uses"><span>MODULE / TOOLBOX</span><h2>Current stack and workflow.</h2><b>Inspect toolbox <Arrow /></b></Link>
      <Link id="contact-stage" href="/contact"><span>ENDPOINT / CONTACT</span><h2>Have a system worth building?</h2><b>Open terminal contact <Arrow /></b></Link>
    </section>
    <div className="home-response" id="response-stage" data-home-stage="11"><span>RESPONSE</span><strong>200 OK</strong><p>connection reusable · total latency 42ms</p></div>
  </main>;
}
