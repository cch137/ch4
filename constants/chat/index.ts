import qs from "qs"
import type { ParsedQs } from "qs"
import type { ConvConfig, ModelType } from "./types";

const SIDEBAR_WIDTH = 285;
const CONTENT_MAX_W = 840;

const correctModelName = (model = '') => {
  if (/^gemini/i.test(model)) return 'gemini-pro';
  if (/^gpt[-_]?4/i.test(model)) return 'gpt-4';
  if (/^gpt[-_]?3/i.test(model)) return 'gpt-3.5-turbo';
  if (/^claude/i.test(model)) return 'claude-2';
  return 'gemini-pro';
}

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

const parseConvConfig = (conf: string = '') => {
  const {
    model,
    temperature = '0.3',
    context = 'true',
    modl: _modl = model,
    temp: _temp = temperature,
    topP: _topP,
    topK: _topK,
    ctxt: _ctxt = context !== 'false' ? '10' : '0',
  } = qs.parse(conf);
  const modl = correctModelName(qsItemToString(_modl));
  const temp = correctNumber(qsItemToString(_temp), 0, 1, 0.3);
  const topP = correctNumber(qsItemToString(_topP), 0, 1, 1);
  const topK = correctNumber(qsItemToString(_topK), 1, 16, 8);
  const ctxt = correctNumber(qsItemToString(_ctxt), 0, 16, 16);
  return { modl, temp, topP, topK, ctxt } as ConvConfig;
}

const serializeConvConfig = (conf: ConvConfig) => {
  const {
    modl: _modl,
    temp: _temp,
    topP: _topP,
    topK: _topK,
    ctxt: _ctxt,
  } = conf;
  const modl = correctModelName(_modl);
  const temp = correctNumber(_temp, 0, 1, 0.3);
  const topP = correctNumber(_topP, 0, 1, 1);
  const topK = correctNumber(_topK, 1, 16, 8);
  const ctxt = correctNumber(_ctxt, 0, 16, 16);
  return qs.stringify({ modl, temp, topP, topK, ctxt });
}

function correctConvConfig(config: ConvConfig): ConvConfig;
function correctConvConfig(config: string): string;
function correctConvConfig(config: ConvConfig | string): ConvConfig | string {
  if (typeof config === 'string') return serializeConvConfig(parseConvConfig(config));
  return parseConvConfig(serializeConvConfig(config));
}

const MIN_LEVEL = 0;
const LOGGED_IN_LEVEL = 1;

const models: ModelType[] = [
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
]

export {
  correctModelName,
  parseConvConfig,
  serializeConvConfig,
  correctConvConfig,
  models,
  SIDEBAR_WIDTH,
  CONTENT_MAX_W,
}