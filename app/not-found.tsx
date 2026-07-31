import Link from "next/link";
import { publicRoutes } from "@/lib/routes";

export default function NotFound() {
  return <main className="route-state is-not-found" id="main-content"><span>404 ROUTE NOT FOUND</span><h1>The requested module is not registered.</h1><p>Choose an available public module:</p><nav aria-label="Available modules">{publicRoutes.map((route) => <Link href={route.href} key={route.href}><span>{route.href}</span><b>{route.module}</b></Link>)}</nav></main>;
}
