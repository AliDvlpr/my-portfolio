"use client";

import { useState } from "react";

export function MediaManager() {
  const [status, setStatus] = useState("");
  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStatus("UPLOADING…");
    try {
      const response = await fetch("/api/admin/media", { method: "POST", body: new FormData(event.currentTarget) });
      const body = await response.json() as { success: boolean; message?: string };
      setStatus(body.success ? "UPLOADED" : body.message ?? "UPLOAD FAILED");
      if (body.success) window.location.reload();
    } catch { setStatus("NETWORK ERROR"); }
  }
  return <form className="admin-panel cms-media-upload" onSubmit={upload}><div className="admin-panel-head"><h2>Upload image</h2><span>R2 OBJECT STORAGE</span></div><label>Image<input name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required /></label><label>Alt text<input name="altText" minLength={3} maxLength={240} required /></label><button type="submit">UPLOAD MEDIA</button><p role="status">{status}</p></form>;
}
