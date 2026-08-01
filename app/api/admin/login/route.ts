import { createAdminSession, isDefaultAdminLogin } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: string; password?: string } | null;
  const email = String(body?.email ?? "");
  const password = String(body?.password ?? "");

  if (!isDefaultAdminLogin(email, password)) {
    return Response.json({ success: false, message: "Wrong email or password." }, { status: 401 });
  }

  await createAdminSession();

  return Response.json({ success: true, redirectTo: "/admin" });
}
