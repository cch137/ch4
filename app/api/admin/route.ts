import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import aiProvider from "../services/aichat/aiProvider";

async function handle(req: NextRequest) {
  try {
    const stream = aiProvider.ask({
      model: 'claude-2',
      messages: [{ role: 'user', text: 'Hi, I am Jack.' }]
    });
    await new Promise<void>((resolve) => {
      stream.addEventListener('end', () => resolve())
      stream.addEventListener('error', () => resolve())
    })
    return NextResponse.json({
      text: stream.read() || stream.lastError || 'unknown error'
    });
  } catch (err) {
    return NextResponse.json({ err });
  }
}

export {
  handle as GET,
  handle as POST,
}
