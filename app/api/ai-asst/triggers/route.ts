import { triggersManager } from "@/server/aiasst";
import authNext from "@/server/auth-next";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { id: userId } = authNext.parseRequestToken(req);
  return NextResponse.json(await triggersManager.getTriggerList(userId));
}

export async function PUT(req: NextRequest) {
  const { id: userId } = authNext.parseRequestToken(req);
  try {
    const newTriggerId = await triggersManager.createTrigger(userId);
    return NextResponse.json({success: true, value: newTriggerId});
  } catch (e) {
    return NextResponse.json({success: false, message: e instanceof Error ? e.message : 'Failed to create trigger'});
  }
}
