import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { StatusResponse, UserInfo } from "@/constants/types";
import authNext from "@/server/auth-next";

export async function GET(req: NextRequest) {
  const token = authNext.parseRequestToken(req);
  const { id, name = '', auth } = token;
  const res = NextResponse.json<StatusResponse<UserInfo>>({ success: true, value: { id, name, auth } });
  if (await token.transferUser(req)) authNext.removeOldTokenCookie(res);
  return res;
}
