"use client"

import { createRef, useCallback, useEffect, useRef, useState } from "react";
import { Spinner } from "@nextui-org/spinner";

import { CONTENT_MAX_W } from "@/constants/chat";

import Message from "./message";
import InputConsole from "./input-console";
import {useAiChatContent} from "@/hooks/useAiChat";

export default function AiChatContent() {
  const _outer = createRef<HTMLDivElement>();
  const _inner = createRef<HTMLDivElement>();
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isMessagesAutoScrolled, setIsMessagesAutoScrolled] = useState(false);

  const { currentConv, convConfig, messages, tailMessage, isAnswering, isLoadingConv } = useAiChatContent();

  const outerOnScroll = useCallback(() => {
    const outer = _outer.current;
    const inner = _inner.current;
    if (!outer || !inner) return;
    const isAtBottom = inner.clientHeight - outer.clientHeight - Math.ceil(outer.scrollTop) < 8;
    setIsAtBottom(isAtBottom);
  }, [_outer, _inner]);

  const scrollToBottom = useCallback((smooth = true) => {
    const outer = _outer.current;
    const inner = _inner.current;
    if (!outer || !inner) return;
    outer.scrollTo({ top: inner.clientHeight, behavior: smooth ? 'smooth' : undefined });
    outerOnScroll();
  }, [_outer, _inner, outerOnScroll]);

  useEffect(() => {
    if (tailMessage && isAtBottom) scrollToBottom();
  }, [tailMessage, scrollToBottom, isAtBottom]);

  useEffect(() => {
    if (isAnswering) scrollToBottom();
  }, [isAnswering, scrollToBottom]);

  const _lastConvId = useRef<string>();
  useEffect(() => {
    const currConvId = currentConv?.id;
    const lastConvId = _lastConvId.current;
    if (lastConvId === currConvId) return;
    setIsMessagesAutoScrolled(false);
    _lastConvId.current = currConvId;
  }, [_lastConvId, currentConv, setIsMessagesAutoScrolled]);

  useEffect(() => {
    if (isMessagesAutoScrolled || isLoadingConv) return;
    scrollToBottom(false);
    setIsMessagesAutoScrolled(true);
  }, [isLoadingConv, isMessagesAutoScrolled, scrollToBottom, setIsMessagesAutoScrolled]);

  const isLoading = isLoadingConv || !isMessagesAutoScrolled;

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
          {messages.map((m) => <Message key={m._id} message={m} />)}
          {(isAnswering && tailMessage) ? <Message message={tailMessage} /> : null}
        </div>
      </div>
      {isLoading ? null : <InputConsole
        isAtBottom={isAtBottom}
        scrollToBottom={scrollToBottom}
      />}
    </div>
  )
}
