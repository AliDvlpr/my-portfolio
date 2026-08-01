import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/auth";
import { AdminNav } from "../../AdminNav";
import { ProjectEditor } from "../../ContentEditor";
export const metadata: Metadata = { title: "New Project | AliDvlpr CMS", robots: { index: false, follow: false } };
export default async function NewProjectPage() { const session = await requireAdminSession(); return <main className="admin-page" id="main-content"><AdminNav email={session.user.email} /><section className="admin-heading"><p>CONTENT / NEW PROJECT</p><h1>Create project.</h1></section><ProjectEditor /></main>; }
