import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { messageManager } from "@/server/aichat";
import authNext from "@/server/auth-next";
import type { ConvCompleted } from "@/constants/chat/types";
import type { NextApiContext, StatusResponse } from "@/constants/types";
import { readJSON } from "@cch137/utils/stream";

export async function POST(req: NextRequest, context: NextApiContext): Promise<NextResponse<ConvCompleted>> {
  const { id: userId } = authNext.parseRequestToken(req);
  const convId = context?.params?.id || '';
  if (!userId || !convId) return NextResponse.json({ id: convId });
  return NextResponse.json(await messageManager.getConvCompleted(userId, convId));
}

export async function PUT(req: NextRequest, context: NextApiContext): Promise<NextResponse<StatusResponse>> {
  const { id: userId } = authNext.parseRequestToken(req);
  const convId = context?.params?.id || '';
  const { name, conf }: {name: string, conf: string} = await readJSON(req.body) || {};
  return NextResponse.json(await messageManager.setConvNameAndConf(userId, convId, name, conf));
}

export async function DELETE(req: NextRequest, context: NextApiContext): Promise<NextResponse<StatusResponse>> {
  const { id: userId } = authNext.parseRequestToken(req);
  const convId = context?.params?.id || '';
  return NextResponse.json(await messageManager.delConv(userId, convId));
}
