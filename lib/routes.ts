export type PublicRoute = {
  href: string;
  label: string;
  command: string;
  module: string;
};

export const publicRoutes: PublicRoute[] = [
  { href: "/", label: "Home", command: "go home", module: "overview" },
  { href: "/about", label: "About", command: "open about", module: "profile" },
  { href: "/projects", label: "Projects", command: "list projects", module: "project-registry" },
  { href: "/blog", label: "Blog", command: "read blog", module: "engineering-notes" },
  { href: "/lab", label: "Lab", command: "open lab", module: "developer-lab" },
  { href: "/uses", label: "Uses", command: "open uses", module: "toolbox" },
  { href: "/resume", label: "Resume", command: "view resume", module: "resume" },
  { href: "/contact", label: "Contact", command: "contact", module: "contact-gateway" },
];

export function routeIsActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function moduleForPath(pathname: string) {
  return publicRoutes.find((route) => routeIsActive(pathname, route.href))?.module ?? "unregistered";
}
