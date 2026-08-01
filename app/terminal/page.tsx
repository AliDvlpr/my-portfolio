import type { Metadata } from "next";
import { Breadcrumbs, PageHeader } from "../PagePrimitives";
import { TerminalConsole } from "../lab/LabClient";

export const metadata: Metadata = {
  title: "Terminal | Ali — Developer Console",
  description: "Sandboxed developer console for route navigation, service health, logs, traces, and simulation controls.",
  alternates: { canonical: "/terminal" },
};

export default function TerminalPage() {
  return <main className="route-page terminal-route" id="main-content">
    <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Terminal" }]} />
    <PageHeader
      index="13"
      module="TERMINAL"
      path="/terminal"
      title={<>A portfolio-wide console<br />with sandboxed commands.</>}
      description="Use the terminal to navigate routes, inspect health, list traces, review logs, and switch simulation scenarios without leaving the keyboard."
    />
    <TerminalConsole />
  </main>;
}
