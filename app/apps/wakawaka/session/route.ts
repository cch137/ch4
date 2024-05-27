import { NextResponse, type NextRequest } from "next/server";
import AuthNext from "@/server/auth-next";
import admin from "@/server/admin";

export async function POST(req: NextRequest) {
  const token = AuthNext.parseRequestToken(req);
  const { info } = token;
  const res = await fetch("http://localhost:5000/wk/session", {
    method: "POST",
    body: JSON.stringify({
      uid: info.id,
      key: admin.config["bot-auth-key"].value,
    }),
    headers: { "Content-Type": "application/json" },
  });
  return new NextResponse(await res.text());
}
