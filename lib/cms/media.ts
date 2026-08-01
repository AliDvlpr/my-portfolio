import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { adminAudit, blogPosts, cmsProjects, mediaAssets } from "@/db/schema";
import { MAX_MEDIA_BYTES, allowedMediaTypes, mediaMetadataSchema } from "./schemas";
import { MediaValidationError } from "./errors";

type MediaObject = { body: ReadableStream; httpEtag: string; writeHttpMetadata(headers: Headers): void };
type MediaBucket = {
  put(key: string, value: Uint8Array, options: { httpMetadata: { contentType: string; cacheControl: string }; customMetadata: Record<string, string> }): Promise<unknown>;
  get(key: string): Promise<MediaObject | null>;
  delete(key: string): Promise<void>;
};

function getBucket() {
  const bucket = (env as typeof env & { MEDIA?: MediaBucket }).MEDIA;
  if (!bucket) throw new Error("R2 media binding is unavailable.");
  return bucket;
}

function matchesSignature(type: string, bytes: Uint8Array) {
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if (type === "image/webp") return new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
  if (type === "image/avif") return new TextDecoder().decode(bytes.slice(4, 12)).includes("ftypavif");
  return false;
}

export async function uploadMedia(file: File, altText: string, actor: string) {
  const metadata = mediaMetadataSchema.parse({ altText });
  if (!allowedMediaTypes.has(file.type)) throw new MediaValidationError("Unsupported image type.");
  if (file.size <= 0 || file.size > MAX_MEDIA_BYTES) throw new MediaValidationError("Image must be smaller than 8 MB.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!matchesSignature(file.type, bytes)) throw new MediaValidationError("File contents do not match the declared image type.");
  const extension = ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" } as const)[file.type as "image/jpeg" | "image/png" | "image/webp" | "image/avif"];
  const assetId = `media_${crypto.randomUUID()}`;
  const storageKey = `cms/${new Date().toISOString().slice(0, 10)}/${assetId}.${extension}`;
  await getBucket().put(storageKey, bytes, { httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" }, customMetadata: { uploadedBy: actor } });
  const timestamp = new Date().toISOString();
  const db = getDb();
  await db.batch([
    db.insert(mediaAssets).values({ id: assetId, storageKey, url: `/api/media/${assetId}`, filename: file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 160), mimeType: file.type, size: file.size, altText: metadata.altText, createdAt: timestamp, createdBy: actor }),
    db.insert(adminAudit).values({ id: `audit_${crypto.randomUUID()}`, action: "media.uploaded", entityType: "media", entityId: assetId, actor, metadata: JSON.stringify({ mimeType: file.type, size: file.size }), createdAt: timestamp }),
  ]);
  return db.select().from(mediaAssets).where(eq(mediaAssets.id, assetId)).limit(1).then((rows) => rows[0]);
}

export async function deleteMedia(assetId: string, actor: string) {
  const db = getDb();
  const [asset] = await db.select().from(mediaAssets).where(eq(mediaAssets.id, assetId)).limit(1);
  if (!asset) return { found: false as const, references: [] };
  const [postRefs, projectRefs] = await Promise.all([
    db.select({ id: blogPosts.id, title: blogPosts.title }).from(blogPosts).where(eq(blogPosts.coverImageId, assetId)),
    db.select({ id: cmsProjects.id, title: cmsProjects.title }).from(cmsProjects).where(eq(cmsProjects.coverImageId, assetId)),
  ]);
  const references = [...postRefs.map((item) => ({ type: "post", ...item })), ...projectRefs.map((item) => ({ type: "project", ...item }))];
  if (references.length) return { found: true as const, deleted: false as const, references };
  await getBucket().delete(asset.storageKey);
  const timestamp = new Date().toISOString();
  await db.batch([
    db.delete(mediaAssets).where(eq(mediaAssets.id, assetId)),
    db.insert(adminAudit).values({ id: `audit_${crypto.randomUUID()}`, action: "media.deleted", entityType: "media", entityId: assetId, actor, metadata: null, createdAt: timestamp }),
  ]);
  return { found: true as const, deleted: true as const, references: [] };
}

export async function getMediaObject(assetId: string) {
  const [asset] = await getDb().select().from(mediaAssets).where(eq(mediaAssets.id, assetId)).limit(1);
  if (!asset) return null;
  const object = await getBucket().get(asset.storageKey);
  return object ? { asset, object } : null;
}
