import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { unpackData } from "@cch137/utils/shuttle";
import { readStream } from "@cch137/utils/stream";
import auth from "@/server/auth";
import type { StatusResponse } from "@/constants/types";
import AuthNext from "@/server/auth-next";
import getIp from "@cch137/utils/server/get-ip";
import RateLimiter from "@cch137/utils/server/rate-limiter";

const rateLimiter = new RateLimiter([{ maxCount: 5, timeMs: 60000 * 15 }]);

export async function POST(
  req: NextRequest
): Promise<NextResponse<StatusResponse>> {
  const ip = getIp(req);
  const rateCheck = rateLimiter.check(ip);
  if (!rateCheck.success) return NextResponse.json(rateCheck, { status: 429 });
  try {
    const { eadd, name, pass, code } = unpackData<{
      eadd: string;
      name: string;
      pass: string;
      code: string;
    }>(await readStream(req.body), 519746, 8);
    if (!eadd || !name || !pass || !code)
      return NextResponse.json({ success: false, message: "Form incompleted" });
    const { success: verifySuccess, message: verifyMessage } =
      auth.emailVerifier.verify(eadd, code);
    if (!verifySuccess)
      return NextResponse.json({ success: false, message: verifyMessage });
    const { success, message } = await auth.userManager.createUser(
      eadd,
      name,
      pass
    );
    if (!success) return NextResponse.json({ success: false, message });
    try {
      const token = await AuthNext.create(eadd, pass);
      const res = NextResponse.json({ success: true });
      token.setCookie(res);
      return res;
    } catch (e) {
      console.error(e);
      return NextResponse.json({
        success: false,
        message: e instanceof Error ? e.message : "Failed to sign in",
      });
    }
  } catch {
    return NextResponse.json({ success: false, message: "Form invalid" });
  }
}
