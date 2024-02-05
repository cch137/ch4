import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { messageManager } from "@/server/aichat";
import authNext from "@/server/auth-next";
import type { MssgItem, MssgItemWithVers } from "@/constants/chat/types";
import type { StatusResponse } from "@/constants/types";
import { readStream } from "@cch137/utils/stream";
import { unpackDataWithHash } from "@cch137/utils/shuttle";
import { parse } from "@cch137/utils/format/version";

export async function POST(req: NextRequest): Promise<NextResponse<StatusResponse<MssgItem>>> {
  const { id: userId } = authNext.parseRequestToken(req);
  if (!userId) return NextResponse.json({ success: false, message: 'Unauthorized' });
  try {
    const msg = unpackDataWithHash<MssgItemWithVers>(await readStream(req.body), 256, 54715471, 77455463);
    // check version
    if (parse(msg.vers).lt([0,6,6])) return NextResponse.json({ success: false, message: 'Version oudated, please reload.' });
    return NextResponse.json(await messageManager.insertMessage(userId, msg));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: 'Failed to insert message' });
  }
}
