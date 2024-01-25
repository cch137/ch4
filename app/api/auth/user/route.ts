import { NextResponse, type NextRequest } from "next/server";
import authNext from "@/server/auth-next";

export async function POST(req: NextRequest) {
  const token = authNext.parseRequestToken(req);
  const { id, name, auth } = token;
  const res = NextResponse.json({ success: true, value: { id, name, auth } });
  if (await token.transferUser(req)) authNext.removeOldTokenCookie(res);
  return res;
}
