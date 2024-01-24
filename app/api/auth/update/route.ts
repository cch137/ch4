import { NextResponse, type NextRequest } from "next/server";
import authNext from "@/server/auth-next";

async function handle(req: NextRequest) {
  return NextResponse.json({ok:1});
  return await authNext.update(req);
}

export {
  handle as GET,
  handle as POST,
}
