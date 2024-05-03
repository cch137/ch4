import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { messageManager } from "@/server/aichat";
import AuthNext from "@/server/auth-next";
import type { ConvCompleted } from "@/constants/chat/types";
import type { NextApiContext, StatusResponse } from "@/constants/types";
import { readJSON } from "@cch137/utils/stream";

export async function POST(
  req: NextRequest,
  context: NextApiContext
): Promise<NextResponse<ConvCompleted>> {
  const { id: userId } = AuthNext.parseRequestToken(req);
  const convId = context?.params?.id || "";
  if (!userId || !convId) return NextResponse.json({ id: convId });
  return NextResponse.json(
    await messageManager.getConvCompleted(userId, convId)
  );
}

export async function PUT(
  req: NextRequest,
  context: NextApiContext
): Promise<NextResponse<StatusResponse>> {
  const { id: userId } = AuthNext.parseRequestToken(req);
  const convId = context?.params?.id || "";
  return NextResponse.json(
    await messageManager.setConv(
      userId,
      convId,
      (await readJSON(req.body)) || {}
    )
  );
}

export async function DELETE(
  req: NextRequest,
  context: NextApiContext
): Promise<NextResponse<StatusResponse>> {
  const { id: userId } = AuthNext.parseRequestToken(req);
  const convId = context?.params?.id || "";
  return NextResponse.json(await messageManager.delConv(userId, convId));
}
