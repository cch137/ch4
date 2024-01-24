import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { messageManager } from "@/server/aichat";
import authNext from "../../../../../server/auth-next";
import type { ConvCompleted } from "@/constants/chat/types";
import type { NextApiContext, StatusResponse } from "@/constants/types";
import { readJSON } from "@cch137/utils/stream";

async function handle(req: NextRequest, context: NextApiContext): Promise<NextResponse<ConvCompleted>> {
  const { value: token } = authNext.parse(req);
  const { id: userId } = token || {};
  const convId = context?.params?.id || '';
  if (!token || !userId || !convId) return NextResponse.json({ id: convId });
  return NextResponse.json(await messageManager.getConvCompleted(userId, convId));
}

async function PUT(req: NextRequest, context: NextApiContext): Promise<NextResponse<StatusResponse>> {
  const { value: token } = authNext.parse(req);
  const { id: userId } = token || {};
  const convId = context?.params?.id || '';
  const { name, conf }: {name: string, conf: string} = await readJSON(req.body) || {};
  return NextResponse.json(await messageManager.setConvNameAndConf(userId, convId, name, conf));
}

async function DELETE(req: NextRequest, context: NextApiContext): Promise<NextResponse<StatusResponse>> {
  const { value: token } = authNext.parse(req);
  const { id: userId } = token || {};
  const convId = context?.params?.id || '';
  return NextResponse.json(await messageManager.delConv(userId, convId));
}

export {
  handle as GET,
  handle as POST,
  PUT,
  DELETE,
}
