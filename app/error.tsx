"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="route-state is-error" id="main-content"><span>500 MODULE ERROR</span><h1>The requested module could not start.</h1><p>No internal details were exposed. Retry the route or return to a registered module.</p><div className="state-actions"><button onClick={reset}>RETRY MODULE</button><Link href="/">RETURN HOME</Link></div></main>;
}
