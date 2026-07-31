"use client";

import { trackEvent } from "@/lib/analytics-client";

export function ResumeDownload() {
  return <a href="/Ali-Mohammadi-Backend-Engineer-Resume.pdf" download onClick={() => trackEvent("resume_downloaded", { source: "resume_route" })}>DOWNLOAD PDF</a>;
}
