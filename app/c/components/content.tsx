"use client"

import { createRef, useCallback, useEffect, useState } from "react";
import { Spinner } from "@nextui-org/spinner";

import type { StatusResponse } from "@/constants/types";
import type { MssgItem, SendMssg } from "@/constants/chat/types";
import { CONTENT_MAX_W } from "@/constants/chat";

import Message from "./message";
import InputConsole from "./input-console";

export default function AiChatContent({
  messages,
  isLoading,
  isMessagesAutoScrolled,
  isSending,
  sendingMessage,
  answeringMessage,
  sendMessage,
  setMessage,
  onAutoScrolled,
}: {
  messages: MssgItem[],
  isLoading: boolean,
  isMessagesAutoScrolled: boolean,
  isSending: boolean,
  sendingMessage: SendMssg,
  answeringMessage: SendMssg,
  sendMessage: (message: SendMssg) => Promise<StatusResponse>,
  setMessage: (msg: MssgItem | {del: string}) => Promise<StatusResponse>,
  onAutoScrolled: () => void,
}) {
  const _outer = createRef<HTMLDivElement>();
  const _inner = createRef<HTMLDivElement>();
  const [isAtBottom, setIsAtBottom] = useState(true);

  const outerOnScroll = useCallback(() => {
    const outer = _outer.current;
    const inner = _inner.current;
    if (!outer || !inner) return;
    const isAtBottom = inner.clientHeight - outer.clientHeight - Math.ceil(outer.scrollTop) < 8;
    setIsAtBottom(isAtBottom);
  }, [_outer, _inner]);

  const scrollToBottomOfMessages = useCallback((smooth = true) => {
    const outer = _outer.current;
    const inner = _inner.current;
    if (!outer || !inner) return;
    outer.scrollTo({ top: inner.clientHeight, behavior: smooth ? 'smooth' : undefined });
    outerOnScroll();
  }, [_outer, _inner, outerOnScroll]);

  const scrollToBottom = useCallback(() => scrollToBottomOfMessages(), [scrollToBottomOfMessages]);

  useEffect(() => {
    if (sendingMessage.text) scrollToBottom();
  }, [sendingMessage, scrollToBottom]);

  useEffect(() => {
    if (answeringMessage.text && isAtBottom) scrollToBottom();
  }, [answeringMessage, scrollToBottom, isAtBottom]);

  useEffect(() => {
    if (isMessagesAutoScrolled) return;
    scrollToBottomOfMessages(false);
    onAutoScrolled();
  }, [isMessagesAutoScrolled, scrollToBottomOfMessages, onAutoScrolled]);

  return (
    <div className="aichat-messages-bg overflow-x-hidden overflow-y-scroll w-full h-full" ref={_outer} onScroll={outerOnScroll}>
      {isLoading ? <div className="absolute flex-center w-full z-10 bg-black top-px" style={{height: 'calc(100% - 1px)'}}>
        <div className="flex-center" style={{scale:2}}>
          <Spinner size="lg" color="secondary" />
        </div>
      </div> : null}
      <div className="flex-center w-full" ref={_inner}>
        <div className="flex-center w-full flex-col py-8 pb-48 gap-4" style={{maxWidth: CONTENT_MAX_W}}>
          <div className={`${messages.length == 0 ? 'py-12' : 'py-4'} text-default-300 select-none`}>
            {"Let's start!"}
          </div>
          {messages.map((m) => <Message key={m._id} message={m} setMessage={setMessage} />)}
          {!isSending ? null : <>
            <Message message={{_id: '', text: sendingMessage.text}} />
            <Message message={{modl: '', _id: '', text: answeringMessage.text || 'Thinking...'}} />
          </>}
        </div>
      </div>
      {isLoading ? null : <InputConsole
        isAtBottom={isAtBottom}
        scrollToBottom={scrollToBottom}
        isSending={isSending}
        sendMessage={sendMessage}
      />}
    </div>
  )
}
