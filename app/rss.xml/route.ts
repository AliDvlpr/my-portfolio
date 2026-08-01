import { getPublishedBlogPosts } from "@/lib/cms/repository";
import { getServerEnv } from "@/lib/env";

export async function GET() {
  const base = getServerEnv().SITE_URL.replace(/\/$/, "");
  const posts = await getPublishedBlogPosts();
  const xml = `<?xml version="1.0" encoding="UTF-8" ?><rss version="2.0"><channel>
<title>Ali Mohammadi — Backend Engineering Notes</title><link>${escapeXml(`${base}/blog`)}</link>
<description>Production-minded notes on backend architecture and reliability.</description><language>en</language>
${posts.map((post) => `<item><title>${escapeXml(post.title)}</title><link>${escapeXml(`${base}/blog/${post.slug}`)}</link><guid>${escapeXml(`${base}/blog/${post.slug}`)}</guid><pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate><description>${escapeXml(post.description)}</description></item>`).join("")}
</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[character]!);
}
