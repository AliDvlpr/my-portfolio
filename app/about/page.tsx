import type { Metadata } from "next";
import Link from "next/link";
import { experience, principles, profileFacts } from "@/content/profile";
import { PageHeader, SectionHeader } from "../PagePrimitives";

export const metadata: Metadata = {
  title: "About | Ali — Backend Engineer",
  description: "Engineering philosophy, backend specialization, experience, leadership, and current learning.",
  alternates: { canonical: "/about" },
  openGraph: { title: "About Ali — Backend Engineer", description: "How Ali approaches maintainable backend systems and technical leadership.", url: "/about", type: "profile" },
};

export default function AboutPage() {
  return <main className="route-page about-route" id="main-content">
    <PageHeader index="01" module="PROFILE" path="/about" title={<>Complex underneath.<br /><em>Clear everywhere else.</em></>} description="I turn complicated product requirements into dependable backend systems that teams can understand, operate, and extend.">
      <Link className="route-cta" href="/resume">VIEW RESUME ↗</Link>
    </PageHeader>
    <section className="identity-grid">
      <div className="identity-card"><span>IDENTITY / AM_01</span><strong>ALI<br />MOHAMMADI</strong><dl><div><dt>LOCATION</dt><dd>{profileFacts.location}</dd></div><div><dt>FOCUS</dt><dd>{profileFacts.focus}</dd></div><div><dt>EXPERIENCE</dt><dd>{profileFacts.experience}</dd></div></dl></div>
      <div className="about-prose"><p>My work sits between API design, database behavior, background processing, and the operational details that determine whether a product stays reliable after launch.</p><p>I prefer explicit boundaries over clever abstractions, measured performance over assumptions, and systems a team can confidently change without depending on one person’s memory.</p></div>
    </section>
    <section className="route-section">
      <SectionHeader label="CONFIG / ENGINEERING PRINCIPLES" title="Service guarantees." />
      <div className="principle-config">{principles.map(([title, copy], index) => <article key={title}><span>RULE_{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{copy}</p><code>ENFORCED = true</code></article>)}</div>
    </section>
    <section className="route-section">
      <SectionHeader label="UPGRADE HISTORY / EXPERIENCE" title="From delivery to architecture." copy="Each role expanded the system boundary: implementation, product delivery, leadership, then architecture." />
      <div className="about-timeline">{experience.map((item) => <article key={item.period + item.company}><i /><time>{item.period}</time><div><span>{item.stage}</span><h3>{item.role}</h3><b>{item.company}</b><p>{item.detail}</p><ul>{item.tech.map((tech) => <li key={tech}>{tech}</li>)}</ul></div></article>)}</div>
    </section>
    <section className="route-section about-learning">
      <SectionHeader label="CURRENT PROCESS / LEARNING" title="Still compiling." />
      <div>{profileFacts.currentLearning.map((item, index) => <p key={item}><span>0{index + 1}</span>{item}<b>IN PROGRESS</b></p>)}</div>
      <aside><h3>Outside engineering</h3><p>I invest in developer communities, practical education, mentoring, and creating clearer paths for people building their first real systems.</p><Link href="/contact">Start a conversation ↗</Link></aside>
    </section>
  </main>;
}
