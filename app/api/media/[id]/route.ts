import { getMediaObject } from "@/lib/cms/media";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await getMediaObject((await params).id);
  if (!result) return new Response("Not found", { status: 404 });
  const headers = new Headers();
  result.object.writeHttpMetadata(headers);
  headers.set("etag", result.object.httpEtag);
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(result.object.body, { headers });
}
