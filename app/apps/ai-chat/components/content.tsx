"use client";

import { createRef, useCallback, useEffect, useRef, useState } from "react";
import { Spinner } from "@nextui-org/spinner";

import MessageComponent from "./message";
import InputConsole from "./input-console";
import { useAiChatContent } from "@/app/apps/ai-chat/useAiChat";

export default function AiChatContent() {
  const _outer = createRef<HTMLDivElement>();
  const _inner = createRef<HTMLDivElement>();
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isMessagesAutoScrolled, setIsMessagesAutoScrolled] = useState(false);

  const { currentConv, currentThread, isAnswering, isLoadingConv } =
    useAiChatContent();

  const outerOnScroll = useCallback(() => {
    const outer = _outer.current;
    const inner = _inner.current;
    if (!outer || !inner) return;
    const isAtBottom =
      inner.clientHeight - outer.clientHeight - Math.ceil(outer.scrollTop) < 4;
    setIsAtBottom(isAtBottom);
  }, [_outer, _inner]);

  const scrollToBottom = useCallback(
    (smooth = true) => {
      const outer = _outer.current;
      const inner = _inner.current;
      if (!outer || !inner) return;
      outer.scrollTo({
        top: inner.clientHeight,
        behavior: smooth ? "smooth" : undefined,
      });
      outerOnScroll();
    },
    [_outer, _inner, outerOnScroll]
  );

  useEffect(() => {
    if (isAtBottom) scrollToBottom();
  }, [scrollToBottom, isAtBottom]);

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
  }, [
    isLoadingConv,
    isMessagesAutoScrolled,
    scrollToBottom,
    setIsMessagesAutoScrolled,
  ]);

  const isLoading = isLoadingConv || !isMessagesAutoScrolled;

  return (
    <div
      className="overflow-x-visible overflow-y-scroll w-full h-full"
      ref={_outer}
      onScroll={outerOnScroll}
    >
      {isLoading ? (
        <div
          className="absolute flex-center w-full z-10 bg-black top-px"
          style={{ height: "calc(100% - 1px)" }}
        >
          <div className="flex-center" style={{ scale: 2 }}>
            <Spinner size="lg" color="secondary" />
          </div>
        </div>
      ) : null}
      <div className="flex-center w-full" ref={_inner}>
        <div className={`flex flex-col w-full py-8 pb-48`}>
          <div
            className={`${
              currentThread.length == 0 ? "py-12" : "py-4"
            } mb-4 text-default-300 text-center select-none`}
          >
            {"Let's start!"}
          </div>
          {currentThread.map((m) => (
            <MessageComponent key={m._id} message={m} />
          ))}
        </div>
      </div>
      {isLoading ? null : (
        <InputConsole isAtBottom={isAtBottom} scrollToBottom={scrollToBottom} />
      )}
    </div>
  );
}
