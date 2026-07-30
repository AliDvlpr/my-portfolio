import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/content/projects";
import { ContentNav } from "@/app/blog/page";
import { ProjectTracker } from "./ProjectTracker";

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  return {
    title: `${project.title} Case Study | Ali Mohammadi`,
    description: project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { title: `${project.title} — Backend Case Study`, description: project.summary, type: "article", url: `/projects/${project.slug}` },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const project = getProject((await params).slug);
  if (!project) notFound();
  const jsonLd = {
    "@context": "https://schema.org", "@type": "CreativeWork", name: project.title,
    description: project.summary, creator: { "@type": "Person", name: "Ali Mohammadi" },
    url: `/projects/${project.slug}`, keywords: project.stack.join(", "),
  };
  return <main className="content-page project-page" id="main-content">
    <ContentNav /><ProjectTracker slug={project.slug} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replaceAll("<", "\\u003c") }} />
    <header className="project-case-header"><div><p>SERVICE / {project.slug}</p><h1>{project.title}</h1><em>{project.summary}</em></div><div className="case-health"><i /> STATUS <b>HEALTHY</b><span>{project.version}</span></div></header>
    <section className="case-metrics">{project.metrics.map((metric) => <article key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong></article>)}</section>
    <section className="case-overview">
      <div><p>ROLE</p><h2>{project.role}</h2></div><div><p>TIMELINE</p><h2>{project.timeline}</h2></div><div><p>STACK</p><h2>{project.stack.join(" / ")}</h2></div>
    </section>
    <section className="case-section"><p>01 / PROBLEM & CONSTRAINTS</p><h2>What the system<br />needed to protect.</h2><div className="case-list">{project.challenges.map((item) => <article key={item}><i />{item}</article>)}</div></section>
    <section className="case-section case-architecture"><p>02 / ARCHITECTURE</p><h2>Boundaries before<br />infrastructure.</h2><div className="architecture-chain">{project.architecture.map((node, index) => <div key={node}><span>{String(index + 1).padStart(2, "0")}</span><b>{node}</b><i /></div>)}</div></section>
    <section className="case-section case-columns"><div><p>03 / DECISIONS & TRADEOFFS</p><h2>Deliberate choices.</h2>{project.decisions.map((item) => <article key={item}>{item}</article>)}</div><div><p>04 / OUTCOMES</p><h2>Observable results.</h2>{project.outcomes.map((item) => <article key={item}>{item}</article>)}</div></section>
    <footer className="case-links">
      <Link href="/">← PORTFOLIO</Link>
      {project.repositoryUrl && <a href={project.repositoryUrl} target="_blank" rel="noreferrer">VIEW REPOSITORY ↗</a>}
      {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer">VIEW LIVE ↗</a>}
    </footer>
  </main>;
}
