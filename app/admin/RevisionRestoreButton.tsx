"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RevisionRestoreButton({ revisionId, version }: { revisionId: string; version: number }) {
  const router = useRouter(); const [busy, setBusy] = useState(false);
  async function restore() { if (!window.confirm("Restore this revision as a new current version?")) return; setBusy(true); const response = await fetch(`/api/admin/revisions/${revisionId}/restore`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ version }) }); setBusy(false); if (response.ok) router.refresh(); else window.alert(response.status === 409 ? "The content changed in another tab. Reload first." : "Restore failed."); }
  return <button type="button" onClick={() => void restore()} disabled={busy}>RESTORE</button>;
}
