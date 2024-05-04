import type { NextRequest } from "next/server";
import AuthNext from "@/server/auth-next";
import { NextResponse } from "next/server";
import { messageManager } from "@/server/aichat";
import type { ConvMeta } from "@/constants/chat/types";
import type { NextApiContext, StatusResponse } from "@/constants/types";
import { readJSON } from "@cch137/utils/stream";
import { AiChatConversation } from "@/server/mongoose";

const userId = "BOT";

const getConv = async (convId: string): Promise<ConvMeta> => {
  const conv = await AiChatConversation.findOne(
    { user: userId, id: convId },
    { _id: 0 }
  ).lean();
  if (!conv) {
    await AiChatConversation.create({ user: userId, id: convId, ctms: 1 });
    return getConv(convId);
  }
  return { id: conv.id, conf: conv.conf || undefined };
};

export async function POST(
  req: NextRequest,
  context: NextApiContext
): Promise<NextResponse<ConvMeta>> {
  if (!AuthNext.validBotAuthKey(req))
    return new NextResponse("Unauthorized", { status: 400 });
  const convId = context?.params?.id || "";
  return NextResponse.json(await getConv(convId));
}

export async function PUT(
  req: NextRequest,
  context: NextApiContext
): Promise<NextResponse<StatusResponse>> {
  if (!AuthNext.validBotAuthKey(req))
    return new NextResponse("Unauthorized", { status: 400 });
  const convId = context?.params?.id || "";
  await getConv(convId);
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
  if (!AuthNext.validBotAuthKey(req))
    return new NextResponse("Unauthorized", { status: 400 });
  const convId = context?.params?.id || "";
  return NextResponse.json(await messageManager.delConv(userId, convId));
}
