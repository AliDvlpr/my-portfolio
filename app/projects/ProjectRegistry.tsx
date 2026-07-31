"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { Project } from "@/content/projects";
import { trackEvent } from "@/lib/analytics-client";

const filters = ["All", "Backend", "Full Stack", "API", "Infrastructure", "Community"];

export function ProjectRegistry({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const initialFilter = params.get("type") ?? "All";
  const [filter, setFilter] = useState(filters.includes(initialFilter) ? initialFilter : "All");
  const [query, setQuery] = useState(params.get("q") ?? "");
  const filtered = useMemo(() => projects.filter((project) => {
    const haystack = `${project.title} ${project.category} ${project.stack.join(" ")} ${project.summary}`.toLowerCase();
    const matchesQuery = haystack.includes(query.trim().toLowerCase());
    const matchesFilter = filter === "All" || haystack.includes(filter.toLowerCase()) || (filter === "Backend" && /django|api|backend/.test(haystack));
    return matchesQuery && matchesFilter;
  }), [projects, query, filter]);

  function update(nextFilter: string, nextQuery = query) {
    setFilter(nextFilter);
    const search = new URLSearchParams();
    if (nextFilter !== "All") search.set("type", nextFilter);
    if (nextQuery.trim()) search.set("q", nextQuery.trim());
    router.replace(`${pathname}${search.size ? `?${search}` : ""}`, { scroll: false });
    trackEvent("project_filter_changed", { filter: nextFilter });
  }

  return <>
    <div className="registry-controls">
      <label><span>SEARCH REGISTRY</span><input type="search" value={query} placeholder="project, stack, service…" onChange={(event) => { setQuery(event.target.value); update(filter, event.target.value); }} /></label>
      <div className="filter-group" aria-label="Filter projects">{filters.map((item) => <button aria-pressed={filter === item} onClick={() => update(item)} key={item}>{item}</button>)}</div>
      <p role="status">{filtered.length} SERVICES MATCHED</p>
    </div>
    <section className="registry-grid" aria-label="Project registry">
      {filtered.map((project) => <article className="registry-card" key={project.slug}>
        <div className="registry-card-head"><span>SERVICE / {project.slug}</span><b><i /> {project.status.toUpperCase()}</b></div>
        <div className="registry-service-core" aria-hidden="true"><i /><strong>{project.index}</strong><span>REQUEST ACCEPTED</span></div>
        <h2>{project.title}</h2><p>{project.summary}</p>
        <dl><div><dt>VERSION</dt><dd>{project.version}</dd></div><div><dt>ROLE</dt><dd>{project.role}</dd></div><div><dt>YEAR</dt><dd>{project.timeline}</dd></div><div><dt>UPTIME</dt><dd>{project.metrics[0]?.value ?? "ILLUSTRATIVE"}</dd></div></dl>
        <div className="registry-tags">{project.stack.map((item) => <span key={item}>{item}</span>)}</div>
        <div className="registry-links"><Link href={`/projects/${project.slug}`}>OPEN CASE STUDY ↗</Link>{project.repositoryUrl && <a href={project.repositoryUrl} target="_blank" rel="noreferrer">REPOSITORY ↗</a>}{project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer">LIVE SYSTEM ↗</a>}</div>
      </article>)}
      {!filtered.length && <div className="registry-empty"><strong>0 SERVICES FOUND</strong><p>Adjust the query or reset the project type.</p><button onClick={() => { setQuery(""); update("All", ""); }}>RESET REGISTRY</button></div>}
    </section>
  </>;
}
