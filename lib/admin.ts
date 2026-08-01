import { requireAdminApiSession } from "./auth";

export async function requireAdminApi() {
  const auth = await requireAdminApiSession();
  if (!auth.authorized) return { authorized: false as const, status: auth.status, user: null };
  return { authorized: true as const, status: 200, user: { email: auth.session.user.email, displayName: auth.session.user.name ?? auth.session.user.email, fullName: auth.session.user.name ?? null } };
}

export function hasSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  return origin === new URL(request.url).origin;
}
