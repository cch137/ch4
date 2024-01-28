'use client';

import { useEffect, useState } from 'react';

import store, { type StoreType } from '@cch137/utils/dev/store';
import Broadcaster from '@cch137/utils/dev/broadcaster';
import type { UniOptions } from '@cch137/utils/ai';
import { wrapMessages } from '@cch137/utils/ai/utils';
import { packData } from '@cch137/utils/shuttle';

import { ConvCompleted, ConvItem, MssgItem, SaveMssg, SendMssg } from '@/constants/chat/types';
import { StatusResponse } from '@/constants/types';
import {
  parseConvConfig,
  getDefConvConfig,
  serializeConvConfig,
} from '@/constants/chat';

import { vers, versionStore } from './useVersion';

export const errorBroadcaster = new Broadcaster<{message: string, title?: string}>('ai-chat-error');

const _handleErrorMessage = (message: string, title?: string) => {
  errorBroadcaster.broadcast({ message, title });
}

const handleError = (e?: any) => {
  if (e instanceof Error) return _handleErrorMessage(e.message);
  if (typeof e === 'string') return _handleErrorMessage(e);
  console.error(e);
}

export const aiChatHandleError = handleError;

// todos:
// - no autofocus when touchscreen

const chat = store({
  convTail: undefined as string | undefined,
  currentConv: undefined as ConvItem | undefined,
  conversations: [] as ConvItem[],
  messages: [] as MssgItem[],
  tailMessage: undefined as MssgItem | undefined,
  convConfig: getDefConvConfig(),
  isAnswering: false,
  isStoping: false,
  isLoadingConv: false,
  isLoadingConvList: false,
  isUpdatingConv: false,
  isRenamingConv: false,
}, async () => {
  versionStore.$init();
  return {
    conversations: await fetchConvList(),
  }
}, {
  initAfterOn: true,
});

export {
  chat as aiChatStore,
}

let _updateConvTimeout: NodeJS.Timeout;
export const updateConv = async (_conf = chat.convConfig, post = true) => {
  const id = chat.currentConv?.id;
  if (!id) return;
  chat.convConfig = {..._conf};
  if (post) {
    clearTimeout(_updateConvTimeout);
    _updateConvTimeout = setTimeout(async () => {
      try {
        chat.isUpdatingConv = true;
        const conf = serializeConvConfig(_conf);
        await fetch(`/api/ai-chat/conv/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ conf })
        });
      } catch (e) {
        handleError(e);
      } finally {
        chat.isUpdatingConv = false;
      }
    }, 1000);
  }
}

export const renameConv = async (id?: string, name = '') => {
  if (!id) return true;
  name = name.trim();
  try {
    const status = await (await fetch(`/api/ai-chat/conv/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name })
    })).json() as StatusResponse;
    const { success, message } = status;
    if (!success || message) throw new Error(message || 'Failed to rename conversation.');
    if (success) chat.$assign((o) => ({
      conversations: o.conversations.map(c => c.id === id ? { ...c, name } : c)
    }));
    fetchConvList(false).then((l) => chat.conversations = l);
    return true;
  } catch (e) {
    handleError(e);
    return false;
  }
}

export const deleteConv = async (id?: string) => {
  if (!id) return true;
  try {
    const status = await (await fetch(`/api/ai-chat/conv/${id}`, {
      method: 'DELETE'
    })).json() as StatusResponse;
    const { success, message } = status;
    if (!success || message) throw new Error(message || 'Failed to delete conversation.');
    if (success) {
      chat.$assign((o) => ({
        conversations: o.conversations.filter(c => c.id !== id)
      }));
      if (id === chat.currentConv?.id) loadConv();
    }
    return true;
  } catch (e) {
    handleError(e);
    return false;
  }
}

export const editMessage = async (msg: MssgItem) => {
  const convId = chat.currentConv?.id;
  if (!convId) return true;
  const msgId = msg._id;
  try {
    const status: StatusResponse = await (await fetch(`/api/ai-chat/conv/${convId}/${msgId}`, {
      method: 'PUT',
      body: JSON.stringify(msg)
    })).json();
    const { success, message } = status;
    if (!success) throw new Error(message || 'Failed to edit message.');
    chat.messages = chat.messages.map(m => m._id === msgId ? { ...m, ...msg } : m);
    return true;
  } catch (e) {
    handleError(e);
    return false;
  }
}

export const deleteMessage = async (msg: MssgItem) => {
  const convId = chat.currentConv?.id;
  if (!convId) return true;
  const msgId = msg._id;
  try {
    const status: StatusResponse = await (await fetch(`/api/ai-chat/conv/${convId}/${msgId}`, {
      method: 'DELETE',
    })).json();
    const { success, message } = status;
    if (!success) throw new Error(message || 'Failed to delete message.');
    chat.messages = chat.messages.filter(m => m._id !== msgId);
    return true;
  } catch (e) {
    handleError(e);
    return false;
  }
}

const _sortMessages = (messages: MssgItem[]) => messages.sort((a, b) => (a.ctms || 0) - (b.ctms || 0));

export async function loadConv(id?: string | ConvItem): Promise<void> {
  if (!id) {
    chat.$assign({
      isLoadingConv: false,
      isAnswering: false,
      currentConv: undefined,
      messages: [],
      convConfig: getDefConvConfig(),
      convTail: undefined,
    });
    return;
  };
  if (typeof id === 'object') return await loadConv(id.id);
  if (id === chat.currentConv?.id) return;
  const conv = chat.conversations.find(c => c.id === id);
  if (!conv) return await loadConv();
  chat.$assign({
    isLoadingConv: true,
    currentConv: conv,
    messages: [],
    convTail: undefined,
  });
  try {
    const {
      name,
      conf,
      tail: convTail,
      messages = [],
    }: ConvCompleted = await (await fetch(`/api/ai-chat/conv/${id}`, {method: 'POST'})).json();
    chat.$assign((o) => ({
      currentConv: { ...o.currentConv, id, name },
      messages: _sortMessages(messages),
      convConfig: parseConvConfig(conf),
      convTail,
    }));
  } catch {
    handleError('Failed to load conversation.');
    return await loadConv();
  } finally {
    chat.$assign({
      isLoadingConv: false,
      isAnswering: false,
    });
  }
}

const _askAiModel = async (options: UniOptions) => {
  const t0 = Date.now();
  const getDtms = () => Date.now() - t0;
  const chunks = store([] as string[]);
  const decoder = new TextDecoder('utf8');
  let readTimeout: NodeJS.Timeout;
  const extendTimeout = () => {
    clearTimeout(readTimeout);
    return setTimeout(() => handleError('Response Timeout'), 60000);
  }
  const controller = new AbortController();
  const res = await fetch('/api/ai-chat/ask', {
    method: 'POST',
    body: packData<UniOptions>(options, 4141414141, 4242424242),
    signal: controller.signal,
  });
  if (!res.body) throw new Error('Failed to request');
  const reader = res.body.getReader();
  const promise = new Promise<{dtms:number}>(async (resolve) => {
    readTimeout = extendTimeout();
    while (true) {
      try {
        const { value, done } = await reader.read();
        if (done) break;
        const chunkText = decoder.decode(value);
        chunks.push(chunkText);
        readTimeout = extendTimeout();
      } catch (e) {
        if (controller.signal.aborted) break;
        console.error(`Failed to read response${e instanceof Error ? ': ' + e.message : ''}`);
      }
    }
    clearTimeout(readTimeout);
    resolve({dtms: getDtms()});
  });
  const value = {
    get answer() {return chunks.join('')},
    get dtms() {return getDtms()},
    chunks,
    promise,
    controller,
  }
  return value;
}

const _askConvName = async (q = 'Hi', a = 'Hi') => {
  try {
    const prompt = `Please generate a short title for the conversation:\nquestion:\n${q}\n\nanswer:\n${a}`;
    const res = await _askAiModel({messages: wrapMessages(prompt), temperature: 0});
    await res.promise;
    const name = res.answer;
    try {return `${JSON.parse(name)}`} catch {}
    return name;
  } catch {}
  return '';
}

const _insertMessage = async (message: SaveMssg) => {
  try {
    const status = await (await fetch('/api/ai-chat/insert-message', {
      method: 'POST',
      body: packData(message, 54715471, 77455463),
    })).json() as StatusResponse<MssgItem>;
    const mssg = status.value;
    if (!status.success || !mssg) throw new Error(`Failed to insert message: ${status.message || 'Unknown'}`);
    chat.messages = _sortMessages([...chat.messages, mssg]);
    if (message.root === chat.convTail) updateTail(mssg._id);
    return mssg;
  } catch (e) {
    handleError(e);
  }
}

export const updateTail = (tail?: string) => {
  const convId = chat.currentConv?.id;
  if (!convId) return;
  chat.convTail = tail;
  fetch(`/api/ai-chat/conv/${convId}`, {
    method: 'PUT',
    body: JSON.stringify({ tail })
  });
}

const _createConv = async () => {
  try {
    const res = await fetch('/api/ai-chat/conv', {method: 'PUT'});
    const newConvId = (await res.json() as StatusResponse<string>).value;
    if (!newConvId) throw new Error('Failed to create a new conversation.');
    chat.conversations = [{id: newConvId}, ...chat.conversations];
    return newConvId;
  } catch (e) {
    handleError(e);
    throw e;
  }
}

let _stopGeneration = async () => {};

/**
 * Ask steps:
 * 1. If question not in `messages`, insert question, if new conv is needed, create it.
 * 2. If new answer message needed, insert a temp message to `message`, temp id is a rand key.
 * 3. Lock the messages.
 * 4. Ask AI model, update the answer message.
 * 5. Save the answer message.
 * 6. Unlock the messages.
 */
export async function askAiFromInput(msg: SendMssg, autoRenameConv = false): Promise<{
  readonly answer: string;
  readonly dtms: number;
  chunks: StoreType<string[]>;
  promise: Promise<{
      dtms: number;
  }>;
  controller: AbortController;
} | undefined> {
  try {
    chat.$assign({
      isAnswering: true,
      isStoping: false,
    });
    const {root, text: question} = msg;
    const conv = chat.currentConv?.id;
    if (!conv) {
      const newConvId = await _createConv();
      if (!newConvId) {
        loadConv()
        throw new Error('Failed to create new conversation.');
      };
      chat.currentConv = { id: newConvId };
      return await askAiFromInput(msg, true);
    }
    const insertedQuestion = await _insertMessage({root, text: question, conv, vers: vers()});
    if (!insertedQuestion) throw new Error('Failed to insert message.');
    const {convConfig, messages} = chat;
    const {length: end} = messages;
    const {modl, temp, topP, topK, ctxt} = convConfig;
    const options: UniOptions = {
      messages: messages.slice(end - ctxt - 1, end).map((m) => ({
        role: typeof m.modl === 'string' ? 'model' : 'user',
        text: m.text,
      })),
      model: modl,
      temperature: temp,
      topP,
      topK,
    };
    const res = await _askAiModel(options);
    if (chat.isStoping) res.controller.abort();
    chat.tailMessage = {_id: 'TEMP', text: '', modl: chat.convConfig.modl};
    res.chunks.$on(() => chat.tailMessage = {...chat.tailMessage as MssgItem, text: res.answer});
    _stopGeneration = async () => {
      _stopGeneration = async () => {};
      res.controller.abort();
    }
    res.promise
      .then(async ({dtms}) => {
        const answer = res.answer;
        if (!answer) throw new Error('Model refused to respond');
        const insertedAnswer = await _insertMessage({
          root: insertedQuestion._id,
          text: answer, conv, vers: vers(), dtms, modl,
        });
        if (!insertedAnswer) throw new Error('Failed to insert message.');
        if (autoRenameConv) {
          _askConvName(question, answer).then((name) => renameConv(conv, name));
        }
      })
      .catch((e) => {
        handleError(e);
      })
      .finally(() => {
        _stopGeneration = async () => {};
        chat.$assign({
          isAnswering: false,
          isStoping: false,
          tailMessage: undefined,
        });
      })
    return res;
  } catch (e) {
    handleError(e);
    chat.$assign({
      isAnswering: false,
      isStoping: false,
      tailMessage: undefined,
    });
  }
}

export function stopGeneration() {
  chat.isStoping = true;
  _stopGeneration();
}

export async function askAiFromMessages() {
  handleError('This function is not supported.');
}

export async function fetchConvList(useLoading = true) {
  try {
    chat.isLoadingConvList = useLoading;
    const res = await fetch('/api/ai-chat/conv', {method: 'POST'});
    return (await res.json() as ConvItem[]).sort((a, b) => (b?.mtms || 0) - (a?.mtms || 0));
  } catch {
    handleError('Failed to fetch conversation list.');
    return [];
  } finally {
    chat.isLoadingConvList = false;
  }
};

export function useAiChatPage() {
  const [currentConv, _currentConv] = useState(chat.currentConv);

  useEffect(() => {
    return chat.$on((o) => {
      _currentConv(o.currentConv ? {...o.currentConv} : void 0);
    });
  }, []);

  return {
    currentConv,
  };
};

export function useAiChatConv() {
  const [currentConv, _currentConv] = useState(chat.currentConv);
  const [isLoadingConv, _isLoadingConv] = useState(chat.isLoadingConv);

  useEffect(() => {
    return chat.$on((o) => {
      _currentConv(o.currentConv ? {...o.currentConv} : void 0);
      _isLoadingConv(o.isLoadingConv);
    });
  }, []);

  return {
    currentConv,
    isLoadingConv,
  };
};

export function useAiChatConvList() {
  const [currentConv, _currentConv] = useState(chat.currentConv);
  const [conversations, _conversations] = useState(chat.conversations);
  const [isLoadingConvList, _isLoadingConvList] = useState(chat.isLoadingConvList);

  useEffect(() => {
    return chat.$on((o) => {
      _currentConv(o.currentConv ? {...o.currentConv} : void 0);
      _conversations([...o.conversations]);
      _isLoadingConvList(o.isLoadingConvList);
    });
  }, []);

  return {
    currentConv,
    conversations,
    isLoadingConvList,
  };
};

export function useAiChatConvConfig() {
  const [convConfig, _convConfig] = useState(chat.convConfig);
  const [isLoadingConv, _isLoadingConv] = useState(chat.isLoadingConv);
  const [isLoadingConvList, _isLoadingConvList] = useState(chat.isLoadingConvList);

  useEffect(() => {
    return chat.$on((o) => {
      _convConfig({...o.convConfig});
      _isLoadingConv(o.isLoadingConv);
      _isLoadingConvList(o.isLoadingConvList);
    });
  }, []);

  return {
    convConfig,
    isLoadingConv,
    isLoadingConvList,
  };
};

export function useAiChatInputConsole() {
  const [convTail, _convTail] = useState(chat.convTail);
  const [isAnswering, _isAnswering] = useState(chat.isAnswering);
  const [isStoping, _isStoping] = useState(chat.isStoping);

  useEffect(() => {
    return chat.$on((o) => {
      _convTail(o.convTail);
      _isAnswering(o.isAnswering);
      _isStoping(o.isStoping);
    });
  }, []);

  return {
    convTail,
    isAnswering,
    isStoping,
  };
};

export function useAiChatContent() {
  const [currentConv, _currentConv] = useState(chat.currentConv);
  const [messages, _messages] = useState(chat.messages);
  const [tailMessage, _tailMessage] = useState(chat.tailMessage);
  const [isAnswering, _isAnswering] = useState(chat.isAnswering);
  const [isLoadingConv, _isLoadingConv] = useState(chat.isLoadingConv);

  useEffect(() => {
    return chat.$on((o) => {
      _currentConv(o.currentConv ? {...o.currentConv} : void 0);
      _messages([...o.messages]);
      _tailMessage(o.tailMessage ? {...o.tailMessage} : void 0);
      _isAnswering(o.isAnswering);
      _isLoadingConv(o.isLoadingConv);
    });
  }, []);

  return {
    currentConv,
    messages,
    tailMessage,
    isAnswering,
    isLoadingConv,
  };
};
