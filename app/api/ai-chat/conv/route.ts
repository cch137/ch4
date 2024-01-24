import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { messageManager } from "@/server/aichat";
import authNext from "../../../../server/auth-next";

async function handle(req: NextRequest) {
  const { value: token } = authNext.parse(req);
  if (!token) return NextResponse.json([]);
  const { id } = token;
  if (!id) return NextResponse.json([]);
  return NextResponse.json(await messageManager.getConvList(id));
}

export {
  handle as GET,
  handle as POST,
}
