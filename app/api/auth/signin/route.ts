import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { unpackData } from "@cch137/utils/shuttle";
import { readStream } from "@cch137/utils/stream";
import AuthNext from "@/server/auth-next";
import getRequestIp from "@cch137/utils/server/get-request-ip";
import RateLimiter from "@cch137/utils/rate-limiter";

const rateLimiter = new RateLimiter([{ maxCount: 5, timeMs: 60000 * 15 }]);

export async function POST(req: NextRequest) {
  const ip = getRequestIp(req);
  const rateCheck = rateLimiter.check(ip);
  if (!rateCheck.success) return NextResponse.json(rateCheck, { status: 429 });
  try {
    const { user: u = "", pass = "" } = unpackData<{
      user: string;
      pass: string;
    }>(await readStream(req.body), 70614, 1);
    if (!u || !pass)
      return NextResponse.json({ success: false, message: "Form incompleted" });
    try {
      const token = await AuthNext.create(u, pass);
      const res = NextResponse.json({ success: true });
      token.setCookie(res);
      return res;
    } catch (e) {
      return NextResponse.json({
        success: false,
        message: e instanceof Error ? e.message : "Failed to sign in",
      });
    }
  } catch {
    return NextResponse.json({ success: false, message: "Form invalid" });
  }
}
