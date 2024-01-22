"use client"

import type { ClassAttributes, HTMLAttributes } from "react";
import { IoCopyOutline } from "react-icons/io5";

import { Button } from "@nextui-org/button";

import type { ExtraProps } from 'react-markdown';
import Prism from 'react-syntax-highlighter/dist/esm/prism';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

import useCopyText from "@/hooks/copy-text";

export default function MessageCodeBlock({
  node,
  className,
  children,
  ...props
}: ClassAttributes<HTMLElement> & HTMLAttributes<HTMLElement> & ExtraProps) {
  const match = /language-(\w+)/.exec(className || '');
  const [copied, copyCode] = useCopyText(String(children));
  return match ? (
    <div className="my-2 rounded-2xl overflow-hidden">
      <div className="relative w-full">
        <div
          className="absolute flex items-center w-full py-1 px-3 border-b-1 border-default-200"
          style={{borderRadius: '1rem 1rem 0 0', background: '#ffffff12'}}
        >
          <div className="flex-1 text-default-600 pointer-events-none select-none">
            {match[1]}
          </div>
          <Button
            size="sm"
            className="h-7 text-sm"
            startContent={<IoCopyOutline />}
            onClick={copyCode}
            variant={copied ? 'flat' : 'bordered'}
            color={copied ? 'success' : 'default'}
          >
            <span className="opacity-90">{copied ? 'Copied' : 'Copy'}</span>
          </Button>
        </div>
      </div>
      <Prism
        // @ts-ignore
        language={match[1]}
        // @ts-ignore
        style={vscDarkPlus}
        className="aichat-message-md-codeblock rounded-2xl"
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </Prism>
    </div>
  ) : (
    <code className={className || '' + ' break-all whitespace-normal'} {...props}>
      {children}
    </code>
  )
}
