import { Trigger } from "@/constants/asst";
import { NextApiContext } from "@/constants/types";
import { triggersManager } from "@/server/aiasst";
import AuthNext from "@/server/auth-next";
import { packDataWithHash, unpackDataWithHash } from "@cch137/utils/shuttle";
import { readStream } from "@cch137/utils/stream";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(req: NextRequest, context: NextApiContext) {
  const { id: userId } = AuthNext.parseRequestToken(req);
  const triggerId = context?.params?.id || "";
  try {
    const trigger = await triggersManager.getTrigger(userId, triggerId);
    if (!trigger) throw new Error("Trigger not found");
    return new NextResponse(
      packDataWithHash(trigger, 256, 721663210, 20240202)
    );
  } catch {
    return NextResponse.json({ success: false, message: "Trigger not found" });
  }
}

export async function PUT(req: NextRequest, context: NextApiContext) {
  const { id: userId } = AuthNext.parseRequestToken(req);
  const triggerId = context?.params?.id || "";
  try {
    const trigger = unpackDataWithHash<Trigger>(
      await readStream(req.body),
      256,
      721663210,
      20240202
    );
    if (trigger._id !== triggerId) throw new Error("Trigger not found");
    if (trigger.user !== userId) throw new Error("Trigger not found");
    await triggersManager.updateTrigger(trigger);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({
      success: false,
      message: "Failed to update trigger",
    });
  }
}

export async function DELETE(req: NextRequest, context: NextApiContext) {
  const { id: userId } = AuthNext.parseRequestToken(req);
  const triggerId = context?.params?.id || "";
  try {
    await triggersManager.deleteTrigger(userId, triggerId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({
      success: false,
      message: "Failed to delete trigger",
    });
  }
}
