import { hasSameOrigin, requireAdminApi } from "@/lib/admin";
import { cmsErrorResponse } from "@/lib/cms/http";
import { saveProject } from "@/lib/cms/repository";
import { revalidateCmsRoutes } from "@/lib/cms/revalidate";

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return Response.json({ success: false, code: "UNAUTHORIZED" }, { status: auth.status });
  if (!hasSameOrigin(request)) return Response.json({ success: false, code: "FORBIDDEN" }, { status: 403 });
  try {
    const project = await saveProject(await request.json(), auth.user.email);
    revalidateCmsRoutes("project", project?.slug);
    return Response.json({ success: true, project }, { status: 201 });
  } catch (error) { return cmsErrorResponse(error); }
}
