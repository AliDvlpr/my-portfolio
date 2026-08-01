import { hasSameOrigin, requireAdminApi } from "@/lib/admin";
import { cmsErrorResponse } from "@/lib/cms/http";
import { importExistingContent } from "@/lib/cms/import";

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return Response.json({ success: false, code: "UNAUTHORIZED" }, { status: auth.status });
  if (!hasSameOrigin(request)) return Response.json({ success: false, code: "FORBIDDEN" }, { status: 403 });
  try { return Response.json({ success: true, ...(await importExistingContent()) }); }
  catch (error) { return cmsErrorResponse(error); }
}
