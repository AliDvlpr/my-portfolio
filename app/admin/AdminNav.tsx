import Link from "next/link";

export function AdminNav({ email }: { email: string }) {
  return <header className="admin-nav">
    <Link href="/admin">ALIDVLPR / CMS</Link>
    <nav aria-label="Admin navigation">
      <Link href="/admin/posts">POSTS</Link><Link href="/admin/projects">PROJECTS</Link><Link href="/admin/media">MEDIA</Link><Link href="/admin/audit">AUDIT</Link>
    </nav>
    <div><span>{email}</span><form action="/api/admin/logout" method="post"><button type="submit">SIGN OUT</button></form></div>
  </header>;
}
