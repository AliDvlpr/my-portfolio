import { createRequire } from "node:module";
import { authOptions } from "@/auth";

const require = createRequire(import.meta.url);
const NextAuth = require("next-auth").default as (options: typeof authOptions) => {
  GET: (request: Request) => Promise<Response>;
  POST: (request: Request) => Promise<Response>;
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
