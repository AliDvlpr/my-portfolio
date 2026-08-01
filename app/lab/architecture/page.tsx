import type { Metadata } from "next";
import { Breadcrumbs, PageHeader } from "@/app/PagePrimitives";
import { ArchitecturePlayground } from "../LabClient";

export const metadata: Metadata = {
  title: "Architecture Playground | Ali — Developer Lab",
  description: "Curated backend architecture presets with request paths, failure scenarios, and service responsibilities.",
  alternates: { canonical: "/lab/architecture" },
};

export default function ArchitectureLabPage() {
  return <main className="route-page lab-route" id="main-content">
    <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Lab", href: "/lab" }, { label: "Architecture Playground" }]} />
    <PageHeader
      index="11"
      module="ARCHITECTURE_PLAYGROUND"
      path="/lab/architecture"
      title={<>Follow the request path<br />through explicit boundaries.</>}
      description="Presets stay curated so each request, cache fallback, and failure scenario remains easy to inspect. Use the playground to compare stable and degraded flows."
    />
    <ArchitecturePlayground />
  </main>;
}
