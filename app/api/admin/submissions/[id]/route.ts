import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { adminAudit, contactSubmissions } from "@/db/schema";
import { hasSameOrigin, requireAdminApi } from "@/lib/admin";
import { logServerEvent } from "@/lib/logger";

const mutationSchema = z.object({ status: z.enum(["new", "read", "replied", "archived", "spam"]) }).strict();

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return Response.json({ success: false, message: "Unauthorized" }, { status: auth.status });
  if (!hasSameOrigin(request)) return Response.json({ success: false, message: "Origin check failed" }, { status: 403 });
  const input = mutationSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return Response.json({ success: false, message: "Invalid status" }, { status: 400 });
  const id = (await params).id;
  const db = getDb();
  const now = new Date().toISOString();
  const [updated] = await db.update(contactSubmissions).set({ status: input.data.status, updatedAt: now }).where(eq(contactSubmissions.id, id)).returning({ id: contactSubmissions.id });
  if (!updated) return Response.json({ success: false, message: "Not found" }, { status: 404 });
  const action = input.data.status === "archived" ? "submission.archived" : input.data.status === "spam" ? "submission.marked_spam" : "submission.status_changed";
  await db.insert(adminAudit).values({ id: crypto.randomUUID(), action, entityType: "contact_submission", entityId: id, actor: auth.user.email, metadata: JSON.stringify({ status: input.data.status }), createdAt: now });
  logServerEvent({ event: "admin.action", action, entityId: id });
  return Response.json({ success: true, status: input.data.status });
}
