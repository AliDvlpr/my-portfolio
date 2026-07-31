import type { Metadata } from "next";
import TerminalContact from "../TerminalContact";
import { PageHeader } from "../PagePrimitives";

export const metadata: Metadata = {
  title: "Contact | Ali — Start a Conversation",
  description: "Send a secure project inquiry through the production contact gateway.",
  alternates: { canonical: "/contact" },
  openGraph: { title: "Contact Ali — Backend Engineer", description: "Start a conversation about backend systems, APIs, and architecture.", url: "/contact", type: "website" },
};

export default function ContactPage() {
  return <main className="route-page contact-route" id="main-content">
    <PageHeader index="06" module="CONTACT_GATEWAY" path="/contact" title={<>A production endpoint<br />for real conversations.</>} description="Your request is validated, abuse-checked, stored, and delivered through the same production pipeline described across this portfolio." />
    <div className="contact-assurance"><span><i /> ACCEPTING REQUESTS</span><span>RATE LIMIT: ACTIVE</span><span>SECURITY: VERIFIED</span><span>RETENTION: MINIMAL</span></div>
    <TerminalContact />
    <section className="contact-alternatives"><div><p>ALTERNATIVE CHANNELS</p><a href="mailto:alimohammadi.8773@gmail.com">alimohammadi.8773@gmail.com</a><a href="https://linkedin.com/in/alidvlpr" target="_blank" rel="noreferrer">LinkedIn ↗</a></div><p>Messages are stored only for project follow-up and operational review. No response-time promise is implied, and contact details are not used for marketing.</p></section>
  </main>;
}
