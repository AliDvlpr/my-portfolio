import { compare } from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getNormalizedAdminPasswordHash, getServerEnv, isAdminEmail } from "@/lib/env";

const ADMIN_COOKIE = "am_admin_session";
const DEFAULT_ADMIN_EMAIL = "alimohammadi.8773@gmail.com";
const DEFAULT_ADMIN_PASSWORD = "AliAdmin!2026";
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const LOCAL_SESSION_SECRET = "alidvlpr-local-session-secret";

type SessionPayload = {
  email: string;
  expiresAt: number;
};

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function getSessionSecret() {
  const secret = getServerEnv().AUTH_SECRET?.trim();
  if (isProduction() && !secret) return null;
  return secret || LOCAL_SESSION_SECRET;
}

function encode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

async function importSigningKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function sign(payload: string, secret: string) {
  const key = await importSigningKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Buffer.from(signature).toString("base64url");
}

async function createSessionValue(email: string) {
  const secret = getSessionSecret();
  if (!secret) throw new Error("Admin authentication is not configured.");
  const payload = encode(JSON.stringify({
    email: email.trim().toLowerCase(),
    expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
  } satisfies SessionPayload));
  return `${payload}.${await sign(payload, secret)}`;
}

async function readSessionValue(value: string): Promise<SessionPayload | null> {
  const secret = getSessionSecret();
  if (!secret) return null;
  const [payload, signature, extra] = value.split(".");
  if (!payload || !signature || extra) return null;

  try {
    const key = await importSigningKey(secret);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      Buffer.from(signature, "base64url"),
      new TextEncoder().encode(payload),
    );
    if (!valid) return null;
    const parsed = JSON.parse(decode(payload)) as SessionPayload;
    if (!parsed.email || !Number.isFinite(parsed.expiresAt) || parsed.expiresAt <= Date.now()) return null;
    if (isProduction() && !isAdminEmail(parsed.email)) return null;
    if (!isProduction() && parsed.email !== DEFAULT_ADMIN_EMAIL) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function verifyAdminLogin(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!isProduction()) {
    return normalizedEmail === DEFAULT_ADMIN_EMAIL && password === DEFAULT_ADMIN_PASSWORD;
  }

  if (!isAdminEmail(normalizedEmail)) return false;
  const hash = getNormalizedAdminPasswordHash();
  if (!hash) return false;
  return compare(password, hash).catch(() => false);
}

export async function createAdminSession(email: string) {
  const store = await cookies();
  store.set(ADMIN_COOKIE, await createSessionValue(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction(),
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction(),
    path: "/",
    maxAge: 0,
  });
}

export async function getAdminSession() {
  const store = await cookies();
  const value = store.get(ADMIN_COOKIE)?.value;
  if (!value) return null;
  const session = await readSessionValue(value);
  if (!session) return null;

  return {
    user: {
      email: session.email,
      name: "Ali Mohammadi",
    },
  };
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/sign-in");
  return session;
}

export async function requireAdminApiSession() {
  const session = await getAdminSession();
  if (!session) return { authorized: false as const, status: 401, session: null };
  return { authorized: true as const, status: 200, session };
}
