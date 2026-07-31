import Link from "next/link";

export function PageHeader({ index, module, path, title, description, children }: {
  index: string; module: string; path: string; title: React.ReactNode; description: string; children?: React.ReactNode;
}) {
  return <header className="route-page-header">
    <div className="route-context"><span>MODULE: {module}</span><span>PATH: {path}</span><b><i /> READY</b></div>
    <p>{index} / {module}</p>
    <h1>{title}</h1>
    <div className="route-page-intro"><p>{description}</p>{children}</div>
  </header>;
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return <nav className="breadcrumbs" aria-label="Breadcrumb">
    <ol>{items.map((item, index) => <li key={item.label}>{item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}{index < items.length - 1 && <b>/</b>}</li>)}</ol>
  </nav>;
}

export function SectionHeader({ label, title, copy }: { label: string; title: string; copy?: string }) {
  return <div className="route-section-header"><p>{label}</p><h2>{title}</h2>{copy && <span>{copy}</span>}</div>;
}
