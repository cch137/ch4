import { NextResponse } from "next/server"
import { versionString } from "@/server/version";

export async function GET() {
  return new NextResponse(versionString);
}
