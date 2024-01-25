import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { messageManager } from "@/server/aichat";
import authNext from "@/server/auth-next";
import type { MssgItem } from "@/constants/chat/types";
import type { NextApiContext, StatusResponse } from "@/constants/types";
import { readJSON } from "@cch137/utils/stream";

export async function GET(req: NextRequest, context: NextApiContext): Promise<NextResponse<StatusResponse<MssgItem|null>>> {
  const { id: userId } = authNext.parseRequestToken(req);
  if (!userId) return NextResponse.json({ success: false, message: 'Unauthorized' });
  try {
    const { id: convId, msg: msgId } = context?.params || {};
    const message = await messageManager.getMessage(userId, convId, msgId);
    return NextResponse.json({ success: true, value: message });
  } catch {
    return NextResponse.json({ success: false, message: 'Failed to get message' });
  }
}

export async function PUT(req: NextRequest, context: NextApiContext): Promise<NextResponse<StatusResponse>> {
  const { id: userId } = authNext.parseRequestToken(req);
  if (!userId) return NextResponse.json({ success: false, message: 'Unauthorized' });
  try {
    const { id: convId, msg: msgId } = context?.params || {};
    const msg: MssgItem = await readJSON(req.body);
    await messageManager.setMessage(userId, convId, msgId, msg)
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, message: 'Failed to edit message' });
  }
}

export async function DELETE(req: NextRequest, context: NextApiContext): Promise<NextResponse<StatusResponse>> {
  const { id: userId } = authNext.parseRequestToken(req);
  if (!userId) return NextResponse.json({ success: false, message: 'Unauthorized' });
  try {
    const { id: convId, msg: msgId } = context?.params || {};
    await messageManager.delMessage(userId, convId, msgId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, message: 'Failed to delete message' });
  }
}
