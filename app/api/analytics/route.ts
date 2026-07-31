import { analyticsEvents } from "@/db/schema";
import { getDb } from "@/db";
import { getServerEnv } from "@/lib/env";
import { logServerError } from "@/lib/logger";

const allowedEvents = new Set([
  "page_view", "project_opened", "article_opened", "resume_downloaded",
  "contact_started", "contact_submitted", "contact_failed",
  "command_palette_opened", "terminal_command_used",
]);

export async function POST(request: Request) {
  try {
    if (getServerEnv().ANALYTICS_ENABLED !== "true") return new Response(null, { status: 204 });
    const input = await request.json() as { event?: string; path?: string; metadata?: Record<string, unknown> };
    if (!input.event || !allowedEvents.has(input.event) || typeof input.path !== "string" || input.path.length > 300) {
      return Response.json({ success: false }, { status: 400 });
    }
    const safeMetadata = Object.fromEntries(Object.entries(input.metadata ?? {}).filter(([key, value]) =>
      ["code", "requestId", "slug", "source"].includes(key) && typeof value === "string" && value.length <= 120
    ));
    await getDb().insert(analyticsEvents).values({
      id: crypto.randomUUID(),
      event: input.event,
      path: input.path,
      metadata: Object.keys(safeMetadata).length ? JSON.stringify(safeMetadata) : null,
      createdAt: new Date().toISOString(),
    });
    return new Response(null, { status: 204 });
  } catch {
    logServerError({ event: "analytics.write_failed" });
    return new Response(null, { status: 204 });
  }
}
