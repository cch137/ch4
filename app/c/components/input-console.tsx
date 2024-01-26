"use client"

import { createRef, useCallback, useEffect, useState } from "react";
import { IoArrowDown, IoSend } from "react-icons/io5";

import { Button } from "@nextui-org/button";
import { Textarea } from "@nextui-org/input";

import type { SendMssg } from "@/constants/chat/types";
import { CONTENT_MAX_W } from "@/constants/chat";
import type { StatusResponse } from "@/constants/types";

export default function InputConsole({
  root,
  isAtBottom,
  scrollToBottom,
  isSending,
  sendMessage,
}: {
  root?: string,
  isAtBottom: boolean,
  scrollToBottom?: () => void,
  isSending: boolean,
  sendMessage: (message: SendMssg) => Promise<StatusResponse>,
}) {
  const _textarea = createRef<HTMLTextAreaElement>();
  const [textareaValue, setTextareaValue] = useState('');

  useEffect(() => {
    const textarea = _textarea.current;
    if (!textarea) return;
    if (!isSending) textarea.focus();
  }, [_textarea, isSending]);

  const send = useCallback(async () => {
    try {
      const text = String(textareaValue).trim();
      if (!text) throw new Error('Text is empty');
      const { success } = await sendMessage({ text, root });
      if (success) setTextareaValue('');
    } catch {}
  }, [textareaValue, setTextareaValue, sendMessage, root]);

  return (<>
    <div className="absolute z-10 flex justify-end items-center flex-col w-full h-0 bottom-0" style={{paddingRight:12}}>
      <div className="absolute bottom-0 right-0 w-full h-48 pointer-events-none aichat-input-bg" />
      {isAtBottom ? null :
        <div className="mb-2 overflow-visible flex justify-center items-end">
          <div className="rounded-2xl overflow-hidden backdrop-blur-sm">
            <Button isIconOnly size="sm" variant="flat" onClick={scrollToBottom}>
              <IoArrowDown style={{scale:1.5}} />
            </Button>
          </div>
        </div>
      }
      <div className="w-full flex items-start justify-end gap-2 m-4 px-4" style={{maxWidth: CONTENT_MAX_W}}>
        <div className="bg-secondary-50 rounded-xl select-none pointer-events-none opacity-0">
          <Button isIconOnly color="secondary" variant="flat">
            <IoSend style={{scale:1.5}} />
          </Button>
        </div>
        <div className="flex-1">
          <Textarea
            color="secondary"
            variant="bordered"
            className="aichat-input text-base"
            autoFocus
            ref={_textarea}
            value={textareaValue}
            onChange={(e) => setTextareaValue(e.target.value)}
            onKeyDown={(e) => (e.key === 'Enter' && !e.shiftKey) ? (e.preventDefault(), send()) : null}
            isDisabled={isSending}
          />
        </div>
        <div className="bg-secondary-50 rounded-xl">
          <Button
            color="secondary"
            variant="flat"
            onClick={send}
            isLoading={isSending}
            isIconOnly
          >
            <IoSend style={{scale:1.5}} />
          </Button>
        </div>
      </div>
    </div>
  </>)
}
