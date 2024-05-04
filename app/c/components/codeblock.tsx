"use client"

import type { ClassAttributes, HTMLAttributes } from "react";
import { IoCheckmark, IoCopyOutline } from "react-icons/io5";

import type { ExtraProps } from 'react-markdown';
import Prism from 'react-syntax-highlighter/dist/esm/prism';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

import useCopyText from "@/hooks/useCopyText";
import { sansFont } from '@/constants/font';

export default function MessageCodeBlock({
  node,
  className,
  children,
  ...props
}: ClassAttributes<HTMLElement> & HTMLAttributes<HTMLElement> & ExtraProps) {
  const match = /language-(\w+)/.exec(className || '');
  const [copied, copyCode] = useCopyText(String(children));
  return match ? (
    <div className="my-2 rounded-lg overflow-hidden">
      <div className="relative w-full text-xs">
        <div
          className={`absolute flex items-center w-full py-0.5 px-4 ${sansFont.className}`}
          style={{borderRadius: '.5rem .5rem 0 0', background: '#202020'}}
        >
          <div className="flex-1 text-default-600 pointer-events-none select-none">
            {match[1]}
          </div>
          <div className="flex-center cursor-pointer">
            <div
              className={[
                'flex-center gap-1.5 h-6 cursor-pointer',
                copied ? 'text-success-500' : 'text-default-600',
              ].join(' ')}
              onClick={copyCode}
            >
              {copied ? <IoCheckmark className="text-sm" /> : <IoCopyOutline className="text-sm" />}
              <span>{copied ? 'Copied!' : 'Copy code'}</span>
            </div>
          </div>
        </div>
      </div>
      <Prism
        // @ts-ignore
        language={match[1]}
        // @ts-ignore
        style={vscDarkPlus}
        className="aichat-message-md-codeblock rounded-lg"
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
