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
    ["01", "CLIENTS", "Web / Mobile / API", "◎"],
    ["02", "EDGE", "Rate limit / routing", "⬡"],
    ["03", "API LAYER", "FastAPI / Pydantic", "</>"],
    ["04", "SERVICES", "Business logic / async", "◇"],
    ["05", "DATA LAYER", "PostgreSQL / Redis", "▱"],
  ];
  return <div className="architecture" aria-label="Animated backend architecture diagram">
    <div className="map-meta map-meta-top"><span>REQUESTS / S</span><strong>2,842</strong></div>
    <svg className="map-lines" viewBox="0 0 660 680" aria-hidden="true">
      <g className="route-lines" fill="none" stroke="#cfff35" strokeWidth="1.2">
        <path className="route-primary-a" d="M280 95V180" /><path d="M300 95V180M320 95V180" />
        <path className="route-primary-b" d="M300 250V330" /><path d="M280 250V330M320 250V330M280 400V480M300 400V480M320 400V480" />
        <path className="route-cache" d="M365 215C470 215 410 330 545 330" /><path d="M365 365C470 365 430 505 545 505" />
      </g>
      <g className="packets" fill="#d7ff3f"><circle className="packet packet-a" r="4" /><circle className="packet packet-b" r="3" /><circle className="packet packet-c" r="4" /></g>
    </svg>
    <div className="map-stages">{stages.map(([num, label, copy, icon]) => <div className="map-row" key={num}><span className="map-num">{num}</span><div className="map-label"><b>{label}</b><small>{copy}</small></div><div className="map-node">{icon}</div></div>)}</div>
    <div className="side-node cache-node"><span>▰</span><div><b>CACHE</b><small>Redis</small></div></div>
    <div className="side-node db-node"><span>◉</span><div><b>DATABASE</b><small>PostgreSQL</small></div></div>
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
        .from(".map-row", { x: 28, opacity: 0, stagger: .07, duration: .5 }, "-=.8");
      const routeA = scope.querySelector<SVGPathElement>(".route-primary-a");
      const routeB = scope.querySelector<SVGPathElement>(".route-primary-b");
      const routeCache = scope.querySelector<SVGPathElement>(".route-cache");
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
