import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { unpackData } from "@cch137/utils/shuttle";
import { readStream } from "@cch137/utils/stream";
import auth from "@/server/auth";
import type { StatusResponse } from "@/constants/types";
import authNext from "@/server/auth-next";

export async function PUT(req: NextRequest): Promise<NextResponse<StatusResponse>> {
  try {
    // parse form
    const { eadd, pass, code } = unpackData<{eadd: string, pass: string, code: string}>(await readStream(req.body), 519746, 8)
    if (!eadd || !pass || !code) return NextResponse.json({ success: false, message: 'Form incompleted' });
    // verify email
    const { success: verifySuccess, message: verifyMessage } = auth.emailVerifier.verify(eadd, code);
    if (!verifySuccess) return NextResponse.json({ success: false, message: verifyMessage })
    // get user id
    const id = await auth.userManager.getUserIdByUserIdentity(eadd);
    if (!id) return NextResponse.json({ success: false, message: 'User does not exist' }); 
    // set password
    const { success, message } = await auth.userManager.setPassword(id, pass);
    if (!success) return NextResponse.json({ success: false, message });
    // login
    const { message: loginMessage, value: tokenString } = await auth.tokenizer.create(eadd, pass)
    return authNext.setToken({ success: true , message: message || loginMessage }, tokenString);
  } catch {
    return NextResponse.json({ success: false, message: 'Form invalid' })
  }
}
