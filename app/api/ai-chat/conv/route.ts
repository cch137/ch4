import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { messageManager } from "@/server/aichat";
import AuthNext from "@/server/auth-next";

export async function POST(req: NextRequest) {
  const { id } = AuthNext.parseRequestToken(req);
  return NextResponse.json(await messageManager.getConvList(id));
}

export async function PUT(req: NextRequest) {
  const { id } = AuthNext.parseRequestToken(req);
  return NextResponse.json(await messageManager.createConv(id));
}
