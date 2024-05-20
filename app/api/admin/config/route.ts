import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import getRequestIp from "@cch137/utils/server/get-request-ip";
import RateLimiter from "@cch137/utils/rate-limiter";
import {
  getAdminConfig,
  setAdminItem,
  validAdminPasswordReq,
} from "@/server/admin";
import { readJSON } from "@cch137/utils/stream";

const rateLimiter = new RateLimiter([{ maxCount: 10, timeMs: 60000 * 15 }]);

export async function PUT(req: NextRequest) {
  const ip = getRequestIp(req);
  const rateCheck = rateLimiter.check(ip);
  if (!rateCheck.success) return NextResponse.json(rateCheck, { status: 429 });
  if (!validAdminPasswordReq(req))
    return NextResponse.json([], { status: 401 });
  const { name, value }: { name: string; value: any } = await readJSON(
    req.body
  );
  return NextResponse.json(await setAdminItem(name, value));
}

export async function POST(req: NextRequest) {
  const ip = getRequestIp(req);
  const rateCheck = rateLimiter.check(ip);
  if (!rateCheck.success) return NextResponse.json(rateCheck, { status: 429 });
  if (!validAdminPasswordReq(req))
    return NextResponse.json([], { status: 401 });
  return NextResponse.json(getAdminConfig());
}
