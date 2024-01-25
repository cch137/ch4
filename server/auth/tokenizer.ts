import { SIGNIN_AGE_MS, CHECK_AGE_MS } from '@/constants/auth'
import { packDataWithHash, unpackDataWithHash } from "@cch137/utils/shuttle";
import userManager from './user-manager';
import { base64ToBase64Url, base64UrlToBase64 } from '@cch137/utils/format/base64'
import admin from '../admin';
import { d as trollDecrypt } from "@cch137/utils/troll"

const readOldToken = (() => {
  const seed = 168813145203000
  type OldTokenObject = {
    uid: string;
    ip: string;
    checked: number;
    authlvl?: number;
  }
  return function read(token?: string) {
    try {
      if (!token) return null;
      const encrypted = trollDecrypt(token, 1, seed)
      if (typeof encrypted === 'object' && encrypted !== null) {
        if ('user' in encrypted) {
          encrypted.uid = encrypted.user
          delete encrypted['user']
        }
        return encrypted as OldTokenObject
      }
    } catch {}
    return null
  }
})();

type TokenType = {
  id: string;
  name: string;
  hashedPass: string;
  auth: number;
  created: Date;
  /** if checkNeeded > now, check user id and hashedPass in database */
  checkNeeded: Date;
  /** if lastChecked + SIGNIN_AGE_MS < now, user needs to sign in again */
  lastChecked: Date; 
}

type TokenArrayType = [
  string,
  string,
  string,
  number,
  Date,
  Date,
  Date,
]

type AnyTokenType = TokenType | TokenArrayType | string | undefined;

const SALTS = admin.config['token-salts'];

const tokenArrayToToken = (token: TokenArrayType): TokenType => {
  const [id, name, hashedPass, auth, created, lastChecked, expired] = token;
  return {id, name, hashedPass, auth, created, lastChecked, checkNeeded: expired}
}

const tokenToTokenArray = (token: TokenType): TokenArrayType => {
  const {id, name, hashedPass, auth, created, lastChecked, checkNeeded: expired} = token;
  return [id, name, hashedPass, auth, created, lastChecked, expired]
}

class Token implements TokenType {id: string;
  name: string;
  hashedPass: string;
  auth: number;
  created: Date;
  checkNeeded: Date;
  lastChecked: Date;

  constructor(token?: AnyTokenType) {
    if (typeof token === 'string') token = unpackDataWithHash<TokenArrayType>(base64UrlToBase64(token), 'MD5', SALTS.value);
    if (Array.isArray(token)) token = tokenArrayToToken(token);
    const now = new Date();
    const {
      id = '',
      name = '',
      hashedPass = '',
      auth = 0,
      created = now,
      lastChecked = now,
      checkNeeded: expired = now,
    } = token || {};
    this.id = id;
    this.name = name;
    this.hashedPass = hashedPass;
    this.auth = auth;
    this.created = created;
    this.lastChecked = lastChecked;
    this.checkNeeded = expired;
    if (this.isExpired) this.clear();
  }

  clear() {
    this.id = '';
    this.name = '';
    this.hashedPass = '';
    this.auth = 0;
    this.checkNeeded = new Date;
    return false;
  }

  accessUser() {
    userManager.accessedUser(this.id);
    return true;
  }

  extend(access = true): true {
    this.checkNeeded = new Date(Date.now() + CHECK_AGE_MS);
    if (access) this.accessUser();
    return true;
  }

  get isCheckNeeded() {
    return this.checkNeeded < new Date;
  }

  get isExpired() {
    return new Date(this.lastChecked.getTime() + SIGNIN_AGE_MS) < new Date;
  }

  get isSignedIn() {
    return this.auth > 0;
  }

  get isTempUser() {
    return !this.auth && this.id;
  }

  get isAuthorized() {
    return this.isSignedIn || this.isTempUser;
  }

  async check(forceUpdate = false) {
    this.lastChecked = new Date;
    if (!this.isCheckNeeded && !forceUpdate) return this.accessUser();
    if (this.isTempUser) return this.extend();
    if (this.isExpired) return this.clear();
    const user = await userManager.getUserByIdAndHashedPass(this.id, this.hashedPass)
    if (!user || user.pass !== this.hashedPass) return this.clear();
    const { name, auth } = user;
    this.name = name || '';
    this.auth = auth || 0;
    return this.extend();
  }

  toArray() {
    return tokenToTokenArray(this);
  }

  toString() {
    return Token.serialize(this);
  }

  static parseOldToken = readOldToken;

  static parse(token: AnyTokenType) {
    return new Token(token);
  }

  static serialize(token: AnyTokenType): string {
    if (typeof token !== 'object' || Array.isArray(token)) return Token.parse(token).toString();
    try {
      return base64ToBase64Url(packDataWithHash(tokenToTokenArray(token), 'MD5', SALTS.value).toBase64());
    } catch {
      return '';
    }
  }

  static async createTempToken() {
    const { value: newId = '', message } = await userManager._createUserTemporary();
    if (!newId) throw new Error('Failed to create temporary user' + message ? `: ${message}` : '');
    const token = new Token();
    token.id = newId;
    token.extend();
    return token;
  }

  static async create(nameOrEadd: string, pass: string, hashed = false) {
    const user = await userManager.getUserByUserIdentityAndPass(nameOrEadd, pass, hashed)
    if (!user) {
      if (await userManager.hasUserByUserIdentity(nameOrEadd)) throw new Error('Password incorrect');
      throw new Error('User does not exist');
    }
    const { id, name, pass: hashedPass, auth } = user;
    const now = new Date();
    userManager.accessedUser(id);
    return new Token({
      id: id,
      name: name || '',
      hashedPass: hashedPass || '',
      auth: auth || 0,
      created: now,
      lastChecked: now,
      checkNeeded: new Date(now.getTime() + CHECK_AGE_MS),
    });
  }
}

export type { TokenType, TokenArrayType, AnyTokenType };

export default Token;
