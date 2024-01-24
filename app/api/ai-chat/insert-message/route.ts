import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { messageManager } from "@/server/aichat";
import authNext from "@/server/auth-next";
import type { SaveMssg, SaveMssgRes } from "@/constants/chat/types";
import type { StatusResponse } from "@/constants/types";
import { readStream } from "@cch137/utils/stream";
import { unpackData } from "@cch137/utils/shuttle";

export async function POST(req: NextRequest): Promise<NextResponse<StatusResponse<SaveMssgRes>>> {
  const { value: token } = authNext.parse(req);
  const { id: userId } = token || {};
  if (!userId) return NextResponse.json({ success: false, message: 'Not Logged In' });
  try {
    const msg = unpackData<SaveMssg>(await readStream(req.body), 54715471, 77455463);
    return NextResponse.json(await messageManager.insertMessage(userId, msg));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: 'Failed to insert message' });
  }
}
