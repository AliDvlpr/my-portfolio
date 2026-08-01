import { hasSameOrigin, requireAdminApi } from "@/lib/admin";
import { cmsErrorResponse } from "@/lib/cms/http";
import { restoreRevision } from "@/lib/cms/repository";
import { revisionRestoreSchema } from "@/lib/cms/schemas";
import { revalidateCmsRoutes } from "@/lib/cms/revalidate";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return Response.json({ success: false, code: "UNAUTHORIZED" }, { status: auth.status });
  if (!hasSameOrigin(request)) return Response.json({ success: false, code: "FORBIDDEN" }, { status: 403 });
  try {
    const input = revisionRestoreSchema.parse({ ...(await request.json()), revisionId: (await params).id });
    const restored = await restoreRevision(input.revisionId, input.version, auth.user.email);
    if (!restored) return Response.json({ success: false, code: "NOT_FOUND" }, { status: 404 });
    revalidateCmsRoutes(restored.entityType);
    return Response.json({ success: true, restored });
  } catch (error) { return cmsErrorResponse(error); }
}
