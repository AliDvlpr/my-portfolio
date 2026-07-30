import { processContactSubmission } from "@/lib/contact-service";
import { createProductionContactDependencies } from "@/lib/contact-production";
import { logServerError, logServerEvent } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const started = Date.now();
  const requestIdHint = `contact_${crypto.randomUUID().replaceAll("-", "")}`;
  logServerEvent({ event: "contact.request_received", requestId: requestIdHint });
  try {
    if (!request.headers.get("content-type")?.includes("application/json")) {
      return Response.json({ success: false, code: "VALIDATION_ERROR", message: "Expected a JSON request." }, { status: 415 });
    }
    let input: unknown;
    try {
      input = await request.json();
    } catch {
      return Response.json({ success: false, code: "VALIDATION_ERROR", message: "Request body is not valid JSON." }, { status: 400 });
    }
    const source = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const outcome = await processContactSubmission(input, source, createProductionContactDependencies());
    const event = outcome.success ? "contact.email_sent" :
      outcome.code === "VALIDATION_ERROR" ? "contact.validation_failed" :
      outcome.code === "VERIFICATION_ERROR" ? "contact.turnstile_failed" :
      outcome.code === "RATE_LIMITED" ? "contact.rate_limited" :
      outcome.code === "EMAIL_DELIVERY_FAILED" ? "contact.email_failed" : "contact.rejected";
    logServerEvent({ event, requestId: outcome.requestId ?? requestIdHint, code: outcome.success ? undefined : outcome.code, durationMs: Date.now() - started });
    const headers = new Headers({ "Cache-Control": "no-store" });
    if (!outcome.success && outcome.retryAfter) headers.set("Retry-After", String(outcome.retryAfter));
    return Response.json(outcome, { status: outcome.status, headers });
  } catch {
    logServerError({ event: "contact.server_error", requestId: requestIdHint, durationMs: Date.now() - started });
    return Response.json({ success: false, code: "SERVER_ERROR", message: "The contact service is temporarily unavailable.", requestId: requestIdHint }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
