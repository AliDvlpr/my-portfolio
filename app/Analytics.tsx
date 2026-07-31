"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics-client";

export function Analytics() {
  useEffect(() => {
    trackEvent("page_view");
  }, []);
  return null;
}
