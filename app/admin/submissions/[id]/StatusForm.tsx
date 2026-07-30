"use client";

import { useState } from "react";

const statuses = ["new", "read", "replied", "archived", "spam"] as const;

export function StatusForm({ id, initialStatus }: { id: string; initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [message, setMessage] = useState("");
  return <form className="admin-status-form" onSubmit={async (event) => {
    event.preventDefault();
    setMessage("UPDATING...");
    const response = await fetch(`/api/admin/submissions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    setMessage(response.ok ? "STATUS UPDATED" : "UPDATE FAILED");
  }}>
    <label>STATUS<select value={status} onChange={(event) => setStatus(event.target.value)}>{statuses.map((value) => <option key={value}>{value}</option>)}</select></label>
    <button type="submit">APPLY CHANGE</button><span role="status">{message}</span>
  </form>;
}
