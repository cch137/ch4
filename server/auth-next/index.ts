import type { NextRequest, NextResponse } from "next/server";
import messageManager from '../aichat/message-manager';
import Token from '../auth/tokenizer';
import { TOKEN_COOKIE_NAME, OLD_TOKEN_COOKIE_NAME } from "@/constants/cookies";

const getTokenString = (req: NextRequest) => req.cookies.get(TOKEN_COOKIE_NAME)?.value;

class NextCh4Token extends Token {
  static parseRequestToken(req: NextRequest) {
    return new NextCh4Token(getTokenString(req));
  }

  static async create(nameOrEadd: string, pass: string, hashed?: boolean) {
    return new NextCh4Token(await Token.create(nameOrEadd, pass, hashed));
  }

  static setCookie(_token: Token, res: NextResponse) {
    const token = _token.toString();
    res.cookies.set({
      name: TOKEN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: true,
      path: '/',
    });
  }

  static removeTokenCookie(res: NextResponse) {
    res.cookies.delete(TOKEN_COOKIE_NAME);
  }

  static removeOldTokenCookie(req: NextRequest, res: NextResponse) {
    if (req.cookies.has(OLD_TOKEN_COOKIE_NAME)) res.cookies.delete(OLD_TOKEN_COOKIE_NAME);
  }

  setCookie(res: NextResponse) {
    return NextCh4Token.setCookie(this, res);
  }
}

const authNext = NextCh4Token;

export default authNext;
