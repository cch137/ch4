import { NextResponse, type NextRequest } from "next/server";
import { readString } from "@cch137/utils/stream";
import userManager from "@/server/auth/user-manager";
import AuthNext from "@/server/auth-next";

export async function PUT(req: NextRequest) {
  const token = AuthNext.parseRequestToken(req);
  if (!token.isAuthorized)
    return NextResponse.json({ success: false, message: "Unauthorized" });
  const name = await readString(req.body);
  const res = NextResponse.json(await userManager.setName(token.id, name));
  await token.check(true);
  token.setCookie(res);
  return res;
}
