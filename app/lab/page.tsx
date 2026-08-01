import type { Metadata } from "next";
import { PageHeader } from "../PagePrimitives";
import { LabIndex } from "./LabClient";

export const metadata: Metadata = {
  title: "Developer Lab | Ali — Interactive Backend Playground",
  description: "Explore simulated APIs, architecture presets, traces, logs, and observability using real portfolio content and safe backend simulations.",
  alternates: { canonical: "/lab" },
  openGraph: { title: "Developer Lab", description: "Interactive backend playground for architecture, APIs, traces, and logs.", url: "/lab", type: "website" },
};

export default function LabPage() {
  return <main className="route-page lab-route" id="main-content">
    <PageHeader
      index="09"
      module="DEVELOPER_LAB"
      path="/lab"
      title={<>Interactive backend<br />systems, safely exposed.</>}
      description="This environment simulates backend behavior using real portfolio content. Traffic, latency, traces, and service metrics are illustrative."
    />
    <LabIndex />
  </main>;
}
