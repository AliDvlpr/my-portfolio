export function trackEvent(event: string, data: Record<string, string | undefined> = {}) {
  const payload = JSON.stringify({ event, path: data.path ?? window.location.pathname, metadata: data });
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics", new Blob([payload], { type: "application/json" }));
    return;
  }
  void fetch("/api/analytics", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true }).catch(() => undefined);
}
