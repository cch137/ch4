import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { serialize } from "cookie"

import { TOKEN_COOKIE_NAME, OLD_TOKEN_COOKIE_NAME } from "@/constants/cookies";
import type { StatusResponse, StatusResponseV, UserInfo, UserProfile } from "@/constants/types";
import type { Token } from '../auth/tokenizer';
import { tokenizer, userManager } from '../auth';

function wrapNextRequest<T>(res?: T | NextResponse<T>, value?: T): NextResponse<T> {
  return value !== undefined
    ? NextResponse.json(value)
    : res instanceof NextResponse
      ? res
      : res !== undefined
        ? NextResponse.json(res)
        : new NextResponse();
}

class AuthNextResponse<T> implements StatusResponseV<NextResponse<T>> {
  success: boolean;
  value: NextResponse<T>;
  message?: string;

  constructor(status?: boolean | StatusResponse<T>, res?: T | NextResponse<T>) {
    if (typeof status === 'boolean') status = { success: status, value: { success: status } } as StatusResponse<T>;
    if (typeof status !== 'object') status = { success: false };
    if (typeof res === 'boolean') status.value = { success: res } as T, res = undefined;
    const { success = true, message, value } = status;
    this.success = success;
    this.message = message;
    this.value = wrapNextRequest(res || value, value);
  }

  setToken(token?: string | Token) {
    if (typeof token !== 'string') {
      token = tokenizer.serialize(token).value || '';
    }
    this.value.headers.set('Set-Cookie', serialize(
      TOKEN_COOKIE_NAME,
      token,
      token ? { httpOnly: true, secure: true, path: '/' } : { httpOnly: true, secure: true, maxAge: 0, path: '/' }
    ));
    return this;
  }

  setValue(value?: T | NextResponse<T>) {
    this.value = wrapNextRequest(value);
    return this;
  }

  setStatus(success: boolean, message?: string, value?: T) {
    this.success = success;
    this.message = message;
    if (arguments.length > 2) this.setValue(value);
    return this;
  }

  *[Symbol.iterator]() {
    yield ['success', this.success]
    yield ['message', this.message]
    yield ['value', this.value]
  }

  get status() {
    return {
      success: this.success,
      message: this.message,
      value: this.value
    } as StatusResponseV<T>
  }

  get res() {
    return this.value as NextResponse<T>;
  }
}

const _getTokenString = (req: NextRequest) => req.cookies.get(TOKEN_COOKIE_NAME)?.value;
const _getOldTokenString = (req: NextRequest) => req.cookies.get(OLD_TOKEN_COOKIE_NAME)?.value;

function _createAuthResponse<T>(res?: boolean, status?: boolean | StatusResponse<T>): AuthNextResponse<StatusResponse>
function _createAuthResponse<T>(res?: T | NextResponse<T>, status?: boolean | StatusResponse<T>): AuthNextResponse<T>
function _createAuthResponse<T>(res?: boolean | T | NextResponse<T>, status?: boolean | StatusResponse<T>) {
  return new AuthNextResponse(status, res);
}

const parseToken = (req: NextRequest) => tokenizer.parse(_getTokenString(req));
const updateToken = (req: NextRequest) => tokenizer.update(_getTokenString(req));

const _transferUser = async (req: NextRequest): Promise<NextResponse<StatusResponse<UserInfo>>> => {
  const oldTokenString = _getOldTokenString(req);
  if (oldTokenString) {
    const oldToken = tokenizer.oldTokenReader(oldTokenString);
    if (oldToken) {
      const { uid: oldId, authlvl: oldAuth } = oldToken;
      if ((oldAuth || 0) > 0) {
        const user = await userManager.getUserById(oldId);
        if (user) {
          const { eadd, pass, id, name } = user;
          if (eadd && pass) {
            const { value: tokenString } = await tokenizer.create(eadd, pass, true);
            const res = NextResponse.json({ success: true, value: { id, name: name || '' } });
            res.headers.set('Set-Cookie', serialize(OLD_TOKEN_COOKIE_NAME, '', {maxAge: 0, path: '/'}));
            if (tokenString) setResponseToken(res, tokenString);
            return res;
          }
        }
      }
    }
  }
  const { success: success1, message: message1, value: newId } = await userManager._createUserTemporary();
  const { success: success2, message: message2, value: tokenString } = await tokenizer.createTemp(newId);
  if (oldTokenString && newId) {
    const { uid: oldId } = tokenizer.oldTokenReader(oldTokenString) || {};
    if (oldId) {
      try {
        const messageManager = (await import('../aichat/message-manager')).default;
        await messageManager.transferConvs(oldId, newId);
      } catch {}
    }
  }
  if (success2 && tokenString) {
    const res = NextResponse.json({ success: true, value: { id: newId || '', name: '' } });
    res.headers.set('Set-Cookie', serialize(OLD_TOKEN_COOKIE_NAME, '', {maxAge: 0, path: '/'}));
    setResponseToken(res, tokenString);
    return res;
  };
  const res = NextResponse.json({ success: false, message: 'Failed to get user info' });
  res.headers.set('Set-Cookie', serialize(OLD_TOKEN_COOKIE_NAME, '', {maxAge: 0, path: '/'}));
  return res;
}

function setResponseToken<T>(res?: boolean, tokenString?: string): NextResponse<StatusResponse>
function setResponseToken<T>(res?: T | NextResponse<T>, tokenString?: string): NextResponse<T>
function setResponseToken<T>(res?: boolean | T | NextResponse<T>, tokenString?: string) {
  return _createAuthResponse(res).setToken(tokenString).res;
}

const logoutResponse = <T>(res?: T | NextResponse<T>) => _createAuthResponse(res, true).setToken().res;

async function updateResponse<T>(req: NextRequest, res: T | NextResponse<T>): Promise<NextResponse<T>>
async function updateResponse(req: NextRequest): Promise<NextResponse<StatusResponse>>
async function updateResponse<T>(req: NextRequest, res?: T | NextResponse<T>) {
  const { success, message, value: updatedTokenString } = await updateToken(req);
  const _res = updatedTokenString
    ? res === undefined
        ? setResponseToken({ success, message } as StatusResponse, updatedTokenString)
        : setResponseToken(res, updatedTokenString)
    : res === undefined
      ? NextResponse.json({ success, message })
      : wrapNextRequest(res)
  return _res
}

async function getUserProfile(req: NextRequest): Promise<StatusResponse<UserProfile>> {
  const { success, message, value: token } = parseToken(req);
  const { id } = token || {};
  if (!success || !id) return { success: false, message };
  const user = await userManager.getUserProfileById(id);
  if (!user) return { success: false, message: 'Failed to get user profile' };
  return { success: true, value: user }
}

const authNext = {
  parse: parseToken,
  updateToken,
  setToken: setResponseToken,
  logout: logoutResponse,
  update: updateResponse,
  getUserProfile,
  _transferUser,
}

export default authNext;
