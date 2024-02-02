import messageManager from "./message-manager";
import aiProvider from "./aiProvider";
import { NextResponse } from "next/server";
import Stream from "@cch137/utils/stream";

const aiChat = Object.freeze({
  messageManager,
  aiProvider,
});

export const sendNextResponseStream = (stream: Stream) => {
  try {
    const { writable, readable } = new TransformStream();
    const writer = writable.getWriter();
    const res = new NextResponse(readable, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      }
    });
    stream.pipe({
      data(s: any) {
        writer.write(s).catch(() => void 0);
      },
      end() {
        writer.close().catch(() => void 0);
      },
      error() {
        const error = stream.lastError;
        if (error instanceof Error) {
          writer.write(error.message).catch(() => void 0);
        }
      }
    });
    return res;
  } catch (e) {
    console.error('Failed to ask model:', e);
    return new NextResponse('Failed to ask model', { status: 500 });
  }
}

export {
  messageManager,
  aiProvider,
}

export default aiChat;
