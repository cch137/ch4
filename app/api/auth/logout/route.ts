import authNext from "@/server/auth-next";
import { NextResponse } from "next/server";

function handle() {
  const res = NextResponse.json({ success: true });
  authNext.removeTokenCookie(res);
  return res;
}

export {
  handle as GET,
  handle as POST,
}
