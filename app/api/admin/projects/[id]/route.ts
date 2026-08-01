import { hasSameOrigin, requireAdminApi } from "@/lib/admin";
import { cmsErrorResponse } from "@/lib/cms/http";
import { deleteContent, saveProject } from "@/lib/cms/repository";
import { revalidateCmsRoutes } from "@/lib/cms/revalidate";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return Response.json({ success: false, code: "UNAUTHORIZED" }, { status: auth.status });
  if (!hasSameOrigin(request)) return Response.json({ success: false, code: "FORBIDDEN" }, { status: 403 });
  try {
    const project = await saveProject(await request.json(), auth.user.email, (await params).id);
    if (!project) return Response.json({ success: false, code: "NOT_FOUND" }, { status: 404 });
    revalidateCmsRoutes("project", project.slug);
    return Response.json({ success: true, project });
  } catch (error) { return cmsErrorResponse(error); }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return Response.json({ success: false, code: "UNAUTHORIZED" }, { status: auth.status });
  if (!hasSameOrigin(request)) return Response.json({ success: false, code: "FORBIDDEN" }, { status: 403 });
  await deleteContent("project", (await params).id, auth.user.email);
  revalidateCmsRoutes("project");
  return Response.json({ success: true });
}
