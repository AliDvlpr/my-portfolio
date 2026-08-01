import type { NextAuthOptions } from "next-auth";
import { createRequire } from "node:module";
import { getServerEnv } from "@/lib/env";

const require = createRequire(import.meta.url);
const CredentialsProvider = require("next-auth/providers/credentials").default as (options: {
  name: string;
  credentials: Record<string, { label: string; type: string }>;
  authorize: (credentials: Record<string, string> | undefined) => Promise<{ id: string; email: string; name: string; role: string } | null>;
}) => NextAuthOptions["providers"][number];

const DEFAULT_ADMIN_EMAIL = "alimohammadi.8773@gmail.com";
const DEFAULT_ADMIN_PASSWORD = "AliAdmin!2026";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

const env = getServerEnv();

export const authOptions: NextAuthOptions = {
  secret: env.AUTH_SECRET,
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: {
    signIn: "/admin/sign-in",
    error: "/admin/sign-in",
  },
  providers: [
    CredentialsProvider({
      name: "Admin credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: Record<string, string> | undefined) {
        const email = normalizeEmail(String(credentials?.email ?? ""));
        const password = String(credentials?.password ?? "");

        if (email !== DEFAULT_ADMIN_EMAIL || password !== DEFAULT_ADMIN_PASSWORD) {
          return null;
        }

        return {
          id: email,
          email,
          name: "Ali Mohammadi",
          role: "owner",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.email) {
        token.email = normalizeEmail(user.email);
        token.role = "owner";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.email) {
        session.user.email = String(token.email);
        session.user.name = session.user.name ?? "Ali Mohammadi";
      }
      return session;
    },
    async redirect() {
      return "/admin";
    },
  },
};
