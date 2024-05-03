import { NextResponse, type NextRequest } from "next/server";
import AuthNext from "@/server/auth-next";

export async function POST(req: NextRequest) {
  const token = AuthNext.parseRequestToken(req);
  const { info } = token;
  const res = NextResponse.json({ success: true, value: info });
  await token.check();
  token.setCookie(res);
  AuthNext.removeOldTokenCookie(req, res);
  return res;
}
