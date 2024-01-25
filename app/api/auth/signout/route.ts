import authNext from "@/server/auth-next";
import { NextResponse } from "next/server";

export function POST() {
  const res = NextResponse.json({ success: true });
  authNext.removeTokenCookie(res);
  return res;
}
