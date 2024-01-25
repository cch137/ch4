import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { messageManager } from "@/server/aichat";
import authNext from "@/server/auth-next";

export async function POST(req: NextRequest) {
  const { id } = authNext.parseRequestToken(req);
  return NextResponse.json(await messageManager.getConvList(id));
}
