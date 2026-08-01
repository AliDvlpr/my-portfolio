import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { getAdminProject, getRevisions } from "@/lib/cms/repository";
import { AdminNav } from "../../../AdminNav";
import { ProjectEditor } from "../../../ContentEditor";
import { RevisionRestoreButton } from "../../../RevisionRestoreButton";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit Project | AliDvlpr CMS", robots: { index: false, follow: false } };
export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) { const session = await requireAdminSession(); const project = await getAdminProject((await params).id); if (!project) notFound(); const revisions = await getRevisions("project", project.id); return <main className="admin-page" id="main-content"><AdminNav email={session.user.email} /><section className="admin-heading"><p>CONTENT / EDIT PROJECT</p><h1>{project.title}</h1><span>CREATED {project.createdAt.slice(0, 10)} / UPDATED {project.updatedAt.slice(0, 10)}</span></section><ProjectEditor initial={{ ...project, architecture: JSON.parse(project.architecture), challenges: JSON.parse(project.challenges), decisions: JSON.parse(project.decisions), outcomes: JSON.parse(project.outcomes), metrics: JSON.parse(project.metrics) }} /><section className="admin-panel cms-revisions"><div className="admin-panel-head"><h2>Revision history</h2><span>IMMUTABLE</span></div>{revisions.map((revision) => <article key={revision.id}><b>v{revision.version}</b><span>{revision.action}</span><time>{revision.createdAt.replace("T", " ").slice(0, 16)}</time><small>{revision.createdBy}</small>{revision.version !== project.version && <RevisionRestoreButton revisionId={revision.id} version={project.version} />}</article>)}</section></main>; }
