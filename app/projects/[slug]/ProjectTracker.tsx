"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics-client";

export function ProjectTracker({ slug }: { slug: string }) {
  useEffect(() => { trackEvent("project_opened", { slug }); }, [slug]);
  return null;
}
