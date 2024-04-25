"use client";

import { ReactNode, useEffect, useState } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";

export default function Collapsible({
  summary,
  children,
  isOpen = false,
  close,
  open,
}: {
  summary: ReactNode;
  children: ReactNode;
  isOpen?: boolean;
  close?: () => any;
  open?: () => any;
}) {
  const [_isOpen, setIsOpen] = useState(isOpen);
  useEffect(() => {
    setIsOpen(isOpen);
  }, [isOpen, setIsOpen]);
  return (
    <div className="border-b-1 border-solid border-default-200 transition-all ease-soft-spring">
      <div>
        <div
          className="flex-center h-9 w-full cursor-pointer"
          onClick={
            isOpen
              ? close || (() => setIsOpen(false))
              : open || (() => setIsOpen(true))
          }
        >
          <div className="flex-1">{summary}</div>
          <MdKeyboardArrowDown
            className={`${
              isOpen ? "" : "rotate-90"
            } transition ease-soft-spring`}
          />
        </div>
      </div>
      <div
        className={`grid w-full transition-all ease-soft-spring ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
