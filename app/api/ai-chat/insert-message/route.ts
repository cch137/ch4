import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { messageManager } from "@/server/aichat";
import authNext from "@/server/auth-next";
import type { SaveMssg, SaveMssgRes } from "@/constants/chat/types";
import type { StatusResponse } from "@/constants/types";
import { readStream } from "@cch137/utils/stream";
import { unpackData } from "@cch137/utils/shuttle";
import { parse } from "@cch137/utils/format/version";

export async function POST(req: NextRequest): Promise<NextResponse<StatusResponse<SaveMssgRes>>> {
  const { id: userId } = authNext.parseRequestToken(req);
  if (!userId) return NextResponse.json({ success: false, message: 'Unauthorized' });
  try {
    const msg = unpackData<SaveMssg>(await readStream(req.body), 54715471, 77455463);
    // check version
    if (parse(msg.vers).gte([0,6,2])) return NextResponse.json({ success: false, message: 'Version oudated, please reload.' });
    return NextResponse.json(await messageManager.insertMessage(userId, msg));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: 'Failed to insert message' });
  }
}
