import { createAdminSession, verifyAdminLogin } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: string; password?: string } | null;
  const email = String(body?.email ?? "");
  const password = String(body?.password ?? "");

  if (!(await verifyAdminLogin(email, password))) {
    return Response.json({ success: false, message: "Wrong email or password." }, { status: 401 });
  }

  await createAdminSession(email);

  return Response.json({ success: true, redirectTo: "/admin" });
}
