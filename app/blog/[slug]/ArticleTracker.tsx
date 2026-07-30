"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics-client";

export function ArticleTracker({ slug }: { slug: string }) {
  useEffect(() => { trackEvent("article_opened", { slug }); }, [slug]);
  return null;
}
