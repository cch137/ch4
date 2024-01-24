import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { unpackData } from "@cch137/utils/shuttle";
import { readStream } from "@cch137/utils/stream";
import auth from "@/server/auth";
import type { StatusResponse } from "@/constants/types";
import getIp from '@cch137/utils/server/get-ip';
import RateLimiter from '@cch137/utils/server/rate-limiter';

export async function PUT(req: NextRequest) {
  return NextResponse.json({ success: false, message: 'This functionality is not currently supported.' })
}

const rateLimiter = new RateLimiter([
  { maxCount: 5, timeMs: 60000 * 30 },
]);

export async function POST(req: NextRequest): Promise<NextResponse<StatusResponse>> {
  const ip = getIp(req);
  const rateCheck = rateLimiter.check(ip);
  if (!rateCheck.success) return NextResponse.json(rateCheck, { status: 429 });
  try {
    const { action, eadd } = unpackData<{action: number, eadd: string}>(await readStream(req.body), 377417, 666)
    switch (action) {
      case 0: // has
        const isVerifying = auth.emailVerifier.has(eadd)
        return NextResponse.json({ success: isVerifying, message: isVerifying ? undefined : 'Not verifying' })
      case 1: // create
        return NextResponse.json(await auth.emailVerifier.create(eadd))
    }
    return NextResponse.json({ success: false, message: 'Unknown action' })
  } catch {
    return NextResponse.json({ success: false, message: 'Form invalid' })
  }
}
