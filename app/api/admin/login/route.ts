import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import getRequestIp from "@cch137/utils/server/get-request-ip";
import RateLimiter from "@cch137/utils/rate-limiter";
import { validAdminPasswordReq } from "@/server/admin";

const rateLimiter = new RateLimiter([{ maxCount: 5, timeMs: 60000 * 15 }]);

export async function POST(req: NextRequest) {
  const ip = getRequestIp(req);
  const rateCheck = rateLimiter.check(ip);
  if (!rateCheck.success) return NextResponse.json(rateCheck, { status: 429 });
  return NextResponse.json({ success: validAdminPasswordReq(req) });
}
