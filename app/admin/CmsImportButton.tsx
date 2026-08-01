"use client";

import { useState } from "react";

export function CmsImportButton() {
  const [status, setStatus] = useState("");
  async function run() {
    setStatus("IMPORTING…");
    try {
      const response = await fetch("/api/admin/cms-import", { method: "POST" });
      const body = await response.json() as { success: boolean; postsImported?: number; projectsImported?: number; message?: string };
      setStatus(body.success ? `IMPORTED ${body.postsImported} POSTS / ${body.projectsImported} PROJECTS` : body.message ?? "IMPORT FAILED");
      if (body.success) window.location.reload();
    } catch { setStatus("IMPORT FAILED"); }
  }
  return <div className="cms-import-control"><button type="button" onClick={run} disabled={status === "IMPORTING…"}>IMPORT EXISTING CONTENT</button><span role="status">{status}</span></div>;
}
