import type { Metadata } from "next";
import Link from "next/link";
import { PrintButton } from "./PrintButton";
import { experience } from "@/content/profile";
import { featuredProjects } from "@/content/projects";
import { ResumeDownload } from "./ResumeDownload";

export const metadata: Metadata = {
  title: "Resume | Ali — Backend Engineer Resume",
  description: "Backend engineering experience, skills, and selected work.",
  alternates: { canonical: "/resume" },
};

export default function ResumePage() {
  return <main className="resume-page" id="main-content">
    <header className="resume-actions"><Link href="/">← PORTFOLIO</Link><div><ResumeDownload /><PrintButton /><Link href="/projects">VIEW PROJECTS</Link><Link href="/contact">CONTACT</Link></div></header>
    <section className="resume-header"><div><p>ALI MOHAMMADI</p><h1>Backend<br />Engineer.</h1></div><div><span>BAKU</span><a href="mailto:alimohammadi.8773@gmail.com">alimohammadi.8773@gmail.com</a><a href="https://github.com/AliDvlpr">github.com/AliDvlpr</a></div></section>
    <section className="resume-summary"><p>PROFILE</p><h2>Backend engineer with 5+ years of experience turning complex product requirements into dependable systems.</h2></section>
    <section className="resume-grid"><aside><p>CORE STACK</p>{["Python", "FastAPI", "Django", "PostgreSQL", "Redis", "Docker", "Go"].map((item) => <span key={item}>{item}</span>)}</aside>
      <div><p>EXPERIENCE</p>{experience.map(({ period, role, company, detail }) => <article key={period + company}><time>{period}</time><div><h2>{role}</h2><b>{company}</b><p>{detail}</p></div></article>)}</div>
    </section>
    <section className="resume-projects"><p>SELECTED PROJECTS</p>{featuredProjects.map((project) => <article key={project.slug}><h2>{project.title}</h2><p>{project.summary}</p><span>{project.stack.join(" / ")}</span></article>)}</section>
  </main>;
}
