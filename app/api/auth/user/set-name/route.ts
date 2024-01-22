import type { NextRequest } from "next/server";
import { readString } from "@cch137/utils/stream";
import userManager from "@/app/api/services/auth/user-manager";
import type { StatusResponse } from "@/constants/types";
import authNext from "@/app/api/services/auth-next";

export async function POST(req: NextRequest) {
  const { success: success0, message: message0, value: token } = authNext.parse(req);
  const { id } = token || {};
  if (!success0 || !id) return await authNext.update<StatusResponse>(req, { success: false, message: message0 });
  const name = await readString(req.body);
  return await authNext.update(req, await userManager.setName(id, name));
}
