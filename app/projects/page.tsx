import type { Metadata } from "next";
import { projects } from "@/content/projects";
import { PageHeader } from "../PagePrimitives";
import { ProjectRegistry } from "./ProjectRegistry";

export const metadata: Metadata = {
  title: "Projects | Ali — Backend Systems and APIs",
  description: "A registry of backend systems, APIs, commerce platforms, and engineering case studies.",
  alternates: { canonical: "/projects" },
  openGraph: { title: "Backend Projects and Case Studies", description: "Production-minded systems built with Python, Django, PostgreSQL, and more.", url: "/projects", type: "website" },
};

export default function ProjectsPage() {
  return <main className="route-page projects-route" id="main-content">
    <PageHeader index="02" module="PROJECT_REGISTRY" path="/projects" title={<>Running systems.<br />Documented decisions.</>} description="A registry of product backends, community platforms, and the engineering decisions behind each service." />
    <ProjectRegistry projects={projects} />
  </main>;
}
