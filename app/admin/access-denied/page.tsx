import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Access Denied | Ali Mohammadi",
  robots: { index: false, follow: false },
};

export default function AdminAccessDeniedPage() {
  return <main className="admin-denied" id="main-content">
    <p>403 / ACCESS DENIED</p>
    <h1>This admin surface is restricted to the approved owner account.</h1>
    <span>Use the authorized Google account or return to the public portfolio.</span>
    <div className="state-actions"><Link href="/admin/sign-in">TRY AGAIN</Link><Link href="/">RETURN HOME</Link></div>
  </main>;
}
