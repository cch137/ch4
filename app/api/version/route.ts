import { NextResponse } from "next/server"
import version from "@/server/version";

const v = version.toString();

export async function GET() {
  return new NextResponse(v);
}
