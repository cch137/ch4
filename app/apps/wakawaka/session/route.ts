import { NextResponse, type NextRequest } from "next/server";
import AuthNext from "@/server/auth-next";
import admin from "@/server/admin";

const apiUrl = "https://api.cch137.link/wk/session";
// const apiUrl = "http://localhost:5000/wk/session";

export async function POST(req: NextRequest) {
  const token = AuthNext.parseRequestToken(req);
  const { info } = token;
  const res = await fetch(apiUrl, {
    method: "POST",
    body: JSON.stringify({
      uid: info.id,
      key: admin.config["bot-auth-key"].value,
    }),
    headers: { "Content-Type": "application/json" },
  });
  return new NextResponse(await res.text());
}
