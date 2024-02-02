import { CONTENT_MAX_W } from '../app'

export {CONTENT_MAX_W};

export const USER_MAX_TRIGGERS = 3;

export const AIASST_PATH = '/apps/ai-asst/';

export const AIASST_TRIGGERS_PATH = '/apps/ai-asst/triggers/';

export const AIASST_DESC = 'A timer-based task executor based on AI, used for scheduled emails, with AI capable of browsing the internet.';

export const AIASST_DESC_LINES = [
  'Scheduled AI Task Trigger,',
  'capable of setting scheduled emails,',
  'with internet browsing capability.',
];

export type PluginType = 'text' | 'google' | 'crawl' | 'time';

export type PluginObject = {
  type: PluginType;
  args: any[];
}

export type PluginDef = {
  name: string;
  desc: string;
  args: string[];
}

export const pluginDefs = new Map<PluginType,PluginDef>([
  ['text', {
    name: 'Plain text',
    desc: 'A piece of text appended to prompt.',
    args: ['content'],
  }],
  ['google', {
    name: 'Google search',
    desc: 'Provide Google search results. You can search for weather, stock prices, exchange rates, and other information.',
    args: ['query'],
  }],
  ['time', {
    name: 'Time',
    desc: 'Provide current time.',
    args: [],
  }],
  ['crawl', {
    name: 'Crawl URL',
    desc: 'Fetch the webpage of the given URL.',
    args: ['url'],
  }],
]);

export type Trigger = {
  _id: string;
  user: string;
  name: string;
  enbl: boolean;
  modl: string;
  main: string;
  strt: Date;
  // endt: Date;
  intv: number;
  plug: string[];
  nextsche: Date;
  execlogs: string[];
}

export type TriggerItem = {
  _id: string;
  name: string;
  enbl: boolean;
  intv: number;
}

const _removeUndefined = <T>(arr: (T|undefined)[]): T[] => arr.filter(i => i !== undefined) as T[];

export const MIN_TRIGGER_INTERVAL = 60 * 60 * 1000;

export const fixName = (s: string) => String(s).trim().substring(0, 256);
export const fixMain = (s: string) => String(s).trim().substring(0, 100_000_000);
export const fixIntv = (intv: number) => intv === 0
  ? 0
  : intv < MIN_TRIGGER_INTERVAL
    ? MIN_TRIGGER_INTERVAL
    : isNaN(intv)
      ? 0
      : intv === Infinity
        ? 0
        : intv;

export const calcNextSche = (strt: Date, interval: number, executed = false): Date => {
  const now = Date.now();
  interval = fixIntv(interval);
  if (interval === 0) return strt.getTime() <= now ? new Date(NaN) : strt;
  if (now <= strt.getTime()) return new Date(strt);
  const strtTimestamp = strt.getTime();
  const nthPeriod = Math.ceil((now - strtTimestamp) / interval);
  const nextSche = new Date(strtTimestamp + (interval + (executed ? 1 : 0)) * nthPeriod);
  if (nextSche.getTime() < strt.getTime() + MIN_TRIGGER_INTERVAL) return executed ? new Date(NaN) : calcNextSche(strt, interval, true);
  return nextSche;
}

export const constructPlugin = <T extends PluginType, A extends any[]>(type: T, args?: A): PluginObject | undefined => {
  try {
    if (!args) return constructPlugin(type, []);
    switch (type as PluginType) {
      case 'text': {
        const [content] = args;
        if (typeof content !== 'string') throw new Error('Arguments invalid');
        return {type: 'text', args: [content]};
      }
      case 'google': {
        const [query] = args;
        if (typeof query !== 'string') throw new Error('Arguments invalid');
        return {type: 'google', args: [query]};
      }
      case 'time': {
        return {type: 'time', args: []};
      }
      case 'crawl': {
        const [url] = args;
        if (typeof url !== 'string') throw new Error('Arguments invalid');
        return {type: 'crawl', args: [url]};
      }
    }
  } catch {}
}

export const parsePlugins = (s: string[]) => {
  try {
    const plugins: PluginObject[] = s.map(i => JSON.parse(i));
    return _removeUndefined(plugins.map(({type, args}) => constructPlugin(type, args)));
  } catch {}
  return [];
}

export const serializePlugins = (plugins: (PluginObject|undefined)[]) => {
  try {
    return _removeUndefined(plugins).map(({type, args}) => JSON.stringify(constructPlugin(type, args)));
  } catch {}
  return [];
}

export const fixPlug = (s: string[]) => {
  try {
    const plugins: PluginObject[] = s.map(i => JSON.parse(i));
    return _removeUndefined(plugins.map(({type, args}) => JSON.stringify(constructPlugin(type, args))));
  } catch {}
  return [];
}
