"use client";

import Script from "next/script";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics-client";

type Field = "name" | "email" | "company" | "subject" | "message";
type SubmissionState =
  | "idle" | "validating" | "verifying" | "sending" | "success"
  | "rate-limited" | "validation-error" | "verification-error" | "server-error";

type ApiResult = {
  success: boolean;
  code?: string;
  message: string;
  requestId?: string;
  fields?: Record<string, string>;
  retryAfter?: number;
};

const initialLogs = [
  ["OK", "contact API reachable"],
  ["OK", "persistence channel ready"],
  ["OK", "abuse protection armed"],
] as const;

export default function TerminalContact() {
  const statusRef = useRef<HTMLDivElement>(null);
  const startedAt = useRef(0);
  const [activeField, setActiveField] = useState<Field>("name");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [state, setState] = useState<SubmissionState>("idle");
  const [result, setResult] = useState<ApiResult | null>(null);
  const [clock, setClock] = useState("00:00:00");
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  useEffect(() => {
    startedAt.current = Date.now();
    const tick = () => setClock(new Date().toLocaleTimeString("en-GB", { hour12: false }));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    window.onPortfolioTurnstileSuccess = (token: string) => setTurnstileToken(token);
    window.onPortfolioTurnstileExpired = () => setTurnstileToken("");
    window.onPortfolioTurnstileError = () => {
      setTurnstileToken("");
      setState("verification-error");
      setResult({ success: false, message: "Client verification could not be completed." });
    };
    return () => {
      delete window.onPortfolioTurnstileSuccess;
      delete window.onPortfolioTurnstileExpired;
      delete window.onPortfolioTurnstileError;
    };
  }, []);

  const completion = useMemo(() => [name, email, subject, message].filter((value) => value.trim()).length, [name, email, subject, message]);
  const busy = ["validating", "verifying", "sending"].includes(state);
  const fieldErrors = result?.fields ?? {};

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setResult(null);
    setState("validating");
    trackEvent("contact_started", { path: "/" });
    await Promise.resolve();
    setState("verifying");
    const token = siteKey ? turnstileToken : "development-bypass";
    if (siteKey && !token) {
      setState("verification-error");
      setResult({ success: false, message: "Complete the verification challenge before sending." });
      statusRef.current?.focus();
      return;
    }
    setState("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company, subject, message, website, turnstileToken: token, startedAt: startedAt.current }),
      });
      const payload = await response.json() as ApiResult;
      setResult(payload);
      if (response.ok && payload.success) {
        setState("success");
        setName(""); setEmail(""); setCompany(""); setSubject(""); setMessage(""); setWebsite("");
        startedAt.current = Date.now();
        trackEvent("contact_submitted", { path: "/", requestId: payload.requestId });
      } else if (response.status === 429) {
        setState("rate-limited");
        trackEvent("contact_failed", { path: "/", code: "rate_limited" });
      } else if (payload.code === "VALIDATION_ERROR") {
        setState("validation-error");
        trackEvent("contact_failed", { path: "/", code: "validation" });
      } else if (payload.code === "VERIFICATION_ERROR") {
        setState("verification-error");
        trackEvent("contact_failed", { path: "/", code: "verification" });
      } else {
        setState("server-error");
        trackEvent("contact_failed", { path: "/", code: payload.code ?? "server" });
      }
    } catch {
      setState("server-error");
      setResult({ success: false, message: "The contact service could not be reached. Your form values are still here." });
      trackEvent("contact_failed", { path: "/", code: "network" });
    } finally {
      statusRef.current?.focus();
    }
  }

  const progress = state === "validating" ? 1 : state === "verifying" ? 2 : state === "sending" ? 3 : state === "success" ? 4 : 0;

  return (
    <section className="terminal-contact" id="contact" aria-labelledby="terminal-contact-title">
      {siteKey && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />}
      <div className="terminal-ambient" aria-hidden="true"><i /><i /><i /><i /></div>
      <div className="terminal-heading">
        <div>
          <p>08 / PRODUCTION ENDPOINT</p>
          <h2 id="terminal-contact-title">Start a project<br /><em>through the API.</em></h2>
        </div>
        <div className="terminal-health" aria-label="System health">
          <span><i /> CONTACT API <b>ONLINE</b></span>
          <span><i /> D1 STORAGE <b>READY</b></span>
          <span><i /> RESEND GATEWAY <b>ARMED</b></span>
        </div>
      </div>

      <div className="terminal-shell">
        <div className="terminal-bar">
          <div className="terminal-dots"><i /><i /><i /></div>
          <span>ali@backend: ~/contact/production</span>
          <time>{clock} UTC</time>
        </div>
        <div className="terminal-grid">
          <div className="terminal-output">
            <div className="boot-log">{initialLogs.map(([level, line]) => <p key={line}><span>[{level}]</span> {line}</p>)}</div>
            <div className="request-trace">
              <div><span>POST</span><b>/api/contact</b><em>{state === "success" ? "201" : "READY"}</em></div>
              <div><span>VERIFY</span><b>turnstile + honeypot</b><em>{progress >= 2 ? "PASS" : "WAIT"}</em></div>
              <div><span>STORE</span><b>contact_submissions</b><em>{state === "success" ? "DONE" : "READY"}</em></div>
            </div>
            <div className="submission-progress" aria-hidden="true">
              {["validating payload", "verifying client", "dispatching email", "storing request"].map((label, index) => (
                <p className={progress > index + 1 ? "is-done" : progress === index + 1 ? "is-active" : ""} key={label}>
                  <span>[{index + 1}/4]</span>{label}<i />{progress > index + 1 ? "OK" : progress === index + 1 ? "RUN" : "WAIT"}
                </p>
              ))}
            </div>
            <div ref={statusRef} tabIndex={-1} className={`contact-result is-${state}`} role="status" aria-live="polite">
              {state === "idle" && <p>Awaiting <code>$ contact.send</code></p>}
              {busy && <p>{state.toUpperCase()}...</p>}
              {result && <><strong>{state === "success" ? "201 CREATED" : result.code ?? "REQUEST FAILED"}</strong><p>{result.message}</p>{result.requestId && <code>request_id: {result.requestId}</code>}{result.retryAfter && <code>retry_after: {result.retryAfter}s</code>}</>}
            </div>
            <div className="completion-meter"><span>PAYLOAD COMPLETION</span><div><i style={{ width: `${completion * 25}%` }} /></div><b>{completion}/4</b></div>
          </div>

          <form className="terminal-form" onSubmit={submit} noValidate>
            <div className="honeypot" aria-hidden="true">
              <label>Website<input value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" /></label>
            </div>
            <TerminalField label="client.name" error={fieldErrors.name}>
              <input value={name} onChange={(event) => setName(event.target.value)} onFocus={() => setActiveField("name")} aria-invalid={!!fieldErrors.name} aria-describedby={fieldErrors.name ? "name-error" : undefined} required minLength={2} maxLength={80} autoComplete="name" />
            </TerminalField>
            <TerminalField label="client.email" error={fieldErrors.email}>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} onFocus={() => setActiveField("email")} aria-invalid={!!fieldErrors.email} aria-describedby={fieldErrors.email ? "email-error" : undefined} required maxLength={254} autoComplete="email" />
            </TerminalField>
            <div className="terminal-form-row">
              <TerminalField label="client.company" error={fieldErrors.company}>
                <input value={company} onChange={(event) => setCompany(event.target.value)} onFocus={() => setActiveField("company")} maxLength={100} autoComplete="organization" />
              </TerminalField>
              <TerminalField label="request.subject" error={fieldErrors.subject}>
                <input value={subject} onChange={(event) => setSubject(event.target.value)} onFocus={() => setActiveField("subject")} aria-invalid={!!fieldErrors.subject} required minLength={3} maxLength={120} />
              </TerminalField>
            </div>
            <TerminalField label="write project.brief << EOF" error={fieldErrors.message}>
              <textarea value={message} onChange={(event) => setMessage(event.target.value)} onFocus={() => setActiveField("message")} aria-invalid={!!fieldErrors.message} aria-describedby={fieldErrors.message ? "message-error" : undefined} rows={5} required minLength={20} maxLength={5000} />
            </TerminalField>
            <div className="turnstile-shell">
              {siteKey ? <div className="cf-turnstile" data-sitekey={siteKey} data-theme="dark" data-callback="onPortfolioTurnstileSuccess" data-expired-callback="onPortfolioTurnstileExpired" data-error-callback="onPortfolioTurnstileError" /> : <p><i /> DEVELOPMENT VERIFICATION BYPASS</p>}
            </div>
            <button type="submit" disabled={busy}><span>{busy ? `${state.toUpperCase()}...` : state === "success" ? "SEND ANOTHER" : "EXECUTE SEND"}</span><b>{state === "success" ? "✓" : "↗"}</b></button>
            <span className="active-field" aria-hidden="true">active: {activeField}</span>
          </form>
        </div>
      </div>
    </section>
  );
}

function TerminalField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  const id = label.includes("email") ? "email-error" : label.includes("name") ? "name-error" : label.includes("brief") ? "message-error" : `${label.replace(/\W/g, "-")}-error`;
  return <label className="is-active"><span><b>$</b> set {label} =</span>{children}{error && <small id={id}>{error}</small>}</label>;
}

declare global {
  interface Window {
    onPortfolioTurnstileSuccess?: (token: string) => void;
    onPortfolioTurnstileExpired?: () => void;
    onPortfolioTurnstileError?: () => void;
  }
}
