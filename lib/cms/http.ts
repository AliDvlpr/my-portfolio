import { ZodError } from "zod";
import { ContentConflictError, DuplicateSlugError } from "./repository";
import { MediaValidationError } from "./errors";

export function cmsErrorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return Response.json({ success: false, code: "VALIDATION_ERROR", message: "Review the highlighted fields.", fields: Object.fromEntries(error.issues.map((issue) => [issue.path.join("."), issue.message])) }, { status: 422 });
  }
  if (error instanceof DuplicateSlugError) return Response.json({ success: false, code: "DUPLICATE_SLUG", message: error.message, fields: { slug: error.message } }, { status: 409 });
  if (error instanceof ContentConflictError) return Response.json({ success: false, code: "EDIT_CONFLICT", message: error.message }, { status: 409 });
  if (error instanceof Error && /content_revisions_entity_version_unique|UNIQUE constraint failed: content_revisions/i.test(error.message)) return Response.json({ success: false, code: "EDIT_CONFLICT", message: "This content was modified in another tab." }, { status: 409 });
  if (error instanceof MediaValidationError) return Response.json({ success: false, code: "MEDIA_VALIDATION_ERROR", message: error.message }, { status: 422 });
  console.error(JSON.stringify({ event: "cms.mutation_failed", timestamp: new Date().toISOString(), error: error instanceof Error ? error.name : "unknown" }));
  return Response.json({ success: false, code: "SERVER_ERROR", message: "The content operation could not be completed." }, { status: 500 });
}
