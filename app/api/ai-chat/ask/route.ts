import { NextRequest, NextResponse } from "next/server";
import authNext from "@/server/auth-next";
import { unpackDataWithHash } from "@cch137/utils/shuttle";
import type { UniOptions } from "@cch137/utils/ai";
import { readJSON, readStream } from "@cch137/utils/stream";
import getIp from '@cch137/utils/server/get-ip';
import RateLimiter from '@cch137/utils/server/rate-limiter';
import { aiProvider, sendNextResponseStream } from "@/server/aichat";
import admin from "@/server/admin";

const rateLimiter = new RateLimiter([
  { maxCount:  10, timeMs: 60000 },
  { maxCount: 100, timeMs: 60000 * 15 },
  { maxCount: 300, timeMs: 60000 * 60 },
  { maxCount: 500, timeMs: 60000 * 60 * 4 },
  { maxCount: 999, timeMs: 60000 * 60 * 24 },
]);

const tryUnpackData = <T=UniOptions>(array: Uint8Array) => {
  try {
    return unpackDataWithHash<T>(array, 256, 4141414141, 4242424242);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const ip = getIp(req);
  const rateCheck = rateLimiter.check(ip);
  if (!rateCheck.success) return new NextResponse(rateCheck.message, { status: 429 });
  const { id: userId } = authNext.parseRequestToken(req);
  if (!userId) return new NextResponse('Unauthorized, please sign in or refresh the page.', { status: 401 });
  const options = tryUnpackData(await readStream(req.body));
  if (!options) return new NextResponse('Failed to parse request (insecure)', { status: 400 });
  const stream = aiProvider.ask(options);
  return sendNextResponseStream(stream);
}

export async function OPTIONS(req: NextRequest) {
  const _options = tryUnpackData<UniOptions & {key: string}>(await readStream(req.body));
  if (!_options) return new NextResponse('Failed to parse request', { status: 400 });
  const {key, ...options} = _options;
  if (key !== admin.config['bot-ask-key'].value) return new NextResponse('Unauthorized', { status: 400 });
  const stream = aiProvider.ask(options);
  return sendNextResponseStream(stream);
}
