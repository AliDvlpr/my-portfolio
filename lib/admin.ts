import { getChatGPTUser } from "@/app/chatgpt-auth";
import { isAdminEmail } from "./env";

export async function requireAdminApi() {
  const user = await getChatGPTUser();
  if (!user) return { authorized: false as const, status: 401, user: null };
  if (!isAdminEmail(user.email)) return { authorized: false as const, status: 403, user };
  return { authorized: true as const, status: 200, user };
}

export function hasSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  return origin === new URL(request.url).origin;
}
