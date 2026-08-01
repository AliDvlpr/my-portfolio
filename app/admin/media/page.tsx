import type { Metadata } from "next";
import Image from "next/image";
import { requireAdminSession } from "@/lib/auth";
import { listMedia } from "@/lib/cms/repository";
import { AdminNav } from "../AdminNav";
import { MediaManager } from "../MediaManager";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Media | AliDvlpr CMS", robots: { index: false, follow: false } };
export default async function AdminMediaPage() { const session = await requireAdminSession(); let assets: Awaited<ReturnType<typeof listMedia>> = []; let unavailable = false; try { assets = await listMedia(); } catch { unavailable = true; } return <main className="admin-page" id="main-content"><AdminNav email={session.user.email} /><section className="admin-heading"><p>CONTENT / MEDIA</p><h1>Media library.</h1><span>JPEG / PNG / WEBP / AVIF · MAX 8 MB</span></section><MediaManager /><section className="admin-panel"><div className="admin-panel-head"><h2>Assets</h2><span>{assets.length} FILES</span></div>{unavailable ? <div className="admin-empty-state"><strong>Media storage unavailable</strong><p>Apply the CMS migration and configure the MEDIA R2 binding.</p></div> : assets.length ? <div className="cms-media-grid">{assets.map((asset) => <article key={asset.id}><Image src={asset.url} alt={asset.altText} width={asset.width ?? 960} height={asset.height ?? 600} unoptimized /><b>{asset.filename}</b><span>{asset.mimeType} · {Math.ceil(asset.size / 1024)} KB</span><p>{asset.altText}</p><code>{asset.url}</code></article>)}</div> : <div className="admin-empty-state"><strong>No media uploaded</strong><p>Upload an editorial image with meaningful alt text.</p></div>}</section></main>; }
