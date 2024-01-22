import { LOGIN_AGE_MS, CHECK_AGE_MS } from '@/constants/auth'
import { packDataWithHash, unpackDataWithHash } from "@cch137/utils/shuttle";
import type { StatusResponse } from '@/constants/types';
import userManager from './user-manager';
import { base64ToBase64Url, base64UrlToBase64 } from '@cch137/utils/format/base64'
import admin from '../admin';

const message_TokenNotValid = 'Token is not valid, please login again.';
const message_SessionExpired = 'Session expired, please login again.';

type Token = {
  id: string;
  name?: string;
  hashedPass?: string;
  auth?: number;
  created: Date;
  expired: Date; // if expired > now, check user id and hashedPass in database
  lastChecked: Date; // if lastChecked + LOGIN_AGE_MS < now, user needs to login again
}

type TokenArray = [
  string,
  string | undefined,
  string | undefined,
  number | undefined,
  Date,
  Date,
  Date,
]

const SALTS = admin.config['token-salts'];

const tokenArrayToToken = (token: TokenArray): Token => {
  const [id, name, hashedPass, auth, created, lastChecked, expired] = Array.isArray(token) ? token : [] as any[] as TokenArray;
  return {id, name, hashedPass, auth, created, lastChecked, expired}
}

const tokenToTokenArray = (token: Token): TokenArray => {
  const {id, name, hashedPass, auth, created, lastChecked, expired} = typeof token === 'object' ? token : {} as any as Token;
  return [id, name, hashedPass, auth, created, lastChecked, expired]
}

const isValidToken = (token: Token): token is Token => {
  if (typeof token !== 'object') return false;
  const { id, name, hashedPass, created, lastChecked, expired, auth } = token;
  if (typeof id !== 'string') return false;
  if (!['string', 'undefined'].includes(typeof name)) return false;
  if (!['string', 'undefined'].includes(typeof hashedPass)) return false;
  if (!['number', 'undefined'].includes(typeof auth)) return false;
  if (!(created instanceof Date)) return false;
  if (!(lastChecked instanceof Date)) return false;
  if (!(expired instanceof Date)) return false;
  return true;
}

const parseToken = (tokenString?: string): StatusResponse<Token> => {
  try {
    if (!tokenString) return { success: false, message: 'No token provided' }
    const token = tokenArrayToToken(unpackDataWithHash<TokenArray>(base64UrlToBase64(tokenString), 'MD5', SALTS.value))
    if (!isValidToken(token)) return { success: false, message: message_TokenNotValid }
    userManager.accessedUser(token.id)
    return { success: true, value: token }
  } catch (e) {
    console.error('Error occurs in parseToken:', e);
    return { success: false, message: message_TokenNotValid }
  }
}

const serializeToken = (token?: Token): StatusResponse<string> => {
  try {
    if (!token) throw new Error('Token is required')
    if (!isValidToken(token)) return { success: false, message: message_TokenNotValid }
    return { success: Boolean(token.auth), value: base64ToBase64Url(packDataWithHash(tokenToTokenArray(token), 'MD5', SALTS.value).toBase64()) }
  } catch (e) {
    return { success: false, message: 'Failed to serialize token' }
  }
}

const createToken = async (nameOrEadd: string, pass: string, hashed = false): Promise<StatusResponse<string>> => {
  const user = await userManager.getUserByUserIdentityAndPass(nameOrEadd, pass, hashed)
  if (!user) {
    if (await userManager.hasUserByUserIdentity(nameOrEadd)) return { success: false, message: 'Password incorrect' }
    return { success: false, message: 'User does not exist' }
  }
  const { id, name, pass: hashedPass, auth } = user
  const now = new Date()
  userManager.accessedUser(id)
  return serializeToken({
    id: id,
    name: name || void 0,
    hashedPass: hashedPass || void 0,
    created: now,
    lastChecked: now,
    expired: new Date(now.getTime() + CHECK_AGE_MS),
    auth: auth || void 0,
  })
}

const createTokenTemporary = async (id?: string): Promise<StatusResponse<string>> => {
  if (!id) return { success: false, message: 'Uid is required' };
  const now = new Date();
  userManager.accessedUser(id);
  return serializeToken({
    id: id,
    created: now,
    lastChecked: now,
    expired: new Date(now.getTime() + CHECK_AGE_MS),
  })
}

const updateToken = async (tokenString?: string, hashedPass?: string): Promise<StatusResponse<string>> => {
  const { value: token, success: parseTokenSuccess, message: parseTokenMessage } = parseToken(tokenString)
  if (!parseTokenSuccess || !token) return { success: false, message: parseTokenMessage || message_TokenNotValid }
  const now = new Date()
  const { id, expired, lastChecked, auth: _auth } = token
  if (expired < now) return serializeToken({ ...token, lastChecked: now })
  if (!_auth) return serializeToken({ ...token, lastChecked: now, expired: new Date(now.getTime() + CHECK_AGE_MS) })
  if (new Date(lastChecked.getTime() + LOGIN_AGE_MS) < now) return { success: false, message: message_SessionExpired }
  hashedPass ||= token.hashedPass
  const user = await userManager.getUserByIdAndHashedPass(id, hashedPass)
  if (!user || user.pass !== hashedPass) return serializeToken({ ...token, lastChecked: now, expired: now })
  const { name, auth } = user
  userManager.accessedUser(id)
  return serializeToken({
    ...token,
    hashedPass: hashedPass,
    name: name || void 0,
    auth: auth || void 0,
    expired: new Date(now.getTime() + CHECK_AGE_MS),
    lastChecked: now,
  })
}

import { d as trollDecrypt } from "@cch137/utils/troll"
const oldTokenReader = (() => {
  const seed = 168813145203000

  interface TokenObject {
    uid: string;
    ip: string;
    checked: number;
    authlvl?: number;
  }

  return function read (token?: string) {
    try {
      if (!token) return null;
      const encrypted = trollDecrypt(token, 1, seed)
      if (typeof encrypted === 'object' && encrypted !== null) {
        if ('user' in encrypted) {
          encrypted.uid = encrypted.user
          delete encrypted['user']
        }
        return encrypted as TokenObject
      }
    } catch {}
    return null
  }
})();

const tokenizer = {
  oldTokenReader,
  create: createToken,
  createTemp: createTokenTemporary,
  update: updateToken,
  isValid: isValidToken,
  parse: parseToken,
  serialize: serializeToken,
}

export type { Token }

export default tokenizer
