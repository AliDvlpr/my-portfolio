import type { Metadata } from "next";
import { Breadcrumbs, PageHeader } from "@/app/PagePrimitives";
import { ObservabilityDashboard } from "../LabClient";

export const metadata: Metadata = {
  title: "Observability | Ali — Developer Lab",
  description: "Simulated metrics, traces, structured logs, and service health derived from the shared backend playground engine.",
  alternates: { canonical: "/lab/observability" },
};

export default function ObservabilityPage() {
  return <main className="route-page lab-route" id="main-content">
    <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Lab", href: "/lab" }, { label: "Observability" }]} />
    <PageHeader
      index="12"
      module="OBSERVABILITY"
      path="/lab/observability"
      title={<>Metrics, traces, and logs<br />from one shared simulation.</>}
      description="The observability route mirrors the same simulation state used by the API explorer and architecture presets, so traces, logs, and health stay internally consistent."
    />
    <ObservabilityDashboard />
  </main>;
}
