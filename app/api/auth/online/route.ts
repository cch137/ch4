import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import getRequestIp from "@cch137/utils/server/get-request-ip";
import RateLimiter from "@cch137/utils/rate-limiter";
import { userManager } from "@/server/auth";
import { readJSON } from "@cch137/utils/stream";
import { packDataWithHash } from "@cch137/utils/shuttle";

const rateLimiter = new RateLimiter([{ maxCount: 10, timeMs: 60000 }]);

export async function POST(req: NextRequest) {
  const ip = getRequestIp(req);
  const rateCheck = rateLimiter.check(ip);
  if (!rateCheck.success) return NextResponse.json(rateCheck, { status: 429 });
  const { lastMs }: { lastMs?: number } = (await readJSON(req.body)) || {};
  return new NextResponse(
    packDataWithHash(
      await userManager.getOnlineUsers(lastMs),
      256,
      371117069,
      1681681688
    )
  );
}
