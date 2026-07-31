import type { Metadata } from "next";
import Link from "next/link";
import { PrintButton } from "./PrintButton";

export const metadata: Metadata = {
  title: "Resume | Ali Mohammadi",
  description: "Backend engineering experience, skills, and selected work.",
  alternates: { canonical: "/resume" },
};

const roles = [
  ["2025—NOW", "Senior Backend Engineer", "QCode", "Leading backend architecture across product domains; designing APIs, data paths, and reliable integrations."],
  ["2024—NOW", "Founder", "Code Gap", "Building a developer community around practical engineering, projects, and education."],
  ["2023—NOW", "Freelance Web Developer", "Independent", "Delivering dependable backend systems for product teams."],
  ["2019—2025", "Backend Developer → Team Lead", "Alborz Institute", "Progressed from implementation to technical leadership, mentoring, CRM delivery, and teaching."],
];

export default function ResumePage() {
  return <main className="resume-page" id="main-content">
    <header className="resume-actions"><Link href="/">← PORTFOLIO</Link><PrintButton /></header>
    <section className="resume-header"><div><p>ALI MOHAMMADI</p><h1>Backend<br />Engineer.</h1></div><div><span>BAKU</span><a href="mailto:alimohammadi.8773@gmail.com">alimohammadi.8773@gmail.com</a><a href="https://github.com/AliDvlpr">github.com/AliDvlpr</a></div></section>
    <section className="resume-summary"><p>PROFILE</p><h2>Backend engineer with 5+ years of experience turning complex product requirements into dependable systems.</h2></section>
    <section className="resume-grid"><aside><p>CORE STACK</p>{["Python", "FastAPI", "Django", "PostgreSQL", "Redis", "Docker", "Go"].map((item) => <span key={item}>{item}</span>)}</aside>
      <div><p>EXPERIENCE</p>{roles.map(([period, role, company, detail]) => <article key={period + company}><time>{period}</time><div><h2>{role}</h2><b>{company}</b><p>{detail}</p></div></article>)}</div>
    </section>
  </main>;
}
