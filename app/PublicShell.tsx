"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { publicRoutes, routeIsActive } from "@/lib/routes";
import { SystemChrome } from "./SystemExperience";
import { trackEvent } from "@/lib/analytics-client";

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    trackEvent("route_viewed", { path: pathname });
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    document.body.style.overflow = "hidden";
    const focusable = menu.current?.querySelectorAll<HTMLElement>("a,button");
    focusable?.[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        trigger.current?.focus();
      }
      if (event.key === "Tab" && focusable?.length) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  if (["/admin", "/signin-with-chatgpt", "/signout-with-chatgpt", "/callback"].some((path) => pathname.startsWith(path))) return <>{children}</>;

  return <>
    <SystemChrome />
    <header className="global-nav">
      <Link className="global-brand" href="/" aria-label="AliDvlpr home">ALI<span>DVLPR</span></Link>
      <nav aria-label="Primary navigation">
        {publicRoutes.map((route) => <Link
          aria-current={routeIsActive(pathname, route.href) ? "page" : undefined}
          href={route.href}
          key={route.href}
          onClick={() => trackEvent("navigation_used", { destination: route.href })}
        >/{route.label.toUpperCase()}</Link>)}
      </nav>
      <div className="global-status"><i /> SYSTEM: ONLINE</div>
      <button ref={trigger} className="mobile-menu-trigger" aria-expanded={menuOpen} aria-controls="mobile-route-menu" onClick={() => setMenuOpen(true)}>
        MENU <span>ROUTES</span>
      </button>
    </header>
    {menuOpen && <div className="mobile-route-backdrop" onMouseDown={() => setMenuOpen(false)}>
      <div ref={menu} id="mobile-route-menu" className="mobile-route-menu" role="dialog" aria-modal="true" aria-label="Route menu" onMouseDown={(event) => event.stopPropagation()}>
        <div><span>ROUTE INDEX</span><button onClick={() => { setMenuOpen(false); trigger.current?.focus(); }}>CLOSE [ESC]</button></div>
        {publicRoutes.map((route, index) => <Link onClick={() => setMenuOpen(false)} aria-current={routeIsActive(pathname, route.href) ? "page" : undefined} href={route.href} key={route.href}>
          <span>{String(index).padStart(2, "0")}</span><b>{route.label}</b><em>/{route.module}</em>
        </Link>)}
      </div>
    </div>}
    <RouteTrace key={pathname} pathname={pathname} />
    {children}
    <PublicFooter />
  </>;
}

function RouteTrace({ pathname }: { pathname: string }) {
  return <div className="route-trace is-visible" role="status" aria-live="polite">
    <span>GET {pathname}</span><i /><b>200 OK · MODULE READY</b>
  </div>;
}

function PublicFooter() {
  return <footer className="global-footer">
    <div><b><i /> SYSTEM ONLINE</b><span>BUILD: PORTFOLIO-V4</span><span>REGION: GLOBAL</span></div>
    <nav aria-label="Footer navigation">{publicRoutes.map((route) => <Link href={route.href} key={route.href}>{route.label}</Link>)}</nav>
    <div><a href="https://github.com/AliDvlpr" target="_blank" rel="noreferrer">GitHub</a><a href="https://linkedin.com/in/alidvlpr" target="_blank" rel="noreferrer">LinkedIn</a><span>© 2026 Ali Mohammadi</span></div>
  </footer>;
}
