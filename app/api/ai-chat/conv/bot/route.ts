import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { messageManager } from "@/server/aichat";
import authNext from "@/server/auth-next";

const id = 'BOT';

export async function POST(req: NextRequest) {
  if (!authNext.validBotAuthKey(req)) return NextResponse.json([]);
  return NextResponse.json(await messageManager.getConvList(id));
}

export async function PUT(req: NextRequest) {
  if (!authNext.validBotAuthKey(req)) return NextResponse.json(null);
  return NextResponse.json(await messageManager.createConv(id));
}
