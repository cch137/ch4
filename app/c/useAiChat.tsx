"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

import type {
  ConvCompleted,
  ConvConfig,
  ConvMeta,
  MssgMeta,
} from "@/constants/chat/types";
import {
  TEMP,
  parseConvConfig,
  getDefConvConfig,
  serializeConvConfig,
  correctModelName,
  MAX_CTXT,
  isTempMsgId,
} from "@/constants/chat";
import { useUserInfo } from "@/hooks/useAppDataManager";
import { packDataWithHash } from "@cch137/utils/shuttle";
import Broadcaster from "@cch137/utils/dev/broadcaster";
import { vers } from "@/hooks/useAppDataManager";
import { UniOptions } from "@cch137/utils/ai";
import wrapStreamResponse from "@cch137/utils/fetch-stream/wrap-stream-response";
import { StatusResponse, Dispatch, SetState } from "@/constants/types";
import useFetch from "@/hooks/useFetch";
import { useParams, useRouter, useSearchParams } from "next/navigation";

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

const API_PATHNAME_BASE = "/api/ai-chat/";
const getApiPathname = (service: string) => API_PATHNAME_BASE + service;
const getConvApiPathname = (convId?: string) =>
  getApiPathname("conv" + (convId ? "/" + convId : ""));
const getMsgApiPathname = (convId: string, msgId: string) =>
  getConvApiPathname(convId) + "/" + msgId;
const packMessage = <T extends MssgMeta>(msg: T) =>
  packDataWithHash({ ...msg, vers: vers() }, 256, 54715471, 77455463);

async function updateConversation(
  convId: string,
  { name, conf, tail }: { name?: string; conf?: string; tail?: string }
) {
  const { success, message }: StatusResponse = await (
    await fetch(`/api/ai-chat/conv/${convId}`, {
      method: "PUT",
      body: JSON.stringify({ name, tail, conf }),
    })
  ).json();
  if (!success || message)
    throw new Error(message || "Failed to modify conversation");
}

async function deleteConversation(convId: string) {
  const { success, message }: StatusResponse = await (
    await fetch(`/api/ai-chat/conv/${convId}`, {
      method: "DELETE",
    })
  ).json();
  if (!success || message)
    throw new Error(message || "Failed to delete conversation");
}

async function insertMessage(msg: MssgMeta) {
  const {
    success,
    message,
    value: mssg,
  }: StatusResponse<MssgMeta> = await (
    await fetch("/api/ai-chat/insert-message", {
      method: "POST",
      body: packMessage(msg),
    })
  ).json();
  if (!success || message)
    throw new Error(message || "Failed to insert message");
}

async function _editMessage(msg: MssgMeta) {
  const { success, message }: StatusResponse = await (
    await fetch(`/api/ai-chat/conv/${msg.conv}/${msg._id}`, {
      method: "PUT",
      body: packMessage(msg),
    })
  ).json();
  if (!success || message) throw new Error(message || "Failed to edit message");
}

async function _deleteMessage(msg: MssgMeta) {
  const { success, message }: StatusResponse = await (
    await fetch(`/api/ai-chat/conv/${msg.conv}/${msg._id}`, {
      method: "DELETE",
    })
  ).json();
  if (!success || message)
    throw new Error(message || "Failed to delete message");
}

async function createConversation() {
  const { success, message, value }: StatusResponse<string> = await (
    await fetch("/api/ai-chat/conv", { method: "PUT" })
  ).json();
  if (!value) throw new Error(message || "Failed to create conversation");
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

export type Conversation = ConvMeta & {
  edit(options: {
    name?: string;
    conf?: string;
    tail?: string;
  }): Promise<boolean>;
  delete(): Promise<boolean>;
  select(): Promise<void>;
};

const findMessagesByRoot = (root?: string): MsgSortUnit[] =>
  MsgSortUnit.metas
    .filter((m) => (root ? m.root === root : !m.root))
    .sort((a, b) => (a.ctms || 0) - (b.ctms || 0))
    .map((i) => MsgSortUnit.map.get(i._id)!);

class MsgSortUnit {
  static map = new Map<string, MsgSortUnit>();
  static metas: MssgMeta[] = [];
  static from(metas: MssgMeta[]) {
    MsgSortUnit.metas = metas;
    MsgSortUnit.map.clear();
    return metas.map((i) => new MsgSortUnit(i));
  }

  readonly meta: MssgMeta;

  get _id() {
    return this.meta._id;
  }

  get root() {
    return this.meta.root;
  }

  constructor(meta: MssgMeta) {
    this.meta = meta;
    MsgSortUnit.map.set(meta._id, this);
  }

  get parent(): MsgSortUnit | undefined {
    if (!this.root) return;
    return MsgSortUnit.map.get(this.root);
  }

  get children() {
    return findMessagesByRoot(this._id);
  }

  get siblings() {
    return this.parent?.children || findMessagesByRoot();
  }

  get nthChild() {
    return this.siblings.indexOf(this);
  }

  get parentTree() {
    const thread: MsgSortUnit[] = [];
    let parent = this.parent;
    while (parent) {
      thread.unshift(parent);
      parent = parent.parent;
    }
    return thread;
  }

  get childTree() {
    const thread: MsgSortUnit[] = [];
    let children = this.children;
    while (true) {
      const child = children.at(-1);
      if (!child) break;
      thread.push(child);
      children = child.children;
    }
    return thread;
  }

  get thread(): MsgSortUnit[] {
    return [...this.parentTree, this, ...this.childTree];
  }
}

const aiChatContext = createContext<{
  openNewChat: () => void;
  currConv: Conversation | null;
  currConvConfig: ConvConfig;
  isSavingConvConfig: boolean;
  setCurrConvConfig: Dispatch<ConvConfig>;
  conversations: Conversation[];
  isLoadingConvs: boolean;
  isEditingMessages: boolean;
  messageMetas: MssgMeta[];
  messageSortUnits: MsgSortUnit[];
  isLoadingMessages: boolean;
  editMessage: (msg: MssgMeta) => Promise<boolean>;
  deleteMessage: (msg: MssgMeta) => Promise<boolean>;
}>(
  undefined!
  // convTail: null as string | null,
  // currentConv: undefined as ConvItem | undefined,
  // conversations: [] as ConvItem[],
  // messages: [] as Message[],
  // currentThread: [] as Message[],
  // convConfig: getDefConvConfig(),
  // isAnswering: false,
  // isStoping: false,
  // isDeletingMessage: false,
  // isLoadingConv: false,
  // isLoadingConvList: false,
  // isUpdatingConv: false,
  // isRenamingConv: false,
);

const appPath = "/c/";
export function AiChatProvider({ children }: { children: React.ReactNode }) {
  // router & params
  const router = useRouter();
  const params = useParams();
  const initConvId: string =
    (Array.isArray(params.convId) ? params.convId[0] : params.convId) || "";
  const { id: currentUid, isLoggedIn } = useUserInfo();

  // conversations fetching
  const [currConvId, setCurrentConvId] = useState("");
  const openNewChat = () => setCurrentConvId("");
  const {
    data: convs = [],
    setData: setConvs,
    error: convsError,
    isPending: isLoadingConvs,
    refresh: updateConvs,
  } = useFetch<ConvMeta[]>(
    getConvApiPathname(),
    { method: "POST" },
    { type: "json", data: [], fetched: true }
  );

  const conversations = convs
    .sort((a, b) => (b?.mtms || 0) - (a?.mtms || 0))
    .map((conv) => {
      const { id } = conv;
      const setConv = (m: ConvMeta) =>
        setConvs((l = []) => l.map((i) => (i.id === id ? { ...i, ...m } : i)));
      return {
        ...conv,
        async edit(options: { name?: string; conf?: string; tail?: string }) {
          try {
            await updateConversation(id, options);
            setConv({ ...conv, ...options });
            return true;
          } catch (e) {
            handleError(e);
            return false;
          }
        },
        async delete() {
          try {
            await deleteConversation(id);
            setConvs((l = []) => l.filter((i) => i.id !== id));
            return true;
          } catch (e) {
            handleError(e);
            return false;
          }
        },
        async select() {
          setCurrentConvId(id);
        },
      };
    });

  const currConv = conversations.find(({ id }) => id === currConvId) || null;

  // auth control
  const uid = useRef("");
  useEffect(() => {
    if (isLoggedIn && uid.current !== currentUid) {
      uid.current = currentUid;
      updateConvs();
      setCurrentConvId(initConvId);
    }
  }, [isLoggedIn, uid, currentUid, initConvId, updateConvs, setCurrentConvId]);

  // messages fetching
  const {
    data: convCompleted = { id: "" },
    setData: setConvCompleted,
    error: messagesError,
    isPending: isLoadingMessages,
    refresh: updateMessages,
  } = useFetch<ConvCompleted>(
    getConvApiPathname(currConvId),
    { method: "POST" },
    { type: "json", data: { id: "" }, fetched: true }
  );
  const { messages: messageMetas = [], ..._fetchedConv } = convCompleted;
  const messageSortUnits = MsgSortUnit.from(messageMetas);
  const [isEditingMessages, setIsEditingMessages] = useState(false);

  const setMsgs = (messages: MssgMeta[]) =>
    setConvCompleted((c = { id: "" }) => ({ ...c, messages }));

  const editMessage = async (msg: MssgMeta) => {
    try {
      const { _id } = msg;
      setIsEditingMessages(true);
      await _editMessage(msg);
      setMsgs(messageMetas.map((i) => (i._id === _id ? msg : i)));
      return true;
    } catch (e) {
      handleError(e);
      return false;
    } finally {
      setIsEditingMessages(false);
    }
  };

  const deleteMessage = async (msg: MssgMeta) => {
    try {
      const { _id } = msg;
      setIsEditingMessages(true);
      await _deleteMessage(msg);
      setMsgs(messageMetas.filter((i) => i._id !== _id));
      return true;
    } catch (e) {
      handleError(e);
      return false;
    } finally {
      setIsEditingMessages(false);
    }
  };

  const [isSavingConvConfig, setIsSavingConvConfig] = useState(false);
  const updateConvTimeout = useRef<NodeJS.Timeout>();
  const currConvConfig = parseConvConfig(_fetchedConv.conf || currConv?.conf);
  const setCurrConvConfig = (config: ConvConfig) => {
    if (!currConv) return;
    clearTimeout(updateConvTimeout.current);
    setIsSavingConvConfig(true);
    updateConvTimeout.current = setTimeout(() => {
      currConv
        .edit({ conf: serializeConvConfig(config) })
        .catch(handleError)
        .finally(() => setIsSavingConvConfig(false));
    }, 1000);
  };

  // update messages when curr conv changed
  const lastLoadedConvId = useRef("");
  useEffect(() => {
    if (lastLoadedConvId.current !== currConvId) {
      lastLoadedConvId.current = currConvId;
      if (currConvId) updateMessages();
      else setConvCompleted(void 0);
    }
  }, [currConvId, lastLoadedConvId, updateMessages]);

  // errors handle
  useEffect(() => {
    if (convsError) handleError(convsError);
  }, [convsError]);
  useEffect(() => {
    if (messagesError) handleError(messagesError);
  }, [messagesError]);

  return (
    <aiChatContext.Provider
      value={{
        openNewChat,
        currConv,
        currConvConfig,
        isSavingConvConfig,
        setCurrConvConfig,
        conversations,
        isLoadingConvs,
        isEditingMessages,
        messageMetas,
        messageSortUnits,
        isLoadingMessages,
        editMessage,
        deleteMessage,
      }}
    >
      {children}
    </aiChatContext.Provider>
  );
}

export default function useAiChat() {
  return useContext(aiChatContext);
}
