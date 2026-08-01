import { hasSameOrigin, requireAdminApi } from "@/lib/admin";
import { cmsErrorResponse } from "@/lib/cms/http";
import { reorderProjects } from "@/lib/cms/repository";
import { orderingInputSchema } from "@/lib/cms/schemas";
import { revalidateCmsRoutes } from "@/lib/cms/revalidate";

export async function POST(request: Request) { const auth = await requireAdminApi(); if (!auth.authorized) return Response.json({ success: false }, { status: auth.status }); if (!hasSameOrigin(request)) return Response.json({ success: false }, { status: 403 }); try { const input = orderingInputSchema.parse(await request.json()); await reorderProjects(input.items, auth.user.email); revalidateCmsRoutes("project"); return Response.json({ success: true }); } catch (error) { return cmsErrorResponse(error); } }
