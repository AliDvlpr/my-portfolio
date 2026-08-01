import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/auth";
import { AdminNav } from "../../AdminNav";
import { PostEditor } from "../../ContentEditor";

export const metadata: Metadata = { title: "New Post | AliDvlpr CMS", robots: { index: false, follow: false } };
export default async function NewPostPage() { const session = await requireAdminSession(); return <main className="admin-page" id="main-content"><AdminNav email={session.user.email} /><section className="admin-heading"><p>CONTENT / NEW POST</p><h1>Create article.</h1></section><PostEditor /></main>; }
