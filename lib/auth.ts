import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE = "am_admin_session";
const DEFAULT_ADMIN_EMAIL = "alimohammadi.8773@gmail.com";
const DEFAULT_ADMIN_PASSWORD = "AliAdmin!2026";
const SESSION_VALUE = "local-admin";

export function isDefaultAdminLogin(email: string, password: string) {
  return email.trim().toLowerCase() === DEFAULT_ADMIN_EMAIL && password === DEFAULT_ADMIN_PASSWORD;
}

export async function createAdminSession() {
  const store = await cookies();
  store.set(ADMIN_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 0,
  });
}

export async function getAdminSession() {
  const store = await cookies();
  const session = store.get(ADMIN_COOKIE)?.value;
  if (session !== SESSION_VALUE) return null;

  return {
    user: {
      email: DEFAULT_ADMIN_EMAIL,
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
