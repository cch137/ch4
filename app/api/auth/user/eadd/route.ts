import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { unpackData } from "@cch137/utils/shuttle";
import { readJSON, readStream } from "@cch137/utils/stream";
import auth from "@/server/auth";
import type { StatusResponse } from "@/constants/types";
import getIp from '@cch137/utils/server/get-ip';
import RateLimiter from '@cch137/utils/server/rate-limiter';
import authNext from "@/server/auth-next";

const rateLimiter = new RateLimiter([
  { maxCount: 5, timeMs: 60000 * 30 },
]);

export async function PUT(req: NextRequest) {
  const ip = getIp(req);
  const rateCheck = rateLimiter.check(ip);
  if (!rateCheck.success) return NextResponse.json(rateCheck, { status: 429 });
  try {
    const { eadd, code } = await readJSON(req.body);
    if (!eadd || !code) return NextResponse.json({ success: false, message: 'Form incompleted' });
    const { success: verifySuccess, message: verifyMessage } = auth.emailVerifier.verify(eadd, code);
    if (!verifySuccess) return NextResponse.json({ success: false, message: verifyMessage });
    const token = authNext.parseRequestToken(req);
    if (!token.isAuthorized) return NextResponse.json({ success: false, message: 'Unauthorized' });
    const res = NextResponse.json(await auth.userManager.setEmail(token.id, eadd));
    await token.check(true);
    token.setCookie(res);
    return res;
  } catch {
    return NextResponse.json({ success: false, message: 'Form invalid' })
  }
}

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
