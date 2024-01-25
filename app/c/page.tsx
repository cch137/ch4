"use client"

import "./chat.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { SIDEBAR_WIDTH, correctConvConfig, parseConvConfig, serializeConvConfig } from '@/constants/chat';
import isHeadless from '@cch137/utils/webpage/is-headless';
import { Button } from "@nextui-org/button";
import { Link } from "@nextui-org/link";
import FullpageSpinner from "@/app/components/fullpage-spiner";
import type { ConvCompleted, ConvConfig, ConvItem, MssgItem, SaveMssg, SaveMssgRes, SendMssg } from "@/constants/chat/types";
import { useParams } from "next/navigation";

import Sidebar from "./components/sidebar";
import AiChatContent from "./components/content";
import useErrorMessage from "@/hooks/useErrorMessage";
import { useRouter } from "next/navigation";
import { appTitle } from "@/constants/app";
import type { StatusResponse } from "@/constants/types";
import { packData } from "@cch137/utils/shuttle";
import type { UniOptions } from "@cch137/utils/ai/types";
import useVersion from "@/hooks/useVersion";
import useUserInfo from "@/hooks/useUserInfo";

const SMALL_SCREEN_W = 720;

export default function AiChat() {
  const version = useVersion();
  const params = useParams();
  const router = useRouter();
  const convId: string | undefined = [params.convId || []].flat(2)[0];

  const { openErrorMessageBox, errorMessageBox } = useErrorMessage();

  const [isReady, setIsReady] = useState(false);

  // sidebar stuffs
  const [isSmallScreen, setIsSmallScreem] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_WIDTH);

  const [currentConv, setCurrentConv] = useState<ConvItem|undefined>(convId ? { id: convId } : undefined);
  const [convConfig, _setConvConfig] = useState<ConvConfig>({modl:'gemini-pro',temp:0.3,topK:8,topP:1,ctxt:10});
  const convConfUpdateTimeout = useRef<NodeJS.Timeout>();

  const inited = useRef(false);
  const [convList, setConvList] = useState<ConvItem[]>([]);
  const [isFetchingConvList, setIsFetchingConvList] = useState(true);

  const updateConvConf = (convConf: ConvConfig, convId?: string) => {
    if (!convId) return;
    const conf = serializeConvConfig(convConf);
    fetch(`/api/ai-chat/conv/${convId}`, {method: 'PUT', body: JSON.stringify({ conf })});
  }

  const renameConv = useCallback(async (name: string, convId?: string) => {
    if (!convId) return { success: true };
    name = name.trim();
    try {
      const status = await (await fetch(`/api/ai-chat/conv/${convId}`, {method: 'PUT', body: JSON.stringify({ name })})).json() as StatusResponse;
      const { success, message } = status;
      if (!success || message) openErrorMessageBox(message);
      if (success) setConvList(cl => cl.map(c => c.id === convId ? { ...c, name } : c));
      return status;
    } catch { return { success: false, message: 'Failed to rename conversation' } }
  }, [setConvList, openErrorMessageBox]);

  const deleteConv = useCallback(async (convId?: string) => {
    if (!convId) return { success: true };
    try {
      const status = await (await fetch(`/api/ai-chat/conv/${convId}`, {method: 'DELETE'})).json() as StatusResponse;
      const { success, message } = status;
      if (!success || message) openErrorMessageBox(message);
      if (success) {
        setConvList(convList.filter(c => c.id !== convId));
        if (convId === currentConv?.id) setCurrentConv(undefined);
      }
      return status;
  } catch { return { success: false, message: 'Failed to delete conversation' } }
  }, [setCurrentConv, currentConv, convList, setConvList, openErrorMessageBox]);

  const setConvConfig = useCallback((_convConfig: ConvConfig | string = '', update = true): void => {
    if (typeof _convConfig === 'string') return setConvConfig(parseConvConfig(_convConfig), update);
    _convConfig = correctConvConfig(_convConfig);
    _setConvConfig(_convConfig);
    if (convConfUpdateTimeout.current) clearTimeout(convConfUpdateTimeout.current);
    if (!update) return;
    convConfUpdateTimeout.current = setTimeout((convConf, convId) => updateConvConf(convConf, convId), 1000, _convConfig, currentConv?.id);
  }, [_setConvConfig, convConfUpdateTimeout, currentConv]);

  const [isHeadlessBrowser, setIsHeadlessBrowser] = useState(false);

  const computeSidebarWidth = (isSidebarOpen: boolean, isSmallScreen: boolean) => {
    const _computedSidebarWidth = isSmallScreen
      ? window.innerWidth
      : isSidebarOpen
        ? SIDEBAR_WIDTH
        : 0;
    setSidebarWidth(_computedSidebarWidth);
  }

  const toggleSidebarOpen = useCallback(() => {
    const _isSidebarOpen = !isSidebarOpen;
    setIsSidebarOpen(_isSidebarOpen);
    computeSidebarWidth(_isSidebarOpen, isSmallScreen);
  }, [isSidebarOpen, isSmallScreen]);

  const closeSidebar = () => setIsSidebarOpen(false);

  const [messages, setMessages] = useState<MssgItem[]>([]);
  const [isFetchingMessages, setIsFetchingMessages] = useState(true);
  const [isMessagesAutoScrolled, setIsMessagesAutoScrolled] = useState(false);

  const fetchList = useCallback(async (useLoading = true, setConvId?: string) => {
    if (useLoading) setIsFetchingConvList(true);
    try {
      const convList = (await (await fetch('/api/ai-chat/conv/', {method: 'POST'})).json() as ConvItem[])
        .sort((a, b) => (b?.mtms || 0) - (a?.mtms || 0)).slice(0, 32);
      setConvList(convList);
      const convId = setConvId || currentConv?.id;
      const conv = convList.find(c => c.id === convId);
      setCurrentConv(conv);
      if (!conv) setIsFetchingMessages(false);
    } catch {
      openErrorMessageBox('Failed to fetch conversion list');
    }
    setIsFetchingConvList(false);
  }, [setConvList, setCurrentConv, setIsFetchingConvList, currentConv, openErrorMessageBox, setIsFetchingMessages]);

  useEffect(() => {
    const { valid } = isHeadless(window, document, navigator, process.env.NODE_ENV === 'development');
    setIsHeadlessBrowser(valid);
    const adjustSidebarProps = () => {
      const _isSmallScreen = window.innerWidth < SMALL_SCREEN_W;
      setIsSmallScreem(_isSmallScreen);
      computeSidebarWidth(isSidebarOpen, _isSmallScreen);
    }
    adjustSidebarProps();
    window.addEventListener('resize', adjustSidebarProps);
    if (isSidebarOpen) {
      if (inited.current) localStorage.removeItem('close-sidebar');
    } else localStorage.setItem('close-sidebar', '1');
    if (!inited.current) {
      if (localStorage.getItem('close-sidebar')) {
        setIsSidebarOpen(false);
        setTimeout(() => setIsReady(true), 1);
      } else setIsReady(true);
      inited.current = true;
      fetchList();
    };
    return () => window.removeEventListener('resize', adjustSidebarProps)
  }, [isSmallScreen, isSidebarOpen, inited, setIsReady, fetchList]);

  const deleting = useRef(new Set<Promise<StatusResponse>>());
  const setMessage = useCallback(async (msg: MssgItem | {del: string}) => {
    await Promise.all([...deleting.current]);
    const promise = new Promise<StatusResponse>(async (resolve) => {
      try {
        const convId = currentConv?.id || '';
        if ('del' in msg) {
          const { del: mssgId } = msg;
          const status: StatusResponse = await (await fetch(`/api/ai-chat/conv/${convId}/${mssgId}`, {
            method: 'DELETE',
          })).json();
          const { success, message } = status;
          if (!success || message) openErrorMessageBox(message);
          if (success) setMessages((ms) => ms.filter(m => m._id !== mssgId));
          resolve(status);
          return;
        }
        const mssgId = msg._id;
        const status: StatusResponse = await (await fetch(`/api/ai-chat/conv/${convId}/${mssgId}`, {
          method: 'PUT',
          body: JSON.stringify(msg)
        })).json();
        const { success, message } = status;
        if (!success || message) openErrorMessageBox(message);
        if (success) setMessages((ms) => ms.map(m => m._id === mssgId ? { ...m, ...msg } : m));
        resolve(status);
      } catch {
        const status = { success: false, message: 'Failed to change message.' }
        openErrorMessageBox(status.message);
        resolve(status);
      }
    });
    deleting.current.add(promise);
    const status = await promise;
    deleting.current.delete(promise);
    return status;
  }, [setMessages, currentConv, openErrorMessageBox]);

  const _currConvId = useRef<string|undefined>();
  const getPathnameData = () => {
    const pathname = `${location.pathname}${location.pathname.endsWith('/') ? '' : '/'}`;
    const [_0, _1, convId] = pathname.split('/');
    return {
      pathname,
      convId: convId || undefined,
      isNotInAiChat: sessionStorage.getItem('in-aichat') === '0',
    }
  }
  const [newConvOpened, setNewConvOpened] = useState(false);
  useEffect(() => {
    const _convId = currentConv?.id || undefined;
    const currConvId = _currConvId.current;
    _currConvId.current = currentConv?.id;
    (async () => {
      const pConvId = getPathnameData().convId || undefined;
      if (pConvId !== _convId) history.pushState(null, '', `/c/${_convId || ''}`);
      if (newConvOpened && _convId) {
        updateConvConf(convConfig, _convId);
        setConvList([{id: _convId, mtms: Date.now()}, ...convList])
        setNewConvOpened(false);
        return;
      }
      if (_currConvId.current === currConvId) return;
      if (!_convId) {
        setConvConfig('', false);
        setMessages([]);
        setIsFetchingMessages(false);
        setIsSending(false);
        document.title = appTitle('New Chat');
        return;
      }
      setIsFetchingMessages(true);
      setMessages([]);
      setIsSending(false);
      answerText.current = '';
      try {
        const {
          id,
          name,
          conf,
          messages = [],
        }: ConvCompleted = await (await fetch(`/api/ai-chat/conv/${_convId}`, {method: 'POST'})).json();
        if (id === _currConvId.current) {
          setMessages(messages.sort((a, b) => (a.ctms || 0) - (b.ctms || 0)));
          setConvConfig(conf, false);
          setIsFetchingMessages(false);
          setIsMessagesAutoScrolled(false);
          document.title = appTitle(name || 'Chat');
        }        
      } catch {
        setIsFetchingMessages(false);
        document.title = appTitle('Chat');
        openErrorMessageBox('Failed to fetch messages');
      }
    })();
    const handleBack = (e: PopStateEvent) => {
      const { pathname, isNotInAiChat } = getPathnameData();
      if (isNotInAiChat) {
        if (pathname.startsWith('/c/')) router.replace(location.pathname);
        return;
      }
      const [_0, _1, convId] = pathname.split('/');
      setCurrentConv(convId ? { id: convId } : undefined);
    }
    window.onpopstate = handleBack;
    sessionStorage.setItem('in-aichat', '1');
    return () => {
      sessionStorage.setItem('in-aichat', '0');
    }
  }, [router, currentConv, _currConvId, setConvConfig, newConvOpened, setNewConvOpened, convConfig, convList, openErrorMessageBox]);

  const insertMessage = useCallback(async (message: SaveMssg) => {
    try {
      const status: StatusResponse<SaveMssgRes> = await (await fetch('/api/ai-chat/insert-message', {
        method: 'POST',
        body: packData({...message, vers: version}, 54715471, 77455463),
      })).json();
      return status;
    } catch {
      const err = 'Failed to insert message';
      openErrorMessageBox(err);
      return { success: false, message: err };
    }
  }, [openErrorMessageBox]);

  const [isSending, setIsSending] = useState(false);
  const [sendingMessage, setSendingMessage] = useState<SendMssg>({text:''});
  const [answeringMessage, setAnsweringMessage] = useState<SendMssg>({text:''});
  const answerText = useRef('');
  const sendMessage = useCallback(async (message: SendMssg): Promise<StatusResponse> => {
    const convId = currentConv?.id;
    const { text, root } = message;
    setSendingMessage(message);
    setAnsweringMessage({text:''});
    setIsSending(true);
    try {
      const t0 = Date.now();
      const model = convConfig.modl;
      const options: UniOptions = {
        messages: [
          ...messages.map((m) => ({
            role: typeof m.modl === 'string' ? 'model' : 'user',
            text: m.text
          })),
          {role: 'user', text }
        ],
        model,
        temperature: convConfig.temp,
        topP: convConfig.topP,
        topK: convConfig.topK,
      };
      const res = await fetch('/api/ai-chat/ask', {
        method: 'POST',
        body: packData<UniOptions>(options, 4141414141, 4242424242),
      });
      if (!res.body) throw new Error('Failed to request');
      const decoder = new TextDecoder('utf8');
      const reader = res.body.getReader();
      const dtms = await new Promise<number>(async (resolve, reject) => {
        let readTimeout: NodeJS.Timeout;
        const extendTimeout = () => {
          clearTimeout(readTimeout);
          return setTimeout(() => {throw new Error('Response Timeout')}, 60000);
        }
        readTimeout = extendTimeout();
        while (true) {
          try {
            const { value, done } = await reader.read();
            if (done) break;
            const chunkText = decoder.decode(value);
            answerText.current += chunkText;
            setAnsweringMessage((ans) => ({...ans, text: answerText.current }));
            readTimeout = extendTimeout();
          } catch (e) {
            reject(new Error(`Failed to read response${e instanceof Error ? ': ' + e.message : ''}`));
          }
        }
        clearTimeout(readTimeout);
        resolve(Date.now() - t0);
      });
      if (!answerText.current) throw new Error('Model refused to respond');
      const qSaveStatus = await insertMessage({ text, root, conv: convId });
      const { mssg: qMsg, conv: aConvId, isNewConv = false } = qSaveStatus.value || {};
      const answerRoot = qMsg?._id;
      if (!qSaveStatus.success || !answerRoot || !aConvId) throw new Error(`Failed to insert message: ${qSaveStatus.message || 'Unknown'}`);
      if (isNewConv) {
        const autoRenamePrompt = [
          'Please generate a short title for the conversation:\n',
          'question:',
          text,
          '\nanswer:',
          answerText.current,
        ].join('\n');
        (async () => {
          const convName = await (async () =>{
            try {
              const convName = await (await fetch('/api/ai-chat/ask', {
                method: 'POST',
                body: packData<UniOptions>({
                  messages: [{role: 'user', text: autoRenamePrompt}],
                  temperature: 0,
                }, 4141414141, 4242424242),
              })).text()
              try {
                return `${JSON.parse(convName)}`;
              } catch {
                return convName;
              }
            } catch {
              return undefined
            }
          })();
          if (convName) {
            await renameConv(convName, aConvId);
            fetchList(false, aConvId);
          }
        })();
        setNewConvOpened(true);
        setCurrentConv({ id: aConvId });
      }
      const aSaveStatus = await insertMessage({
        conv: aConvId,
        text: answerText.current,
        modl: model,
        root: answerRoot,
        dtms,
      });
      const { mssg: aMsg } = aSaveStatus.value || {};
      if (!aSaveStatus.success || !aMsg) {
        setMessages((m) => [...m, qMsg]);
        throw new Error(`Failed to insert message: ${aSaveStatus.message || 'Unknown'}`);
      }
      setMessages((m) => [...m, qMsg, aMsg]);
      return { success: true };
    } catch (e) {
      const status = {
        success: false,
        message: e instanceof Error
          ? e.message
          : 'Failed to send message.'
      };
      openErrorMessageBox(status.message);
      return status
    } finally {
      setIsSending(false);
      setSendingMessage({text:''});
      setAnsweringMessage({text:''});
      answerText.current = '';
    }
  }, [insertMessage, setIsSending, setSendingMessage, openErrorMessageBox, setNewConvOpened, currentConv, convConfig, messages, fetchList, renameConv]);

  const userInfo = useUserInfo();

  return isHeadlessBrowser
    ? (
      <div className="p-4">
        <div>Your browser does not support this page. Please use another browser.</div>
        <Link href="/" underline="hover">Back to Home</Link>
      </div>
    ) : (
      (!isReady || userInfo.initing)
        ? (
          <FullpageSpinner />
        ) : (
          userInfo.auth > 0 
          ? (<>
            {errorMessageBox}
            <div className="overflow-hidden">
              <Sidebar
                convId={convId}
                isSmallScreen={isSmallScreen}
                sidebarWidth={sidebarWidth}
                isSidebarOpen={isSidebarOpen}
                toggleSidebarOpen={toggleSidebarOpen}
                closeSidebar={closeSidebar}
                currentConv={currentConv}
                setCurrentConv={setCurrentConv}
                isFetchingMessages={isFetchingMessages}
                convConfig={convConfig}
                setConvConfig={setConvConfig}
                renameConv={renameConv}
                convList={convList}
                isFetchingConvList={isFetchingConvList}
                deleteConv={deleteConv}
              />
              <div className="chat-content" style={{
                top: '3.5rem',
                left: isSmallScreen ? 0 : isSidebarOpen ? sidebarWidth : 0,
                width: isSmallScreen ? '100dvw' : `calc(100dvw - ${sidebarWidth}px)`,
                height: 'calc(100dvh - 3.5rem)',
              }}>
                <AiChatContent
                  messages={messages}
                  isLoading={isFetchingMessages || !isMessagesAutoScrolled}
                  isMessagesAutoScrolled={isMessagesAutoScrolled}
                  onAutoScrolled={() => setIsMessagesAutoScrolled(true)}
                  isSending={isSending}
                  sendingMessage={sendingMessage}
                  answeringMessage={answeringMessage}
                  sendMessage={sendMessage}
                  setMessage={setMessage}
                />
              </div>
            </div>
          </>) : (<>
            <div className="flex-center px-8" style={{height: 'calc(100dvh - 4rem)'}}>
              <div className="flex flex-col gap-8 w-full max-w-4xl">
                <h1 className="text-6xl font-bold">AI Chat</h1>
                <section className="text-xl">
                  <p>A simple AI chat app by @cch137.</p>
                  <p>Offers various models for free.</p>
                  <p>This is for everyone.</p>
                </section>
                <div className="pt-4 py-8">
                  <Button
                    size="lg"
                    color="secondary"
                    className="rounded-full"
                    variant="shadow"
                    as={Link}
                    href="/auth/signin?next=/c/"
                  >
                    Sign in
                  </Button>
                </div>
              </div>
              {isSmallScreen ? null : (<>
                <div className="relative flex-center w-0">
                  <div className="crystal-outer absolute flex-center right-0">
                    <div className="crystal" />
                    <div className="crystal" />
                    <div className="crystal" />
                  </div>
                </div>
              </>)}
            </div>
          </>)
      )
    )
}
