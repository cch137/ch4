import { NextRequest, NextResponse } from "next/server";
import { aiProvider } from "@/server/aichat";
import authNext from "@/server/auth-next";
import { unpackData } from "@cch137/utils/shuttle";
import type { UniOptions } from "@cch137/utils/ai/types";
import { readStream } from "@cch137/utils/stream";
import getIp from '@cch137/utils/server/get-ip';
import RateLimiter from '@cch137/utils/server/rate-limiter';

const rateLimiter = new RateLimiter([
  { maxCount:  10, timeMs: 60000 },
  { maxCount: 100, timeMs: 60000 * 15 },
  { maxCount: 300, timeMs: 60000 * 60 },
  { maxCount: 500, timeMs: 60000 * 60 * 4 },
  { maxCount: 999, timeMs: 60000 * 60 * 24 },
]);

const tryUnpackData = (array: Uint8Array) => {
  try {
    return unpackData<UniOptions>(array, 4141414141, 4242424242);
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
  try {
    const { writable, readable } = new TransformStream();
    const writer = writable.getWriter();
    const res = new NextResponse(readable, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      }
    });
    const stream = aiProvider.ask(options);
    stream.pipe({
      data(s: any) {
        writer.write(s);
      },
      end() {
        writer.close();
      },
      error() {
        const error = stream.lastError;
        if (error instanceof Error) {
          writer.write(error.message);
        }
      }
    });
    return res;
  } catch (e) {
    console.error('Failed to ask model:', e);
    return new NextResponse('Failed to ask model', { status: 500 });
  }
}
