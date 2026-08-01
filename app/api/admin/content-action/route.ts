import { z } from "zod";
import { hasSameOrigin, requireAdminApi } from "@/lib/admin";
import { cmsErrorResponse } from "@/lib/cms/http";
import { applyContentAction } from "@/lib/cms/repository";
import { revalidateCmsRoutes } from "@/lib/cms/revalidate";
const schema = z.object({ entityType: z.enum(["post", "project"]), entityId: z.string().min(1), action: z.enum(["publish", "unpublish", "archive", "duplicate", "feature", "unfeature"]) }).strict();
export async function POST(request: Request) { const auth = await requireAdminApi(); if (!auth.authorized) return Response.json({ success: false }, { status: auth.status }); if (!hasSameOrigin(request)) return Response.json({ success: false }, { status: 403 }); try { const input = schema.parse(await request.json()); const record = await applyContentAction(input.entityType, input.entityId, input.action, auth.user.email); if (!record) return Response.json({ success: false }, { status: 404 }); revalidateCmsRoutes(input.entityType, record.slug); return Response.json({ success: true, record }); } catch (error) { return cmsErrorResponse(error); } }
