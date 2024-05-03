import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { userManager } from "@/server/auth";
import AuthNext from "@/server/auth-next";

export async function POST(req: NextRequest) {
  const token = AuthNext.parseRequestToken(req);
  return NextResponse.json(await userManager.getUserDetailsById(token?.id));
}
