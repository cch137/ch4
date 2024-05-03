import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { unpackData } from "@cch137/utils/shuttle";
import { readStream } from "@cch137/utils/stream";
import auth from "@/server/auth";
import type { StatusResponse } from "@/constants/types";
import AuthNext from "@/server/auth-next";

export async function PUT(
  req: NextRequest
): Promise<NextResponse<StatusResponse>> {
  try {
    // parse form
    const { eadd, pass, code } = unpackData<{
      eadd: string;
      pass: string;
      code: string;
    }>(await readStream(req.body), 519746, 8);
    if (!eadd || !pass || !code)
      return NextResponse.json({ success: false, message: "Form incompleted" });
    // verify email
    const { success: verifySuccess, message: verifyMessage } =
      auth.emailVerifier.verify(eadd, code);
    if (!verifySuccess)
      return NextResponse.json({ success: false, message: verifyMessage });
    // get user id
    const id = await auth.userManager.getUserIdByUserIdentity(eadd);
    if (!id)
      return NextResponse.json({
        success: false,
        message: "User does not exist",
      });
    // set password
    const { success, message } = await auth.userManager.setPassword(id, pass);
    if (!success) return NextResponse.json({ success: false, message });
    // sign in
    try {
      const token = await AuthNext.create(eadd, pass);
      const res = NextResponse.json({ success: true });
      token.setCookie(res);
      return res;
    } catch (e) {
      console.error(e);
      return NextResponse.json({
        success: false,
        message:
          e instanceof Error ? e.message : message || "Failed to sign in",
      });
    }
  } catch {
    return NextResponse.json({ success: false, message: "Form invalid" });
  }
}
