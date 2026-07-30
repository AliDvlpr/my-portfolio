import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "./Analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ali Mohammadi — Backend Engineer",
  description:
    "Backend engineer building scalable Python systems with FastAPI, Django, PostgreSQL, and Redis.",
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:5173"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "Ali Mohammadi — Backend Engineer",
    description: "Production-minded backend systems, architecture, and engineering notes.",
    type: "profile",
    url: "/",
    siteName: "Ali Mohammadi",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ali Mohammadi — Backend Engineer",
    description: "Production-minded backend systems, architecture, and engineering notes.",
  },
  other: { "theme-color": "#080906" },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a className="skip-link" href="#main-content">Skip to content</a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Ali Mohammadi",
          jobTitle: "Backend Engineer",
          url: process.env.SITE_URL ?? "http://localhost:5173",
          sameAs: ["https://github.com/AliDvlpr", "https://linkedin.com/in/alidvlpr"],
          knowsAbout: ["Python", "FastAPI", "Django", "PostgreSQL", "Redis", "System design"],
        }).replaceAll("<", "\\u003c") }} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
