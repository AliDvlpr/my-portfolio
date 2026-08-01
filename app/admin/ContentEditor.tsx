"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SafeArticleBody } from "@/app/blog/SafeArticleBody";
import { suggestedSlug } from "@/lib/cms/schemas";

type PostValue = {
  id?: string; title: string; slug: string; description: string; content: string; status: "draft" | "scheduled" | "published" | "archived";
  featured: boolean; tags: string[]; coverImageId?: string | null; seoTitle?: string | null; seoDescription?: string | null;
  canonicalUrl?: string | null; scheduledAt?: string | null; version?: number;
};

const emptyPost: PostValue = { title: "", slug: "", description: "", content: "## Overview\n\nStart writing here.", status: "draft", featured: false, tags: ["Architecture"], version: 1 };

export function PostEditor({ initial }: { initial?: PostValue }) {
  const router = useRouter();
  const [value, setValue] = useState<PostValue>(initial ?? emptyPost);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [dirty, setDirty] = useState(false);
  const [state, setState] = useState("READY");
  const [fields, setFields] = useState<Record<string, string>>({});
  const endpoint = initial?.id ? `/api/admin/posts/${initial.id}` : "/api/admin/posts";

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function update<K extends keyof PostValue>(key: K, next: PostValue[K]) {
    setValue((current) => ({ ...current, [key]: next }));
    setDirty(true);
  }

  async function save(nextStatus?: PostValue["status"]) {
    setState(nextStatus === "published" ? "PUBLISHING" : "SAVING");
    setFields({});
    const payload = { ...value, status: nextStatus ?? value.status, tags: value.tags.map((tag) => tag.trim()).filter(Boolean), scheduledAt: value.scheduledAt || null };
    try {
      const response = await fetch(endpoint, { method: initial?.id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const body = await response.json() as { success: boolean; post?: PostValue; message?: string; fields?: Record<string, string>; code?: string };
      if (!response.ok || !body.post) {
        setFields(body.fields ?? {});
        setState(body.code === "EDIT_CONFLICT" ? "CONFLICT — RELOAD BEFORE SAVING" : body.message ?? "SAVE FAILED");
        return;
      }
      setDirty(false);
      setState(body.post.status === "published" ? "PUBLISHED" : "SAVED");
      setValue(body.post);
      if (!initial?.id && body.post.id) router.replace(`/admin/posts/${body.post.id}/edit`);
    } catch { setState("NETWORK ERROR — RETRY"); }
  }

  const preview = useMemo(() => value.content, [value.content]);
  return <div className="cms-editor-shell">
    <div className="cms-editor-status" role="status"><span>VERSION {value.version ?? 1}</span><b>{state}</b></div>
    <div className="cms-form-grid">
      <section className="admin-panel cms-form-panel" aria-labelledby="post-fields">
        <h2 id="post-fields">Article fields</h2>
        <label>Title<input value={value.title} onChange={(event) => { const title = event.target.value; update("title", title); if (!slugTouched) update("slug", suggestedSlug(title)); }} aria-invalid={Boolean(fields.title)} />{fields.title && <small>{fields.title}</small>}</label>
        <label>Slug<input value={value.slug} onChange={(event) => { setSlugTouched(true); update("slug", event.target.value); }} aria-invalid={Boolean(fields.slug)} />{fields.slug && <small>{fields.slug}</small>}</label>
        <label>Description<textarea rows={3} value={value.description} onChange={(event) => update("description", event.target.value)} aria-invalid={Boolean(fields.description)} />{fields.description && <small>{fields.description}</small>}</label>
        <label>Tags (comma separated)<input value={value.tags.join(", ")} onChange={(event) => update("tags", event.target.value.split(","))} /></label>
        <label>Status<select value={value.status} onChange={(event) => update("status", event.target.value as PostValue["status"])}><option value="draft">Draft</option><option value="scheduled">Scheduled</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
        {value.status === "scheduled" && <label>Schedule time (UTC)<input type="datetime-local" value={value.scheduledAt?.slice(0, 16) ?? ""} onChange={(event) => update("scheduledAt", event.target.value ? new Date(event.target.value).toISOString() : null)} />{fields.scheduledAt && <small>{fields.scheduledAt}</small>}</label>}
        <label className="cms-check"><input type="checkbox" checked={value.featured} onChange={(event) => update("featured", event.target.checked)} /> Featured article</label>
        <label>SEO title<input value={value.seoTitle ?? ""} onChange={(event) => update("seoTitle", event.target.value)} /></label>
        <label>SEO description<textarea rows={2} value={value.seoDescription ?? ""} onChange={(event) => update("seoDescription", event.target.value)} /></label>
        <label>Canonical URL<input type="url" value={value.canonicalUrl ?? ""} onChange={(event) => update("canonicalUrl", event.target.value)} />{fields.canonicalUrl && <small>{fields.canonicalUrl}</small>}</label>
      </section>
      <section className="admin-panel cms-mdx-panel" aria-labelledby="mdx-source"><h2 id="mdx-source">MDX source</h2><p>Markdown only. Imports and arbitrary components are blocked.</p><textarea aria-label="MDX article content" value={value.content} onChange={(event) => update("content", event.target.value)} />{fields.content && <small>{fields.content}</small>}</section>
      <section className="admin-panel cms-preview-panel" aria-labelledby="mdx-preview"><h2 id="mdx-preview">Live preview</h2><article className="article-body"><SafeArticleBody source={preview} /></article></section>
    </div>
    <div className="cms-editor-actions"><button type="button" onClick={() => void save("draft")} disabled={state === "SAVING"}>SAVE DRAFT</button><button type="button" onClick={() => void save()} disabled={state === "SAVING"}>SAVE CHANGES</button><button type="button" className="is-primary" onClick={() => void save("published")} disabled={state === "PUBLISHING"}>PUBLISH</button></div>
  </div>;
}

type ProjectValue = {
  id?: string; title: string; slug: string; summary: string; description: string; status: "draft" | "published" | "archived"; featured: boolean; sortOrder: number;
  versionLabel: string; role: string; timeline: string; projectType: string; stack: string[]; architecture: string[]; challenges: string[]; decisions: string[]; outcomes: string[];
  metrics: Array<{ label: string; value: string }>; region?: string | null; requests?: string | null; response?: string | null; repositoryUrl?: string | null; liveUrl?: string | null;
  seoTitle?: string | null; seoDescription?: string | null; version?: number;
};

const emptyProject: ProjectValue = { title: "", slug: "", summary: "", description: "", status: "draft", featured: false, sortOrder: 0, versionLabel: "v1.0.0", role: "Backend engineering", timeline: new Date().getUTCFullYear().toString(), projectType: "Backend", stack: ["Python"], architecture: ["Client", "API"], challenges: [], decisions: [], outcomes: [], metrics: [] };
const lines = (values: string[]) => values.join("\n");
const fromLines = (value: string) => value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);

export function ProjectEditor({ initial }: { initial?: ProjectValue }) {
  const router = useRouter();
  const [value, setValue] = useState(initial ?? emptyProject);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [dirty, setDirty] = useState(false);
  const [state, setState] = useState("READY");
  const [fields, setFields] = useState<Record<string, string>>({});
  useEffect(() => { const warn = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault(); }; window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn); }, [dirty]);
  function update<K extends keyof ProjectValue>(key: K, next: ProjectValue[K]) { setValue((current) => ({ ...current, [key]: next })); setDirty(true); }
  async function save(status?: ProjectValue["status"]) {
    setState(status === "published" ? "PUBLISHING" : "SAVING"); setFields({});
    try {
      const response = await fetch(initial?.id ? `/api/admin/projects/${initial.id}` : "/api/admin/projects", { method: initial?.id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...value, status: status ?? value.status }) });
      const body = await response.json() as { success: boolean; project?: ProjectValue; fields?: Record<string, string>; message?: string; code?: string };
      if (!response.ok || !body.project) { setFields(body.fields ?? {}); setState(body.code === "EDIT_CONFLICT" ? "CONFLICT — RELOAD" : body.message ?? "SAVE FAILED"); return; }
      setDirty(false); setState(body.project.status === "published" ? "PUBLISHED" : "SAVED"); setValue(body.project);
      if (!initial?.id && body.project.id) router.replace(`/admin/projects/${body.project.id}/edit`);
    } catch { setState("NETWORK ERROR — RETRY"); }
  }
  const listField = (label: string, key: "stack" | "architecture" | "challenges" | "decisions" | "outcomes") => <label>{label}<textarea rows={5} value={lines(value[key])} onChange={(event) => update(key, fromLines(event.target.value))} />{fields[key] && <small>{fields[key]}</small>}</label>;
  return <div className="cms-editor-shell"><div className="cms-editor-status" role="status"><span>VERSION {value.version ?? 1}</span><b>{state}</b></div><div className="cms-project-form">
    <section className="admin-panel cms-form-panel"><h2>Identity</h2><label>Title<input value={value.title} onChange={(event) => { const title = event.target.value; update("title", title); if (!slugTouched) update("slug", suggestedSlug(title)); }} />{fields.title && <small>{fields.title}</small>}</label><label>Slug<input value={value.slug} onChange={(event) => { setSlugTouched(true); update("slug", event.target.value); }} />{fields.slug && <small>{fields.slug}</small>}</label><label>Summary<textarea rows={3} value={value.summary} onChange={(event) => update("summary", event.target.value)} /></label><label>Description<textarea rows={5} value={value.description} onChange={(event) => update("description", event.target.value)} /></label><label>Project type<input value={value.projectType} onChange={(event) => update("projectType", event.target.value)} /></label></section>
    <section className="admin-panel cms-form-panel"><h2>Operations</h2><label>Status<select value={value.status} onChange={(event) => update("status", event.target.value as ProjectValue["status"])}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label><label>Sort order<input type="number" min="0" value={value.sortOrder} onChange={(event) => update("sortOrder", Number(event.target.value))} /></label><label>Version label<input value={value.versionLabel} onChange={(event) => update("versionLabel", event.target.value)} /></label><label>Role<input value={value.role} onChange={(event) => update("role", event.target.value)} /></label><label>Timeline<input value={value.timeline} onChange={(event) => update("timeline", event.target.value)} /></label><label className="cms-check"><input type="checkbox" checked={value.featured} onChange={(event) => update("featured", event.target.checked)} /> Featured project</label></section>
    <section className="admin-panel cms-form-panel"><h2>System design</h2>{listField("Stack — one per line", "stack")}{listField("Architecture — one per line", "architecture")}{listField("Challenges — one per line", "challenges")}</section>
    <section className="admin-panel cms-form-panel"><h2>Outcome</h2>{listField("Decisions — one per line", "decisions")}{listField("Outcomes — one per line", "outcomes")}<label>Region<input value={value.region ?? ""} onChange={(event) => update("region", event.target.value)} /></label><label>Requests label<input value={value.requests ?? ""} onChange={(event) => update("requests", event.target.value)} /></label></section>
    <section className="admin-panel cms-form-panel"><h2>Links and SEO</h2><label>Repository URL<input type="url" value={value.repositoryUrl ?? ""} onChange={(event) => update("repositoryUrl", event.target.value)} />{fields.repositoryUrl && <small>{fields.repositoryUrl}</small>}</label><label>Live URL<input type="url" value={value.liveUrl ?? ""} onChange={(event) => update("liveUrl", event.target.value)} />{fields.liveUrl && <small>{fields.liveUrl}</small>}</label><label>SEO title<input value={value.seoTitle ?? ""} onChange={(event) => update("seoTitle", event.target.value)} /></label><label>SEO description<textarea rows={3} value={value.seoDescription ?? ""} onChange={(event) => update("seoDescription", event.target.value)} /></label></section>
  </div><div className="cms-editor-actions"><button type="button" onClick={() => void save("draft")}>SAVE DRAFT</button><button type="button" onClick={() => void save()}>SAVE CHANGES</button><button type="button" className="is-primary" onClick={() => void save("published")}>PUBLISH</button></div></div>;
}
