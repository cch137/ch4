"use client";

import { useEffect, useState } from "react";

import store from "@cch137/utils/dev/store";
import Broadcaster from "@cch137/utils/dev/broadcaster";
import type { UniOptions } from "@cch137/utils/ai";
import { wrapMessages } from "@cch137/utils/ai/utils";
import { packDataWithHash } from "@cch137/utils/shuttle";
import { analyzeLanguages } from "@cch137/utils/lang/analyze-languages";
import wrapStreamResponse from "@cch137/utils/crawl/wrap-stream-response";

import { ConvCompleted, ConvItem, MssgItem } from "@/constants/chat/types";
import { StatusResponse } from "@/constants/types";
import {
  TEMP,
  parseConvConfig,
  getDefConvConfig,
  serializeConvConfig,
  correctModelName,
  MAX_CTXT,
  isTempMsgId,
} from "@/constants/chat";

import { vers, versionStore } from "./useVersion";
import random from "@cch137/utils/random";
import { userInfoCache } from "./useUserInfo";

type action = "send" | "stream";
export const answerBroadcaster = new Broadcaster<action>("ai-chat-answer");
export const errorBroadcaster = new Broadcaster<{
  message: string;
  title?: string;
}>("ai-chat-error");

const boardcastAnsweringSignal = (signal: action = "stream") => {
  answerBroadcaster.broadcast(signal);
};

const _handleErrorMessage = (message: string, title?: string) => {
  errorBroadcaster.broadcast({ message, title });
};

const handleError = (e?: any) => {
  if (e instanceof Error) return _handleErrorMessage(e.message);
  if (typeof e === "string") return _handleErrorMessage(e);
  console.error(e);
};

export const aiChatHandleError = handleError;

const lastUser = store({ value: userInfoCache.id });
const chat = store(
  {
    convTail: null as string | null,
    currentConv: undefined as ConvItem | undefined,
    conversations: [] as ConvItem[],
    messages: [] as Message[],
    currentThread: [] as Message[],
    convConfig: getDefConvConfig(),
    isAnswering: false,
    isStoping: false,
    isDeletingMessage: false,
    isLoadingConv: false,
    isLoadingConvList: false,
    isUpdatingConv: false,
    isRenamingConv: false,
  },
  async () => {
    versionStore.$init();
    if (skippedInit || !userInfoCache.id) return;
    skippedInit = true;
    return {
      conversations: await fetchConvList(!getChatIsInited()),
    };
  },
  {
    initAfterOn: true,
    lazyUpdate: true,
    updateInterval: 15 * 60 * 1000,
  }
);

const getChatIsInited = (): boolean => chat.$inited;

let skippedInit = false;
userInfoCache.$on((o) => {
  if (userInfoCache.id !== lastUser.value) {
    skippedInit = false;
    chat.$assign({ $inited: false });
    chat.$update();
  }
  if (userInfoCache.id) {
    lastUser.value = userInfoCache.id;
  }
  return;
});

export { chat as aiChatStore };

const sortMessagesByCtms = (messages: Message[]) =>
  messages.sort((a, b) => (a.source.ctms || 0) - (b.source.ctms || 0));

const getConvId = () => chat.currentConv?.id;

const findMessage = (_id?: string | null): Message | undefined =>
  _id ? chat.messages.find((m) => m._id === _id) : void 0;

const findMessagesByRoot = (root?: string): Message[] =>
  sortMessagesByCtms(
    chat.messages.filter((m) => (root ? m.root === root : !m.root))
  );

const guessMaxInputToken = (_model?: string) => {
  switch (correctModelName(_model)) {
    case "gpt-3.5-turbo":
      return 4000;
    case "gpt-4":
      return 8000;
    case "gemini-pro":
      return 8000;
    case "claude-2":
      return 80000;
  }
};

const countToken = (msgs: string | Message | Message[]): number => {
  if (typeof msgs === "string")
    return countToken(new Message({ text: msgs, _id: "", conv: "" }));
  if (!Array.isArray(msgs)) return countToken([msgs]);
  const sampleText = msgs.map((m) => m.source.text).join("\n\n");
  const langs = analyzeLanguages(sampleText);
  let tokens = 0;
  for (const lang in langs) {
    const percentage = langs[lang];
    const weight = lang === "en" ? 0.25 : 1;
    tokens = sampleText.length * percentage * weight;
  }
  return Math.ceil(tokens * 1.1);
};

export const getMessageTree = (
  msg: Message,
  length = Infinity,
  model?: string
) => {
  const history = [...msg.parentTree, msg];
  const maxToken = guessMaxInputToken(model);
  while (
    length === Infinity &&
    countToken(history) > maxToken &&
    history.length > 1
  ) {
    history.shift();
  }
  return history.map((m) => ({
    role: m.isModel ? "model" : "user",
    text: m.source.text,
  }));
};

const updateTail = (tail?: string) => {
  if ((chat.convTail || null) === (tail || null)) return;
  chat.convTail = tail || null;
  const convId = getConvId();
  if (!convId || isTempMsgId(tail)) return;
  fetch(`/api/ai-chat/conv/${convId}`, {
    method: "PUT",
    body: JSON.stringify({ tail }),
  });
};

const updateMessages = (messages?: Message[]): void => {
  if (!messages) return updateMessages([...chat.messages]);
  chat.$assign({
    messages,
    currentThread: chat.currentThread.filter((m) => messages.includes(m)),
  });
  const tailMessage = chat.currentThread.at(-1);
  if (!tailMessage) {
    const _tailMessage = findMessage(chat.convTail);
    if (_tailMessage) _tailMessage.select();
    else updateTail();
  } else if (messages.includes(tailMessage)) {
    tailMessage.select();
  } else {
    updateTail();
  }
};

const generateTempMessageId = () => `${TEMP}-${random.base64(16)}`;

class Message {
  readonly source: MssgItem;

  get _id() {
    return this.source._id;
  }
  get root() {
    return this.source.root;
  }
  get conv() {
    return this.source.conv;
  }

  get isModel() {
    return typeof this.source.modl === "string";
  }
  get isTemp() {
    return isTempMsgId(this._id);
  }

  constructor(source: MssgItem) {
    this.source = source;
  }

  get parent() {
    return findMessage(this.root);
  }

  get children() {
    return findMessagesByRoot(this._id);
  }

  get siblings() {
    return this.parent?.children || findMessagesByRoot();
  }

  get nthChild() {
    const { siblings } = this;
    return siblings.indexOf(this);
  }

  gotoSibling(step: number) {
    const { siblings } = this;
    const nth = siblings.indexOf(this);
    let goto = Math.max(0, Math.min(nth + step, siblings.length - 1));
    siblings[goto].select();
  }

  get selectedChild(): Message | undefined {
    const { currentThread } = chat;
    const { length } = currentThread;
    for (let i = 0; i < length; i++) {
      if (currentThread[i] === this) return currentThread[i + 1];
    }
  }

  set selectedChild(child) {
    if (!child) return;
    child.select();
  }

  get selectedChildIndex(): number {
    const { selectedChild } = this;
    if (!selectedChild) return -1;
    return this.children.indexOf(selectedChild);
  }

  set selectedChildIndex(index) {
    const { children } = this;
    const selected = children.at(index < 0 ? 0 : index) || children.at(-1);
    if (selected) selected.select();
  }

  get parentTree() {
    const thread: Message[] = [];
    let parent = this.parent;
    while (parent) {
      thread.unshift(parent);
      parent = parent.parent;
    }
    return thread;
  }

  get childTree() {
    const thread: Message[] = [];
    let children = this.children;
    while (true) {
      const child = children.at(-1);
      if (!child) break;
      thread.push(child);
      children = child.children;
    }
    return thread;
  }

  get thread(): Message[] {
    return [...this.parentTree, this, ...this.childTree];
  }

  async edit(text: string) {
    this.source.text = text;
    updateMessages();
    if (this.isTemp) return false;
    return await this.save();
  }

  async save() {
    if (this.isTemp) {
      try {
        const {
          success,
          message,
          value: mssg,
        } = (await (
          await fetch("/api/ai-chat/insert-message", {
            method: "POST",
            body: packDataWithHash(
              { ...this.source, vers: vers() },
              256,
              54715471,
              77455463
            ),
          })
        ).json()) as StatusResponse<MssgItem>;
        if (!success || !mssg)
          throw new Error(`Failed to insert message: ${message || "Unknown"}`);
        const oldId = this.source._id;
        Object.assign(this.source, mssg);
        const newId = this.source._id;
        chat.messages.forEach((m) => {
          if (m.root === oldId) m.source.root = newId;
        });
        updateMessages();
        return true;
      } catch (e) {
        handleError(e);
        return false;
      }
    } else {
      try {
        const { success, message }: StatusResponse = await (
          await fetch(`/api/ai-chat/conv/${this.conv}/${this._id}`, {
            method: "PUT",
            body: packDataWithHash(
              { ...this.source, vers: vers() },
              256,
              54715471,
              77455463
            ),
          })
        ).json();
        if (!success) throw new Error(message || "Failed to edit message.");
        return true;
      } catch (e) {
        handleError(e);
        return false;
      }
    }
  }

  async delete() {
    if (chat.isDeletingMessage) return false;
    const _id = this._id;
    const parentId = this.parent?._id;
    for (const child of this.children) child.source.root = parentId;
    updateMessages(chat.messages.filter((m) => m._id !== _id));
    if (this.isTemp) return true;
    try {
      chat.isDeletingMessage = true;
      const status: StatusResponse = await (
        await fetch(`/api/ai-chat/conv/${this.conv}/${this._id}`, {
          method: "DELETE",
        })
      ).json();
      const { success, message } = status;
      if (!success) throw new Error(message || "Failed to delete message.");
      return true;
    } catch (e) {
      handleError(e);
      return false;
    } finally {
      chat.isDeletingMessage = false;
    }
  }

  async regenerate() {
    if (!this.isModel) return;
    return await askQuestion(this.parent || "");
  }

  select() {
    const thread = this.thread;
    chat.currentThread = thread;
    updateTail(thread.at(-1)?._id);
  }
}

export type { Message };

let lastAutoCreatedConvId: string | undefined;
const _createConv = async () => {
  try {
    const res = await fetch("/api/ai-chat/conv", { method: "PUT" });
    const newConvId = ((await res.json()) as StatusResponse<string>).value;
    if (!newConvId) throw new Error("Failed to create a new conversation.");
    lastAutoCreatedConvId = newConvId;
    chat.$assign({
      currentConv: { id: newConvId },
      conversations: [{ id: newConvId }, ...chat.conversations],
    });
    updateConv();
    return newConvId;
  } catch (e) {
    handleError(e);
    throw e;
  }
};

export const addMessage = async (
  message: Partial<MssgItem>
): Promise<Message> => {
  const {
    text = "",
    conv = getConvId(),
    _id = generateTempMessageId(),
    ctms = Date.now(),
  } = message;
  if (!conv) {
    const conv = await _createConv();
    if (!conv) {
      loadConv();
      throw new Error("Failed to create new conversation.");
    }
    return await addMessage({ ...message, text, conv, _id, ctms });
  }
  const m = new Message({ ...message, text, conv, _id, ctms });
  updateMessages([...chat.messages, m]);
  return m;
};

export const askQuestion = async (
  _question: Message | string,
  root?: string
) => {
  if (chat.isAnswering) return;
  try {
    chat.$assign({
      isAnswering: true,
      isStoping: false,
    });
    const question =
      typeof _question === "string"
        ? await addMessage({ text: _question, root })
        : _question;
    const questionSaved = question.isTemp ? question.save() : void 0;
    if (questionSaved)
      questionSaved.then(() => (answer.source.root = question._id));
    const { modl, temp, topP, topK, ctxt } = chat.convConfig;
    const answer = await addMessage({ modl, root: question._id });
    answer.select();
    const options: UniOptions = {
      messages: getMessageTree(
        question,
        ctxt === MAX_CTXT ? Infinity : ctxt + 1,
        modl
      ),
      model: modl,
      temperature: temp,
      topP,
      topK,
    };
    const res = await _askAiModel(options);
    if (chat.isStoping) res.controller.abort();
    boardcastAnsweringSignal("send");
    res.chunks.$on(() => {
      answer.edit(res.answer);
      boardcastAnsweringSignal();
    });
    _stopGeneration = async () => {
      _stopGeneration = async () => {};
      res.controller.abort();
    };
    res.promise
      .then(async ({ dtms }) => {
        answer.source.dtms = dtms;
        if (!answer.source.text) {
          answer.source.text = "Model does not respond.";
          return handleError(answer.source.text);
        }
        await questionSaved;
        await answer.save();
      })
      .finally(async () => {
        chat.$assign({
          isAnswering: false,
          isStoping: false,
        });
        _stopGeneration = async () => {};
        const newConvId = lastAutoCreatedConvId;
        if (newConvId === getConvId()) {
          lastAutoCreatedConvId = undefined;
          const convName = await _askConvName(
            question.source.text,
            answer.source.text
          );
          renameConv(newConvId, convName);
        }
      });
    return Object.freeze({ res, question, answer });
  } catch (e) {
    handleError(e);
    chat.$assign({
      isAnswering: false,
      isStoping: false,
    });
  }
};

let _updateConvTimeout: NodeJS.Timeout;
export const updateConv = async (_conf = chat.convConfig, post = true) => {
  const id = chat.currentConv?.id;
  chat.convConfig = { ..._conf };
  if (!id) return;
  if (post) {
    clearTimeout(_updateConvTimeout);
    _updateConvTimeout = setTimeout(async () => {
      try {
        chat.isUpdatingConv = true;
        const conf = serializeConvConfig(_conf);
        await fetch(`/api/ai-chat/conv/${id}`, {
          method: "PUT",
          body: JSON.stringify({ conf }),
        });
      } catch (e) {
        handleError(e);
      } finally {
        chat.isUpdatingConv = false;
      }
    }, 1000);
  }
};

export const renameConv = async (id?: string, name = "") => {
  if (!id) return true;
  name = name.trim();
  try {
    const status = (await (
      await fetch(`/api/ai-chat/conv/${id}`, {
        method: "PUT",
        body: JSON.stringify({ name }),
      })
    ).json()) as StatusResponse;
    const { success, message } = status;
    if (!success || message)
      throw new Error(message || "Failed to rename conversation.");
    if (success)
      chat.$assign((o) => ({
        conversations: o.conversations.map((c) =>
          c.id === id ? { ...c, name } : c
        ),
      }));
    fetchConvList(false).then((l) => (chat.conversations = l));
    return true;
  } catch (e) {
    handleError(e);
    return false;
  }
};

export const deleteConv = async (id?: string) => {
  if (!id) return true;
  try {
    const status = (await (
      await fetch(`/api/ai-chat/conv/${id}`, {
        method: "DELETE",
      })
    ).json()) as StatusResponse;
    const { success, message } = status;
    if (!success || message)
      throw new Error(message || "Failed to delete conversation.");
    if (success) {
      chat.$assign((o) => ({
        conversations: o.conversations.filter((c) => c.id !== id),
      }));
      if (id === chat.currentConv?.id) loadConv();
    }
    return true;
  } catch (e) {
    handleError(e);
    return false;
  }
};

export async function loadConv(
  id?: string | ConvItem,
  force = false
): Promise<void> {
  if (!id) {
    chat.$assign({
      isLoadingConv: false,
      isAnswering: false,
      currentConv: undefined,
      messages: [],
      currentThread: [],
      convConfig: getDefConvConfig(),
      convTail: null,
    });
    return;
  }
  if (typeof id === "object") return await loadConv(id.id);
  if (id === chat.currentConv?.id) return;
  const conv = chat.conversations.find((c) => c.id === id);
  if (!conv && !force) return await loadConv();
  chat.$assign({
    isLoadingConv: true,
    currentConv: conv || { id },
    messages: [],
    currentThread: [],
    convTail: null,
  });
  try {
    const {
      id: _reponsedId,
      name,
      conf,
      tail: _convTail,
      messages = [],
    }: ConvCompleted = await (
      await fetch(`/api/ai-chat/conv/${id}`, { method: "POST" })
    ).json();
    if (!_reponsedId) throw new Error("Conversation not found.");
    const convTail = _convTail || messages.at(-1)?._id || null;
    chat.$assign((o) => ({
      currentConv: { ...o.currentConv, id, name },
      convConfig: parseConvConfig(conf),
      convTail,
    }));
    updateMessages(messages.map((m) => new Message(m)));
  } catch {
    handleError("Failed to load conversation.");
    return await loadConv();
  } finally {
    chat.$assign({
      isLoadingConv: false,
      isAnswering: false,
    });
  }
}

const _askAiModel = async (options: UniOptions) => {
  const controller = new AbortController();
  const res = await fetch("/api/ai-chat/ask", {
    method: "POST",
    body: packDataWithHash<UniOptions>(options, 256, 4141414141, 4242424242),
    signal: controller.signal,
  });
  return wrapStreamResponse(res, { controller, handleError });
};

const _askConvName = async (q = "Hi", a = "Hi") => {
  try {
    const prompt = `Please generate a short title for the conversation:\nquestion:\n${q}\n\nanswer:\n${a}`;
    const res = await _askAiModel({
      messages: wrapMessages(prompt),
      temperature: 0,
    });
    await res.promise;
    const name = res.answer;
    try {
      return `${JSON.parse(name)}`;
    } catch {}
    return name;
  } catch {}
  return "";
};

let _stopGeneration = async () => {};

export function stopGeneration() {
  chat.isStoping = true;
  _stopGeneration();
}

export async function fetchConvList(useLoading = true) {
  try {
    chat.isLoadingConvList = useLoading;
    const res = await fetch("/api/ai-chat/conv", { method: "POST" });
    return ((await res.json()) as ConvItem[]).sort(
      (a, b) => (b?.mtms || 0) - (a?.mtms || 0)
    );
  } catch {
    handleError("Failed to fetch conversation list.");
    return [];
  } finally {
    chat.isLoadingConvList = false;
  }
}

export function useAiChatPage() {
  const [currentConv, _currentConv] = useState(chat.currentConv);

  useEffect(() => {
    return chat.$on((o) => {
      _currentConv(o.currentConv ? { ...o.currentConv } : void 0);
    });
  }, []);

  return {
    currentConv,
  };
}

export function useAiChatConv() {
  const [currentConv, _currentConv] = useState(chat.currentConv);
  const [isLoadingConv, _isLoadingConv] = useState(chat.isLoadingConv);

  useEffect(() => {
    return chat.$on((o) => {
      _currentConv(o.currentConv ? { ...o.currentConv } : void 0);
      _isLoadingConv(o.isLoadingConv);
    });
  }, []);

  return {
    currentConv,
    isLoadingConv,
  };
}

export function useAiChatConvList() {
  const [currentConv, _currentConv] = useState(chat.currentConv);
  const [conversations, _conversations] = useState(chat.conversations);
  const [isLoadingConvList, _isLoadingConvList] = useState(
    chat.isLoadingConvList
  );
  const [isLoadingConv, _isLoadingConv] = useState(chat.isLoadingConv);

  useEffect(() => {
    return chat.$on((o) => {
      _currentConv(o.currentConv ? { ...o.currentConv } : void 0);
      _conversations([...o.conversations]);
      _isLoadingConvList(o.isLoadingConvList);
      _isLoadingConv(o.isLoadingConv);
    });
  }, []);

  return {
    currentConv,
    conversations,
    isLoadingConvList,
    isLoadingConv,
  };
}

export function useAiChatConvConfig() {
  const [convConfig, _convConfig] = useState(chat.convConfig);
  const [isLoadingConv, _isLoadingConv] = useState(chat.isLoadingConv);
  const [isLoadingConvList, _isLoadingConvList] = useState(
    chat.isLoadingConvList
  );

  useEffect(() => {
    return chat.$on((o) => {
      _convConfig({ ...o.convConfig });
      _isLoadingConv(o.isLoadingConv);
      _isLoadingConvList(o.isLoadingConvList);
    });
  }, []);

  return {
    convConfig,
    isLoadingConv,
    isLoadingConvList,
  };
}

export function useAiChatInputConsole() {
  const [isAnswering, _isAnswering] = useState(chat.isAnswering);
  const [isStoping, _isStoping] = useState(chat.isStoping);

  useEffect(() => {
    return chat.$on((o, p) => {
      _isAnswering(p.isAnswering);
      _isStoping(p.isStoping);
    });
  }, []);

  return {
    isAnswering,
    isStoping,
  };
}

export function useAiChatContent() {
  const [currentConv, _currentConv] = useState(chat.currentConv);
  const [currentThread, _currentThread] = useState(chat.currentThread);
  const [isAnswering, _isAnswering] = useState(chat.isAnswering);
  const [isLoadingConv, _isLoadingConv] = useState(chat.isLoadingConv);

  useEffect(() => {
    return chat.$on((o, p) => {
      _currentConv(p.currentConv ? { ...p.currentConv } : void 0);
      _currentThread([...p.currentThread]);
      _isAnswering(p.isAnswering);
      _isLoadingConv(p.isLoadingConv);
    });
  }, []);

  return {
    currentConv,
    currentThread,
    isAnswering,
    isLoadingConv,
  };
}

export function useAiChatMessage() {
  const [isDeletingMessage, _isDeletingMessage] = useState(
    chat.isDeletingMessage
  );

  useEffect(() => {
    return chat.$on((o, p) => {
      _isDeletingMessage(p.isDeletingMessage);
    });
  }, []);

  return {
    isDeletingMessage,
  };
}
