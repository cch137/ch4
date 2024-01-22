import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  return NextResponse.json({ success: false, message: 'This functionality is not currently supported.' })
}
