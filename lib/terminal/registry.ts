import { getAllBlogPosts } from "@/lib/content";
import { projects } from "@/content/projects";
import { publicRoutes } from "@/lib/routes";
import { simulationStore } from "@/lib/simulation/store";
import type { TerminalCommandDefinition, TerminalCommandResult } from "./types";

function text(output: string, announce?: string): TerminalCommandResult {
  return { kind: "text", output, announce };
}

function navigation(output: string, href: string): TerminalCommandResult {
  return { kind: "navigation", output, href };
}

function action(output: string, run: () => void): TerminalCommandResult {
  return { kind: "action", output, run };
}

export const terminalCommands: TerminalCommandDefinition[] = [
  {
    name: "help",
    usage: "help [command]",
    description: "List available developer-console commands.",
    execute(parsed) {
      if (parsed.args[0]) {
        const match = findCommand(parsed.args[0]);
        return match
          ? text(`${match.name}\nusage: ${match.usage}\n${match.description}`)
          : text(`Unknown command "${parsed.args[0]}". Try: help`);
      }
      return text(terminalCommands.map((command) => `${command.name.padEnd(14, " ")} ${command.description}`).join("\n"));
    },
  },
  {
    name: "whoami",
    usage: "whoami",
    description: "Show the portfolio identity summary.",
    execute: () => text("Ali Mohammadi\nBackend Engineer\nFocus: APIs, Django/FastAPI systems, PostgreSQL, Redis, queues, observability"),
  },
  {
    name: "about",
    usage: "about",
    description: "Open the about route.",
    execute: () => navigation("Opening /about", "/about"),
  },
  {
    name: "projects",
    usage: "projects [--featured] [--tag FastAPI]",
    description: "List projects or jump to the registry.",
    execute(parsed) {
      const featuredOnly = parsed.flags.featured === true;
      const tag = typeof parsed.flags.tag === "string" ? String(parsed.flags.tag).toLowerCase() : "";
      const matched = projects.filter((project) => (!featuredOnly || project.featured) && (!tag || project.stack.some((item) => item.toLowerCase() === tag)));
      if (parsed.args[0] === "open") return navigation("Opening /projects", "/projects");
      return text(matched.map((project) => `${project.slug.padEnd(18, " ")} ${project.title} [${project.version}]`).join("\n") || "No projects matched the current filters.");
    },
  },
  {
    name: "project",
    aliases: ["open-project"],
    usage: "project <slug>",
    description: "Open a project case study.",
    execute(parsed) {
      const project = projects.find((entry) => entry.slug === parsed.args[0]);
      return project
        ? navigation(`Opening /projects/${project.slug}`, `/projects/${project.slug}`)
        : text(`Project "${parsed.args[0] ?? ""}" not found. Try: projects`);
    },
  },
  {
    name: "blog",
    usage: "blog",
    description: "Open the writing archive.",
    execute: () => navigation("Opening /blog", "/blog"),
  },
  {
    name: "read",
    usage: "read <slug>",
    description: "Open an article by slug.",
    execute(parsed) {
      const slug = parsed.args.join("-").toLowerCase();
      const post = getAllBlogPosts().find((entry) => entry.slug === slug || entry.title.toLowerCase() === parsed.args.join(" ").toLowerCase());
      return post ? navigation(`Opening /blog/${post.slug}`, `/blog/${post.slug}`) : text(`Article "${parsed.args.join(" ")}" not found.`);
    },
  },
  {
    name: "uses",
    usage: "uses",
    description: "Open the tooling route.",
    execute: () => navigation("Opening /uses", "/uses"),
  },
  {
    name: "resume",
    usage: "resume",
    description: "Open the resume route.",
    execute: () => navigation("Opening /resume", "/resume"),
  },
  {
    name: "contact",
    usage: "contact",
    description: "Open the contact route.",
    execute: () => navigation("Opening /contact", "/contact"),
  },
  {
    name: "api",
    usage: "api",
    description: "Open the API explorer.",
    execute: () => navigation("Opening /lab/api", "/lab/api"),
  },
  {
    name: "architecture",
    usage: "architecture",
    description: "Open the architecture playground.",
    execute: () => navigation("Opening /lab/architecture", "/lab/architecture"),
  },
  {
    name: "observability",
    aliases: ["metrics"],
    usage: "observability",
    description: "Open the observability dashboard.",
    execute: () => navigation("Opening /lab/observability", "/lab/observability"),
  },
  {
    name: "health",
    usage: "health",
    description: "Show the current simulated service health.",
    execute: () => {
      const state = simulationStore.getSnapshot();
      return text([
        "SERVICE           STATUS       LATENCY",
        ...state.services.map((service) => `${service.id.padEnd(16, " ")} ${service.status.padEnd(12, " ")} ${String(Math.round(service.latencyMs)).padStart(4, " ")}ms`),
      ].join("\n"));
    },
  },
  {
    name: "logs",
    usage: "logs [--level error]",
    description: "Show recent simulated logs.",
    execute(parsed) {
      const level = typeof parsed.flags.level === "string" ? String(parsed.flags.level).toUpperCase() : "";
      const logs = simulationStore.getSnapshot().logs.filter((entry) => !level || entry.level === level);
      return text(logs.slice(0, 8).map((entry) => `[${entry.level}] ${entry.service} ${entry.event}`).join("\n") || "No logs captured yet. Run a request first.");
    },
  },
  {
    name: "traces",
    usage: "traces",
    description: "Show recent trace summaries.",
    execute: () => {
      const traces = simulationStore.getSnapshot().traces;
      return text(traces.slice(0, 6).map((trace) => `${trace.traceId} ${trace.summary} ${trace.status} ${trace.totalDurationMs}ms`).join("\n") || "No traces captured yet. Run a request first.");
    },
  },
  {
    name: "simulate",
    usage: "simulate <scenario>",
    description: "Apply a simulation scenario such as cache-miss or slow-database.",
    execute(parsed) {
      const scenario = parsed.args[0];
      if (!scenario) return text("Usage: simulate <scenario>");
      return action(`Scenario set to ${scenario}`, () => simulationStore.setScenario(scenario as Parameters<typeof simulationStore.setScenario>[0]));
    },
  },
  {
    name: "reset",
    usage: "reset",
    description: "Reset the shared simulation state.",
    execute: () => action("Simulation reset to a stable baseline.", () => simulationStore.reset()),
  },
  {
    name: "terminal",
    usage: "terminal",
    description: "Open the full developer console.",
    execute: () => navigation("Opening /terminal", "/terminal"),
  },
  {
    name: "clear",
    usage: "clear",
    description: "Clear terminal output.",
    execute: () => text("__CLEAR__"),
  },
  {
    name: "routes",
    usage: "routes",
    description: "List the public route registry.",
    execute: () => text(publicRoutes.map((route) => `${route.href.padEnd(12, " ")} ${route.label}`).join("\n")),
  },
];

export function findCommand(name: string) {
  const value = name.toLowerCase();
  return terminalCommands.find((command) => command.name === value || command.aliases?.includes(value));
}

export function getTerminalCompletions(input: string) {
  const value = input.trim().toLowerCase();
  if (!value) return terminalCommands.map((command) => command.name);
  return terminalCommands
    .filter((command) => command.name.startsWith(value) || command.aliases?.some((alias) => alias.startsWith(value)))
    .map((command) => command.name);
}
