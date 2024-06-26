import { type NextRequest, NextResponse } from "next/server";
import AuthNext from "@/server/auth-next";
import getRequestIp from "@cch137/utils/server/get-request-ip";
import RateLimiter from "@cch137/utils/rate-limiter";
import { sendNextResponseStream } from "@/server/aichat";
import { type NextApiContext } from "@/constants/types";
import { triggersManager } from "@/server/aiasst";

const rateLimiter = new RateLimiter([{ maxCount: 5, timeMs: 60000 * 2 }]);

export async function POST(req: NextRequest, context: NextApiContext) {
  const ip = getRequestIp(req);
  const rateCheck = rateLimiter.check(ip);
  if (!rateCheck.success)
    return new NextResponse(rateCheck.message, { status: 429 });
  const { id: userId } = AuthNext.parseRequestToken(req);
  const triggerId = context?.params?.id || "";
  if (!userId)
    return new NextResponse(
      "Unauthorized, please sign in or refresh the page.",
      { status: 401 }
    );
  try {
    return sendNextResponseStream(
      await triggersManager.testTrigger(userId, triggerId)
    );
  } catch (e) {
    return new NextResponse(
      `Failed to execute trigger: ${
        e instanceof Error ? e.message : "Unknwon"
      }`,
      { status: 500 }
    );
  }
}
