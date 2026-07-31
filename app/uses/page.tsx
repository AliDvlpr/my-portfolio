import type { Metadata } from "next";
import { uses, usesUpdatedAt } from "@/content/uses";
import { PageHeader } from "../PagePrimitives";

export const metadata: Metadata = {
  title: "Uses | Ali — Tools and Stack",
  description: "Languages, frameworks, databases, infrastructure, development tools, and engineering workflows.",
  alternates: { canonical: "/uses" },
  openGraph: { title: "Uses — Ali's Tools and Stack", description: "The tools behind Ali's backend engineering workflow.", url: "/uses", type: "website" },
};

export default function UsesPage() {
  return <main className="route-page uses-route" id="main-content">
    <PageHeader index="04" module="TOOLBOX" path="/uses" title={<>Tools chosen<br />for a reason.</>} description="A maintained inventory of the languages, infrastructure, and workflows I reach for—plus why they earn a place in the stack.">
      <time dateTime={usesUpdatedAt}>LAST UPDATED / JUL 2026</time>
    </PageHeader>
    <div className="uses-registry">{uses.map((group, groupIndex) => <section key={group.category}>
      <header><span>{String(groupIndex + 1).padStart(2, "0")}</span><h2>{group.category}</h2><b>{group.items.length} DEPENDENCIES</b></header>
      {group.items.map(([name, detail, status]) => <article key={name}><div><i /><h3>{name}</h3><b>{status}</b></div><p>{detail}</p></article>)}
    </section>)}</div>
  </main>;
}
