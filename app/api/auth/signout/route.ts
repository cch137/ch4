import AuthNext from "@/server/auth-next";
import { NextResponse } from "next/server";

export function POST() {
  const res = NextResponse.json({ success: true });
  AuthNext.removeTokenCookie(res);
  return res;
}
