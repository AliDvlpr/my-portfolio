import { hasSameOrigin, requireAdminApi } from "@/lib/admin";
import { cmsErrorResponse } from "@/lib/cms/http";
import { deleteContent, savePost } from "@/lib/cms/repository";
import { revalidateCmsRoutes } from "@/lib/cms/revalidate";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return Response.json({ success: false, code: "UNAUTHORIZED" }, { status: auth.status });
  if (!hasSameOrigin(request)) return Response.json({ success: false, code: "FORBIDDEN" }, { status: 403 });
  try {
    const post = await savePost(await request.json(), auth.user.email, (await params).id);
    if (!post) return Response.json({ success: false, code: "NOT_FOUND" }, { status: 404 });
    revalidateCmsRoutes("post", post.slug);
    return Response.json({ success: true, post });
  } catch (error) { return cmsErrorResponse(error); }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return Response.json({ success: false, code: "UNAUTHORIZED" }, { status: auth.status });
  if (!hasSameOrigin(request)) return Response.json({ success: false, code: "FORBIDDEN" }, { status: 403 });
  await deleteContent("post", (await params).id, auth.user.email);
  revalidateCmsRoutes("post");
  return Response.json({ success: true });
}
