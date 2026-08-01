"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ContentActions({ type, id, slug, status, editHref, previewHref }: { type: "posts" | "projects"; id: string; slug: string; status: string; editHref: string; previewHref: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function remove() {
    if (!window.confirm(`Permanently delete ${slug}? This cannot be undone.`)) return;
    const typed = window.prompt(`Type ${slug} to confirm permanent deletion.`);
    if (typed !== slug) return;
    setBusy(true);
    const response = await fetch(`/api/admin/${type}/${id}`, { method: "DELETE" });
    setBusy(false);
    if (response.ok) router.refresh(); else window.alert("Delete failed. Archive the content or try again.");
  }
  async function action(value: "publish" | "unpublish" | "archive" | "duplicate" | "feature" | "unfeature") { setBusy(true); const response = await fetch("/api/admin/content-action", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entityType: type === "posts" ? "post" : "project", entityId: id, action: value }) }); setBusy(false); if (response.ok) router.refresh(); else window.alert("Content action failed."); }
  return <div className="cms-row-actions"><a href={editHref}>EDIT</a><a href={previewHref}>PREVIEW</a>{status === "published" ? <button type="button" onClick={() => void action("unpublish")} disabled={busy}>UNPUBLISH</button> : <button type="button" onClick={() => void action("publish")} disabled={busy}>PUBLISH</button>}<button type="button" onClick={() => void action("duplicate")} disabled={busy}>DUPLICATE</button><button type="button" onClick={() => void action("archive")} disabled={busy}>ARCHIVE</button>{type === "projects" && <button type="button" onClick={() => void action("feature")} disabled={busy}>FEATURE</button>}<button type="button" onClick={() => void remove()} disabled={busy}>DELETE</button></div>;
}
