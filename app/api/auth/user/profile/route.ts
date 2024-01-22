import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import authNext from "@/app/api/services/auth-next";

async function handle(req: NextRequest) {
  return NextResponse.json(await authNext.getUserProfile(req));
}

export {
  handle as GET,
  handle as POST,
}
