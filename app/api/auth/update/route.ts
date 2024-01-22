import type { NextRequest } from "next/server";
import authNext from "@/app/api/services/auth-next";

async function handle(req: NextRequest) {
  return await authNext.update(req);
}

export {
  handle as GET,
  handle as POST,
}
