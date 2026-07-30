"use client";

import { useState } from "react";

export function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return <button type="button" className="code-copy" onClick={async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }} aria-label="Copy code block">{copied ? "COPIED" : "COPY"}</button>;
}
