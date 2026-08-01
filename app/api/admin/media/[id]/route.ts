import { hasSameOrigin, requireAdminApi } from "@/lib/admin";
import { deleteMedia } from "@/lib/cms/media";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return Response.json({ success: false, code: "UNAUTHORIZED" }, { status: auth.status });
  if (!hasSameOrigin(request)) return Response.json({ success: false, code: "FORBIDDEN" }, { status: 403 });
  const result = await deleteMedia((await params).id, auth.user.email);
  if (!result.found) return Response.json({ success: false, code: "NOT_FOUND" }, { status: 404 });
  if (!result.deleted) return Response.json({ success: false, code: "MEDIA_IN_USE", references: result.references }, { status: 409 });
  return Response.json({ success: true });
}
