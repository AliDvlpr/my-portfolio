"use client";

import { trackEvent } from "@/lib/analytics-client";

export function PrintButton() {
  return <button type="button" className="resume-print" onClick={() => { trackEvent("resume_downloaded", { source: "resume_page" }); window.print(); }}>PRINT / SAVE AS PDF</button>;
}
