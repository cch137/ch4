"use client";

import useToggle from "@/hooks/useToggle";
import { type ReactNode, useEffect, useState } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";

export default function Collapsible({
  summary,
  children,
  isOpen,
  close,
  open,
}: {
  summary: ReactNode;
  children: ReactNode;
  isOpen?: boolean;
  close?: () => any;
  open?: () => any;
}) {
  const hasIsOpenArgument = typeof isOpen === "boolean";
  const [_isOpen, toggle] = useToggle(hasIsOpenArgument ? isOpen : false);
  const computedIsOpen = hasIsOpenArgument ? isOpen : _isOpen;
  return (
    <div className="border-b-1 border-solid border-default-200 transition-all ease-soft-spring">
      <div
        className="flex-center h-9 w-full cursor-pointer"
        onClick={(computedIsOpen ? close : open) || toggle}
      >
        <div className="flex-1">{summary}</div>
        <MdKeyboardArrowDown
          className={`${
            computedIsOpen ? "" : "rotate-90"
          } transition ease-soft-spring`}
        />
      </div>
      <div
        className={`grid w-full transition-all ease-soft-spring ${
          computedIsOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
