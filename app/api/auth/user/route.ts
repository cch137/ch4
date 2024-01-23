import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { StatusResponse, UserInfo } from "@/constants/types";
import authNext from "@/app/api/services/auth-next";
import { serialize } from "cookie";
import { OLD_TOKEN_COOKIE_NAME } from "@/constants/cookies";

export async function GET(req: NextRequest) {
  const { success, message, value: token } = authNext.parse(req);
  if (success && token) {
    const { id, name = '', auth } = token;
    const res = NextResponse.json<StatusResponse<UserInfo>>({ success, message, value: { id, name, auth } });
    res.headers.set('Set-Cookie', serialize(OLD_TOKEN_COOKIE_NAME, '', {maxAge: 0, path: '/'}));
    return res;
  }
  return await authNext._transferUser(req);
}

