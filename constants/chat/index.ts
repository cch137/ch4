import qs, { type ParsedQs } from "qs"
import type { ConvConfig, ModelType } from "./types";

export const SIDEBAR_WIDTH = 285;
export const CONTENT_MAX_W = 840;

const correctNumber = (item: string | number | undefined | null, minValue: number, maxValue: number, defaultValue: number) => {
  if (item === undefined || item === null) return defaultValue;
  const parsed = Number(item);
  if (isNaN(parsed)) return defaultValue;
  if (parsed > maxValue) return maxValue;
  if (parsed < minValue) return minValue;
  return parsed;
}

const qsItemToString = (item?: string | string[] | ParsedQs | ParsedQs[]) => {
  if (typeof item === 'string') return item;
  return undefined;
}

export const DEFAULT_CONV_CONFIG: ConvConfig = Object.freeze({
  modl: 'gemini-pro',
  temp: 0.3,
  ctxt: 16,
  topP: 1,
  topK: 8,
});
const c = DEFAULT_CONV_CONFIG;

export const getDefConvConfig = (): ConvConfig => ({...c});

export const correctModelName = (model = '') => {
  if (/^gemini/i.test(model)) return 'gemini-pro';
  if (/^gpt[-_]?4/i.test(model)) return 'gpt-4';
  if (/^gpt[-_]?3/i.test(model)) return 'gpt-3.5-turbo';
  if (/^claude/i.test(model)) return 'claude-2';
  return c.modl;
}

export const parseConvConfig = (conf: string = '') => {
  const {
    model,
    temperature = '0.3',
    context = 'true',
    modl: _modl = model,
    temp: _temp = temperature,
    topP: _topP,
    topK: _topK,
    ctxt: _ctxt = context !== 'false' ? '16' : '0',
  } = qs.parse(conf);
  const modl = correctModelName(qsItemToString(_modl));
  const temp = correctNumber(qsItemToString(_temp), 0, 1, c.temp);
  const topP = correctNumber(qsItemToString(_topP), 0, 1, c.topP);
  const topK = correctNumber(qsItemToString(_topK), 1, 16, c.topK);
  const ctxt = correctNumber(qsItemToString(_ctxt), 0, 16, c.ctxt);
  return { modl, temp, topP, topK, ctxt } as ConvConfig;
}

export const serializeConvConfig = (conf: ConvConfig) => {
  const {
    modl: _modl,
    temp: _temp,
    topP: _topP,
    topK: _topK,
    ctxt: _ctxt,
  } = conf;
  const modl = correctModelName(_modl);
  const temp = correctNumber(_temp, 0, 1, c.temp);
  const topP = correctNumber(_topP, 0, 1, c.topP);
  const topK = correctNumber(_topK, 1, 16, c.topK);
  const ctxt = correctNumber(_ctxt, 0, 16, c.ctxt);
  return qs.stringify({ modl, temp, topP, topK, ctxt });
}

function correctConvConfig(config: ConvConfig): ConvConfig;
function correctConvConfig(config: string): string;
function correctConvConfig(config: ConvConfig | string): ConvConfig | string {
  if (typeof config === 'string') return serializeConvConfig(parseConvConfig(config));
  return parseConvConfig(serializeConvConfig(config));
}
export { correctConvConfig };

const MIN_LEVEL = 0;

export const models: ModelType[] = [
  {
    name: 'Gemini-Pro',
    value: 'gemini-pro',
    configKeys: ['temp','topP','topK','ctxt'],
    permissionLevel: MIN_LEVEL,
  },
  {
    name: 'GPT-3.5-Turbo',
    value: 'gpt3',
    configKeys: ['temp','topP','ctxt'],
    permissionLevel: MIN_LEVEL,
  },
  {
    name: 'GPT-4',
    value: 'gpt4',
    configKeys: ['temp','topP','topK','ctxt'],
    permissionLevel: MIN_LEVEL,
  },
  {
    name: 'Claude-2',
    value: 'claude-2',
    configKeys: ['temp','topP','topK','ctxt'],
    permissionLevel: MIN_LEVEL,
  },
];
