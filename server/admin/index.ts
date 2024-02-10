import { Admin } from '@/server/mongoose'
import Shuttle, { unpackDataWithHash } from '@cch137/utils/shuttle'
import type { NextRequest } from 'next/server'

class AdminItem<K = unknown, V = unknown> {
  readonly key: string
  defaultValue: V
  #value: V
  #eventTarget = new EventTarget()
  readonly init: Promise<void>

  constructor(key: K, defaultValue: V) {
    this.key = key as string;
    this.defaultValue = defaultValue;
    this.#value = defaultValue;
    this.init = (async() => {await this.fetch()})();
  }

  get value() {
    return this.#value;
  }

  async set(value: V) {
    const key = this.key;
    const oldValue = this.#value;
    if (oldValue === value) return value;
    this.#eventTarget.dispatchEvent(new Event('change'));
    this.#value = value;
    const buffer = Buffer.from(Shuttle.pack(value));
    await Admin.updateOne({ key }, { $set: { key, value: buffer } }, { upsert: true });
    return await this.fetch();
  }

  async fetch() {
    try {
      const item = await Admin.findOne({ key: this.key })
      if (!item) return this.defaultValue;
      const value = Shuttle.load<V>(new Uint8Array(item.value)).unpack();
      this.#value = value;
      return value;
    } catch {
      this.#eventTarget.dispatchEvent(new Event('error'));
      return this.defaultValue;
    }
  }

  onchange(callback: () => void) {
    return this.#eventTarget.addEventListener('change', callback);
  }

  onerror(callback: () => void) {
    return this.#eventTarget.addEventListener('error', callback);
  }
}

/** 
 * @param _dependencies - An array of AdminItem instances representing dependencies.
 * @param _constructor - A function that constructs and reconstructs the object based on dependencies.
 * @param _destructor - A function called when dependencies trigger onchange, before the new object is computed.
 * @param _errorConstructor - A function called when dependencies trigger onerror.
 */
export const adminProvider = async <I extends AdminItem,O>(
  _dependencies: I[] = [],
  _constructor: (items: readonly I[]) => O,
  _destructor?: (items: readonly I[]) => void,
  _errorConstructor?: (items: readonly I[]) => O,
) => {
  const dependencies = Object.freeze(_dependencies);
  await Promise.all(dependencies.map((dep) => {
    dep.onchange(() => {
      if (_destructor) _destructor(dependencies);
      obj.value = _constructor(dependencies);
    });
    if (_errorConstructor) dep.onerror(() => obj.value = _errorConstructor(dependencies));
    return dep.init;
  }));
  const obj = { value: _constructor(dependencies) };
  return obj;
}

type SearchEngine = 'google' | 'ddg';

const K01 = 'admin-password';
const K02 = 'search-engine';
const K03 = 'dc-bot-curva-run';
const K04 = 'dc-bot-curva-token';
const K05 = 'nodemailer-email';
const K06 = 'nodemailer-password';
const K07 = 'token-salts';
const K08 = 'gpt-provider0-host'; // mikuapi
const K09 = 'gpt-provider0-key';  // mikuapi
const K10 = 'gpt-provider1-host'; // freegptasia
const K11 = 'gpt-provider1-key';  // freegptasia
const K12 = 'gemini-key';
const K13 = 'bot-auth-key';

export const config = Object.freeze({
  [K01]: new AdminItem(K01, ''),
  [K02]: new AdminItem(K02, 'google' as SearchEngine),
  [K03]: new AdminItem(K03, false),
  [K04]: new AdminItem(K04, ''),
  [K05]: new AdminItem(K05, ''),
  [K06]: new AdminItem(K06, ''),
  [K07]: new AdminItem(K07, [] as number[]),
  [K08]: new AdminItem(K08, ''),
  [K09]: new AdminItem(K09, ''),
  [K10]: new AdminItem(K10, ''),
  [K11]: new AdminItem(K11, ''),
  [K12]: new AdminItem(K12, ''),
  [K13]: new AdminItem(K13, ''),
});
await Promise.all(Object.values(config).map(i => i.init));

export const validAdminPasswordReq = (req: NextRequest) => {
  const _p = req.headers.get('a');
  if (!_p) return false;
  try {
    const p = unpackDataWithHash<string>(_p, 256, 407717888, 137);
    return p && p === config[K01].value;
  } catch {}
  return false;
}

export const getAdminConfig = () => {
  const obj: [string, any][] = [];
  // @ts-ignore
  for (const k in config) obj.push([k, config[k].value]);
  return obj;
}

export const setAdminItem = async <K extends string, V>(name: K, value: V) => {
  // @ts-ignore
  const item: AdminItem<K,V> | undefined = config[name];
  if (!item) return;
  return await item.set(value);
}

export const validBotAuthKey = (s?: string | null) => {
  return s === config['bot-auth-key'].value;
}

export default Object.freeze({
  config,
  validBotAuthKey,
});