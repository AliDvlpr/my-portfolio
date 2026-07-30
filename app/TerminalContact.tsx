"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Field = "name" | "email" | "message";

const bootLines = [
  "initializing secure contact channel...",
  "loading identity.service",
  "checking mail gateway",
  "connection ready — 34ms",
];

export default function TerminalContact() {
  const [activeField, setActiveField] = useState<Field>("name");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [clock, setClock] = useState("00:00:00");

  useEffect(() => {
    const legacy = document.querySelector<HTMLElement>("footer#contact");
    if (legacy) {
      legacy.classList.add("legacy-contact");
      legacy.removeAttribute("id");
    }

    const tick = () => setClock(new Date().toLocaleTimeString("en-GB", { hour12: false }));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const completion = useMemo(() => {
    return [name, email, message].filter((value) => value.trim()).length;
  }, [name, email, message]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const subject = encodeURIComponent(`Portfolio inquiry from ${name || "a potential client"}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    setSent(true);
    window.location.href = `mailto:alimohammadi.8773@gmail.com?subject=${subject}&body=${body}`;
  }

  return (
    <section className="terminal-contact" id="contact" aria-labelledby="terminal-contact-title">
      <div className="terminal-ambient" aria-hidden="true">
        <i /><i /><i /><i />
      </div>

      <div className="terminal-heading">
        <div>
          <p>05 / ESTABLISH CONNECTION</p>
          <h2 id="terminal-contact-title">Start a project<br /><em>from the command line.</em></h2>
        </div>
        <div className="terminal-health" aria-label="System health">
          <span><i /> API GATEWAY <b>ONLINE</b></span>
          <span><i /> MAIL SERVICE <b>READY</b></span>
          <span><i /> RESPONSE WINDOW <b>&lt; 24H</b></span>
        </div>
      </div>

      <div className="terminal-shell">
        <div className="terminal-bar">
          <div className="terminal-dots"><i /><i /><i /></div>
          <span>ali@backend: ~/contact/session</span>
          <time>{clock} UTC</time>
        </div>

        <div className="terminal-grid">
          <div className="terminal-output" aria-live="polite">
            <div className="boot-log">
              {bootLines.map((line, index) => (
                <p key={line} style={{ animationDelay: `${index * 120}ms` }}>
                  <span>[OK]</span> {line}
                </p>
              ))}
            </div>

            <div className="request-trace">
              <div><span>POST</span><b>/api/v1/conversations</b><em>201</em></div>
              <div><span>AUTH</span><b>identity verified</b><em>PASS</em></div>
              <div><span>QUEUE</span><b>priority.inquiries</b><em>READY</em></div>
            </div>

            <p className="terminal-copy">
              Tell me what you are building, what is blocked, or where the backend needs to become more reliable.
            </p>

            <div className="completion-meter">
              <span>PAYLOAD COMPLETION</span>
              <div><i style={{ width: `${completion * 33.333}%` }} /></div>
              <b>{completion}/3</b>
            </div>
          </div>

          <form className="terminal-form" onSubmit={submit}>
            <label className={activeField === "name" ? "is-active" : ""}>
              <span><b>$</b> set client.name =</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                onFocus={() => setActiveField("name")}
                placeholder='"Your name"'
                required
              />
            </label>

            <label className={activeField === "email" ? "is-active" : ""}>
              <span><b>$</b> set client.email =</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onFocus={() => setActiveField("email")}
                placeholder='"you@company.com"'
                required
              />
            </label>

            <label className={activeField === "message" ? "is-active" : ""}>
              <span><b>$</b> write project.brief &lt;&lt; EOF</span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onFocus={() => setActiveField("message")}
                placeholder="Describe the product, timeline, and backend challenge..."
                rows={6}
                required
              />
              <small>EOF</small>
            </label>

            <button type="submit">
              <span>{sent ? "MESSAGE QUEUED" : "EXECUTE SEND"}</span>
              <b>{sent ? "✓" : "↗"}</b>
            </button>
          </form>
        </div>
      </div>

      <div className="terminal-footer">
        <p>ALI MOHAMMADI © 2026</p>
        <div>
          <a href="https://github.com/AliDvlpr" target="_blank" rel="noreferrer">GITHUB</a>
          <a href="https://linkedin.com/in/alidvlpr" target="_blank" rel="noreferrer">LINKEDIN</a>
          <a href="https://t.me/Ali_Dvlpr" target="_blank" rel="noreferrer">TELEGRAM</a>
        </div>
        <a href="#top">BACK TO TOP ↑</a>
      </div>
    </section>
  );
}
