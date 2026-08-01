import { hasSameOrigin, requireAdminApi } from "@/lib/admin";
import { cmsErrorResponse } from "@/lib/cms/http";
import { uploadMedia } from "@/lib/cms/media";

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return Response.json({ success: false, code: "UNAUTHORIZED" }, { status: auth.status });
  if (!hasSameOrigin(request)) return Response.json({ success: false, code: "FORBIDDEN" }, { status: 403 });
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return Response.json({ success: false, code: "VALIDATION_ERROR", message: "Select an image." }, { status: 422 });
    const asset = await uploadMedia(file, String(form.get("altText") ?? ""), auth.user.email);
    return Response.json({ success: true, asset }, { status: 201 });
  } catch (error) { return cmsErrorResponse(error); }
}
