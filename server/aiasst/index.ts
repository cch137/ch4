import AiAsstTrigger from "../mongoose/models/AiAsstTrigger";
import { type Trigger, USER_MAX_TRIGGERS, calcNextSche, fixIntv, fixMain, fixName, fixPlug, PluginObject, parsePlugins, PluginType } from "@/constants/asst";
import { userManager } from "../auth";
import formatDate from "@cch137/utils/format/date"
import { aiProvider } from "../aichat";
import mailer from "../auth/mailer";
import { marked } from "marked";

const defaultModel = 'gemini-pro';

const createTrigger = async (userId?: string) => {
  if (!userId) throw new Error('User Id is required');
  const hasUser = userManager.hasUserById(userId);
  const totalTrigger = countTriggerTotal(userId);
  if (!await hasUser) throw new Error('User Not Found');
  if (await totalTrigger >= USER_MAX_TRIGGERS) throw new Error(`Your triggers have reached the maximum limit: ${USER_MAX_TRIGGERS}`);
  const now = new Date();
  const strt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  try {
    const {_id} = await AiAsstTrigger.create({
      user: userId,
      name: 'New Trigger',
      type: 'mailer',
      modl: defaultModel,
      enbl: false,
      main: 'Hi.',
      strt,
      // endt: Date,
      intv: 0,
      plug: ['{"type":"time"}'],
      execlogs: [],
    });
    return _id.toHexString();
  } catch (e) {
    console.error(e);
    throw new Error('Failed to create trigger');
  }
}

const countTriggerTotal = async (userId?: string) => {
  if (!userId) return Infinity;
  return await AiAsstTrigger.countDocuments({ user: userId });
}

const getTriggerList = async (userId: string) => {
  if (!userId) return [];
  try {
    return await AiAsstTrigger.find({user: userId}, {_id: 1, name: 1, enbl: 1, intv: 1}).lean();
  } catch {}
  return [];
}

const getTrigger = async (userId: string, _id: string) => {
  if (!userId || !_id) return null;
  const trigger = await AiAsstTrigger.findOne({ user: userId, _id }).lean();
  return trigger ? {...trigger, _id: trigger?._id.toHexString()} as Trigger : null;
}

const deleteTrigger = async (userId: string, _id: string) => {
  if (!userId || !_id) return null;
  return await AiAsstTrigger.deleteOne({ user: userId, _id });
}

const updateTrigger = async ({_id, user, name, enbl, main, strt, intv, plug}: Trigger) => {
  if (!_id || !user) throw new Error('Trigger not found');
  strt = new Date(strt);
  intv = fixIntv(intv);
  const nextsche = calcNextSche(strt, intv);
  const nextScheIsNaN = isNaN(nextsche.getTime());
  await AiAsstTrigger.updateOne({ user, _id }, {
    $set: {
      name: fixName(name),
      enbl: Boolean(enbl),
      main: fixMain(main),
      strt, intv,
      plug: fixPlug(plug),
      ...nextScheIsNaN ? {} : {nextsche},
    },
    ...nextScheIsNaN ? {$unset: {nextsche: 1}} : {},
  });
}

const execGooglePlugin = async (query?: string) => {
  if (!query) return '';
  query = query.trim();
  if (!query) return '';
  const res = await fetch(`https://api.cch137.link/google-search-summary?query=${query}`);
  return await res.text();
}

const execCrawlPlugin = async (url?: string) => {
  if (!url) return '';
  url = url.trim();
  if (!url) return '';
  const res = await fetch(`https://api.cch137.link/crawl?url=${url}`);
  const {title='', description='', content=''}: {title: string, description: string, content: string} = await res.json();
  return `title: ${title}\n\ndescription: ${description}\n\ncontent: ${content}`;
}

const _execPlugin = async (type: PluginType, args: any[]) => {
  switch (type) {
    case 'text':
      return String(args[0]) || '';
    case 'google':
      return execGooglePlugin(...args);
    case 'time':
      return formatDate(new Date());
    case 'crawl':
      return execCrawlPlugin(...args);
  }
}

const execPlugin = async (type: PluginType, args: any[]) => {
  const result = await _execPlugin(type, args) || '';
  return `<Plugin type="${type}">\n${result || ''}\n</Plugin>\n`;
}

const execPlugins = async (plugins: string[] | PluginObject[]): Promise<string[]> => {
  return await Promise.all(plugins.map((_plugin) => {
    try {
      const {type, args} = typeof _plugin === 'string' ? JSON.parse(_plugin) as PluginObject : _plugin;
      return execPlugin(type, args);
    } catch (e) {
      return `<Plugin>\nExecution failed: ${e instanceof Error ? ': ' + e.message : ''}\n</Plugin>\n`;
    }
  }));
}

const testTrigger = async (userId: string, _id: string) => {
  const trigger = await getTrigger(userId, _id);
  if (!trigger) throw new Error('Trigger not found');
  const pluginsResult = (await execPlugins(trigger.plug)).join('\n');
  const prompt = `${trigger.main}\n\n${pluginsResult}`;
  return aiProvider.ask({messages: [{role: 'user', text: prompt}], temperature: 0, topP: 1, topK: 1, model: defaultModel}, defaultModel);
}

const execTrigger = async (trigger: Trigger) => {
  const {value} = await userManager.getUserDetailsById(trigger.user);
  const {eadd} = value || {};
  if (!eadd) throw new Error('User not found');
  const pluginsResult = (await execPlugins(trigger.plug)).join('\n');
  const prompt = `${trigger.main}\n\n${pluginsResult}`;
  const {_id, user, strt, intv, execlogs} = trigger;
  const t0 = Date.now();
  let log: string = '';
  try {
    const stream = aiProvider.ask({messages: [{role: 'user', text: prompt}], temperature: 0, topP: 1, topK: 1, model: defaultModel}, defaultModel);
    await stream.untilDone;
    mailer.sendHtml(eadd, `${trigger.name} - CH4`, await marked.parse(stream.read()));
    log = `Success at ${formatDate(new Date())} took ${Date.now() - t0} milliseconds to execute.`;
  } catch (e) {
    log = `Error (${e instanceof Error ? e.message : 'Unknown'}) at ${formatDate(new Date())} took ${Date.now() - t0} milliseconds to execute.`;
  } finally {
    const nextsche = calcNextSche(strt, intv);
    const nextScheIsNaN = isNaN(nextsche.getTime());
    const logs = [...execlogs, log];
    if (logs.length > 228) logs.unshift();
    await AiAsstTrigger.updateOne({ user, _id }, nextScheIsNaN ? {$unset: {nextsche: 1}} : {$set: {nextsche, execlogs: logs}});
  }
}

export const triggersManager = Object.freeze({
  createTrigger,
  getTriggerList,
  getTrigger,
  deleteTrigger,
  updateTrigger,
  testTrigger,
  execTrigger,
});
