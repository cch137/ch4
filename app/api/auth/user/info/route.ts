import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { StatusResponse, UserInfo } from "@/constants/types";
import authNext from "@/app/api/services/auth-next";
import { serialize } from "cookie";
import { OLD_TOKEN_COOKIE_NAME } from "@/constants/cookies";

type UserInfoResponse = StatusResponse<UserInfo>

async function handle(req: NextRequest) {
  const { success, message, value } = authNext.parse(req);
  if (success && value) {
    const { id, name } = value;
    const res = NextResponse.json({ success, message, value: { id, name } } as UserInfoResponse);
    res.headers.set('Set-Cookie', serialize(OLD_TOKEN_COOKIE_NAME, '', {maxAge: 0, path: '/'}));
    return res;
  }
  return await authNext._transferUser(req);
}

export {
  handle as GET,
  handle as POST,
}
