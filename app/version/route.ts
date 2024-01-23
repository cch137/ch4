import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import fs from "fs"

export async function GET(req: NextRequest) {
  const { version } = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  return new NextResponse(version);
}
