export const experience = [
  {
    period: "2025—NOW",
    role: "Senior Backend Engineer",
    company: "QCode",
    detail: "Leading backend architecture across education, health, and commerce products. Designing APIs, optimizing data paths, and integrating third-party services.",
    tech: ["FastAPI", "PostgreSQL", "Redis"],
    stage: "ARCHITECTURE",
  },
  {
    period: "2024—NOW",
    role: "Founder",
    company: "Code Gap",
    detail: "Building a developer community around practical engineering, collaborative software projects, and educational events.",
    tech: ["Community", "Education", "Events"],
    stage: "LEADERSHIP",
  },
  {
    period: "2023—NOW",
    role: "Freelance Web Developer",
    company: "Independent",
    detail: "Delivering reliable backend systems for product teams, including investment and commerce platforms.",
    tech: ["Django", "DRF", "System design"],
    stage: "DELIVERY",
  },
  {
    period: "2019—2025",
    role: "Backend Developer → Team Lead",
    company: "Alborz Institute",
    detail: "Progressed from implementation into technical leadership, CRM delivery, developer mentoring, and full-stack teaching.",
    tech: ["Python", "JavaScript", "Go", "Docker"],
    stage: "IMPLEMENTATION",
  },
] as const;

export const principles = [
  ["Design for change", "Architecture should make the next version easier, not harder."],
  ["Make failure visible", "Observability and explicit failure paths are part of the product."],
  ["Keep it understandable", "A dependable system is one a team can confidently evolve."],
  ["Measure before optimizing", "Performance work begins with evidence, budgets, and clear tradeoffs."],
] as const;

export const profileFacts = {
  location: "Baku",
  focus: "Backend architecture",
  experience: "5+ years",
  currentLearning: ["Distributed systems", "Go services", "Operational design"],
};
