import type { Metadata } from "next";
import { Breadcrumbs, PageHeader } from "@/app/PagePrimitives";
import { LabApiExplorer } from "../LabClient";

export const metadata: Metadata = {
  title: "API Explorer | Ali — Developer Lab",
  description: "Read-only simulated API explorer with request/response inspection, realistic timings, and trace-aware backend lifecycles.",
  alternates: { canonical: "/lab/api" },
};

export default function ApiLabPage() {
  return <main className="route-page lab-route" id="main-content">
    <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Lab", href: "/lab" }, { label: "API Explorer" }]} />
    <PageHeader
      index="10"
      module="API_EXPLORER"
      path="/lab/api"
      title={<>Inspect request contracts<br />without touching production.</>}
      description="Select an endpoint, modify safe parameters, and execute a traceable simulated request. Responses are generated from real portfolio content where practical."
    />
    <LabApiExplorer />
  </main>;
}
