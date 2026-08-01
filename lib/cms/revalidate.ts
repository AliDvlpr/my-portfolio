import { revalidatePath } from "next/cache";

export function revalidateCmsRoutes(type: "post" | "project", slug?: string) {
  revalidatePath("/");
  if (type === "post") {
    revalidatePath("/blog");
    revalidatePath("/rss.xml");
    if (slug) revalidatePath(`/blog/${slug}`);
  } else {
    revalidatePath("/projects");
    if (slug) revalidatePath(`/projects/${slug}`);
  }
  revalidatePath("/sitemap.xml");
}
