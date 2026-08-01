import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { SignInForm } from "./SignInForm";

export const metadata: Metadata = {
  title: "Admin Sign In | Ali Mohammadi",
  robots: { index: false, follow: false },
};

export default async function AdminSignInPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await getAdminSession();
  if (session) redirect("/admin");
  const params = await searchParams;
  return <main className="admin-auth-page route-page" id="main-content">
    <SignInForm />
    {params.error && <p className="admin-auth-footnote">The previous sign-in attempt could not be completed. Try again or use the alternate method if configured.</p>}
  </main>;
}
