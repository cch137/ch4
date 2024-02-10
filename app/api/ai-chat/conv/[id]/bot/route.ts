import type { NextRequest } from "next/server";
import authNext from "@/server/auth-next";
import { NextResponse } from "next/server";
import { messageManager } from "@/server/aichat";
import type { ConvItem } from "@/constants/chat/types";
import type { NextApiContext, StatusResponse } from "@/constants/types";
import { readJSON } from "@cch137/utils/stream";

const userId = 'BOT';

export async function POST(req: NextRequest, context: NextApiContext): Promise<NextResponse<ConvItem>> {
  if (!authNext.validBotAuthKey(req)) return new NextResponse('Unauthorized', { status: 400 });
  const convId = context?.params?.id || '';
  return NextResponse.json(await messageManager.getConv(userId, convId));
}

export async function PUT(req: NextRequest, context: NextApiContext): Promise<NextResponse<StatusResponse>> {
  if (!authNext.validBotAuthKey(req)) return new NextResponse('Unauthorized', { status: 400 });
  const convId = context?.params?.id || '';
  return NextResponse.json(await messageManager.setConv(userId, convId, await readJSON(req.body) || {}));
}

export async function DELETE(req: NextRequest, context: NextApiContext): Promise<NextResponse<StatusResponse>> {
  if (!authNext.validBotAuthKey(req)) return new NextResponse('Unauthorized', { status: 400 });
  const convId = context?.params?.id || '';
  return NextResponse.json(await messageManager.delConv(userId, convId));
}
