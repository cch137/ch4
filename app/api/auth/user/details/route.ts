import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { userManager } from "@/app/api/services/auth";
import authNext from "@/app/api/services/auth-next";

export async function GET(req: NextRequest) {
  const { value: token } = authNext.parse(req);
  return NextResponse.json(await userManager.getUserDetailsById(token?.id));
}
