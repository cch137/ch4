import { NextRequest, NextResponse } from "next/server";
import authNext from "@/server/auth-next";
import { unpackDataWithHash } from "@cch137/utils/shuttle";
import type { UniOptions } from "@cch137/utils/ai";
import { readStream } from "@cch137/utils/stream";
import { aiProvider, sendNextResponseStream } from "@/server/aichat";

const tryUnpackData = <T=UniOptions>(array: Uint8Array) => {
  try {
    return unpackDataWithHash<T>(array, 256, 4141414141, 4242424242);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  if (!authNext.validBotAuthKey(req)) return new NextResponse('Unauthorized', { status: 400 });
  const options = tryUnpackData<UniOptions>(await readStream(req.body));
  if (!options) return new NextResponse('Failed to parse request', { status: 400 });
  const stream = aiProvider.ask(options);
  return sendNextResponseStream(stream);
}
