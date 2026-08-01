import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { getAdminProject } from "@/lib/cms/repository";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Project Preview | AliDvlpr CMS", robots: { index: false, follow: false, nocache: true } };
export default async function ProjectPreview({ params }: { params: Promise<{ id: string }> }) { await requireAdminSession(); const project = await getAdminProject((await params).id); if (!project) notFound(); return <main className="content-page project-page cms-draft-preview" id="main-content"><div className="cms-preview-banner">ADMIN PREVIEW · {project.status.toUpperCase()} · NOT PUBLIC <Link href={`/admin/projects/${project.id}/edit`}>RETURN TO EDITOR</Link></div><header className="project-case-header"><div><p>SERVICE / {project.slug}</p><h1>{project.title}</h1><em>{project.summary}</em></div></header><section className="case-overview"><div><p>ROLE</p><h2>{project.role}</h2></div><div><p>TIMELINE</p><h2>{project.timeline}</h2></div><div><p>STACK</p><h2>{project.stack.join(" / ")}</h2></div></section><section className="case-section"><p>DESCRIPTION</p><h2>{project.description}</h2></section></main>; }
