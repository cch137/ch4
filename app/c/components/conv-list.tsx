"use client";

import { useState, useEffect, useRef, createRef, useCallback } from "react";

import Link from "next/link";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/popover";
import { Spinner } from "@nextui-org/spinner";
import { Tooltip } from "@nextui-org/tooltip";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/modal";

import { IoAddOutline, IoEllipsisVertical } from "react-icons/io5";

import baseConverter from "@cch137/utils/str/base-converter";
import { models as _models } from "@/constants/chat";
import type { ConvMeta } from "@/constants/chat/types";
import useConfirm from "@/hooks/useConfirm";
import { useIsSmallScreen } from "@/hooks/useAppDataManager";
import useInit from "@/hooks/useInit";
import useAiChat, { type Conversation } from "../useAiChat";

const convIdToKey = (id?: string) => "aichat-conv-" + id || "";

function ConversationButton({
  appPath,
  conv,
  sidebarLoadConv,
}: {
  appPath: string;
  conv: Conversation;
  sidebarLoadConv: (c: ConvMeta) => void;
}) {
  const [isHover, setIsHover] = useState(false);
  const ref = createRef<HTMLButtonElement>();
  const { id, name: _name } = conv;
  const name = _name || baseConverter(id, "64w", 10);

  const { currConv, isLoadingMessages } = useAiChat();

  const isCurrentConv = conv.id === currConv?.id;

  useEffect(() => {
    if (!isHover) ref.current!.removeAttribute("data-hover");
  }, [isHover, ref]);

  const {
    isOpen: renameConvIsOpen,
    onOpen: renameConvOnOpen,
    onClose: renameConvOnClose,
  } = useDisclosure();
  const renameInput = createRef<HTMLInputElement>();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmDelete, onConfirmDelete] = useConfirm();
  const deleteConv = useCallback(async () => {
    if (!onConfirmDelete()) return;
    setIsHover(false);
    setIsPopoverOpen(false);
    setIsDeleting(true);
    await conv.delete();
    setIsDeleting(false);
  }, [conv, onConfirmDelete, setIsHover, setIsPopoverOpen, setIsDeleting]);

  return (
    <>
      <Modal size="sm" isOpen={renameConvIsOpen} onClose={renameConvOnClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Rename Conversation
              </ModalHeader>
              <ModalBody>
                <Input
                  classNames={{ input: "text-base" }}
                  autoFocus
                  variant="bordered"
                  color="secondary"
                  type="text"
                  ref={renameInput}
                  isDisabled={isRenaming}
                  defaultValue={_name || ""}
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={onClose}
                  isDisabled={isRenaming}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  isDisabled={isRenaming}
                  isLoading={isRenaming}
                  onPress={async () => {
                    const name = renameInput.current?.value || "";
                    setIsRenaming(true);
                    try {
                      if (await conv.edit({ name })) onClose();
                    } finally {
                      setIsRenaming(false);
                    }
                  }}
                >
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Button
        color={isDeleting ? "danger" : isCurrentConv ? "secondary" : "default"}
        variant={isDeleting ? "light" : isCurrentConv ? "bordered" : "light"}
        className={`flex-center h-7 mb-1 p-0 w-full conv-btn ${
          isDeleting ? "opacity-50" : ""
        }`}
        style={isCurrentConv ? {} : { border: "2px solid #0000" }}
        onMouseEnter={() => (isHover ? null : setIsHover(true))}
        onMouseLeave={() => (isHover ? setIsHover(false) : null)}
        ref={ref}
        id={convIdToKey(id)}
        onClick={() => sidebarLoadConv(conv)}
        // draggable={true}
        // as={Link}
        isDisabled={isLoadingMessages || isDeleting}
      >
        <div className="flex-center h-full w-full">
          <Tooltip
            content={name}
            delay={1500}
            placement="bottom-start"
            className="pointer-events-none select-none"
          >
            <Link
              href={`${appPath}${id}`}
              className="flex-1 h-full pl-2 focus:outline-none"
              onClick={(e) => {
                e.preventDefault();
                try {
                  ref.current?.click();
                } catch {}
              }}
              draggable={true}
            >
              <div className="relative flex-center w-full h-full">
                <div className="absolute w-full overflow-hidden overflow-ellipsis text-start">
                  {name}
                </div>
              </div>
            </Link>
          </Tooltip>
          <Popover
            placement="right"
            showArrow
            isOpen={isPopoverOpen}
            onOpenChange={(c) => setIsPopoverOpen(c)}
          >
            <PopoverTrigger>
              <div
                className="flex-center conv-menu-btn"
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                <IoEllipsisVertical className="cursor-pointer" />
              </div>
            </PopoverTrigger>
            <PopoverContent style={{ zIndex: 9999 }}>
              <div className="flex flex-col min-w-unit-24 -m-4 py-5 px-4">
                <Button
                  className="w-full h-8 flex items-center justify-start"
                  variant="light"
                  onClick={() => (
                    setIsHover(false),
                    setIsPopoverOpen(false),
                    renameConvOnOpen()
                  )}
                >
                  <span>Rename</span>
                </Button>
                <Button
                  className="w-full h-8 flex items-center justify-start"
                  variant="light"
                  color="danger"
                  onClick={deleteConv}
                >
                  <span>{isConfirmDelete ? "Confirm Delete" : "Delete"}</span>
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </Button>
    </>
  );
}

export default function ConversationList({
  appPath,
  initConvId,
  modelSettingOpened,
  closeSidebar,
}: {
  appPath: string;
  initConvId?: string;
  modelSettingOpened: boolean;
  closeSidebar: () => void;
}) {
  const convListEl = createRef<HTMLDivElement>();

  const {
    openNewChat,
    currConv,
    conversations,
    isLoadingConvs,
    isLoadingMessages,
  } = useAiChat();

  const getScrollTopRatio = useCallback(
    (offset = 0) => {
      const el = convListEl.current;
      if (!el) return 0;
      return Math.min(
        1,
        (el.scrollTop + offset) / (el.scrollHeight - el.offsetHeight)
      );
    },
    [convListEl]
  );

  /** for conversation list shadow effect */
  const convListOnScoll = useCallback(() => {
    const el = convListEl.current;
    if (!el) return;
    const noScroll = conversations.length < 16;
    el.style.setProperty(
      "--shd-h",
      `${Math.min(10, (10 * conversations.length) / 32)}rem`
    );
    const topShadowOpacity = noScroll ? 0 : getScrollTopRatio();
    const btmShadowOpacity = noScroll ? 0 : 1 - topShadowOpacity;
    el.style.setProperty("--top-shd-opa", topShadowOpacity.toString());
    el.style.setProperty("--btm-shd-opa", btmShadowOpacity.toString());
  }, [conversations, convListEl, getScrollTopRatio]);

  const scrollToCurrentConvInConvList = useCallback(
    (parentEl?: HTMLElement | null, el?: HTMLElement | null) => {
      // if (!el) if (convListEl.current) convListEl.current.scrollTop = 0;
      if (!el) return;
      if (!parentEl) return;
      const parentRect = parentEl.getBoundingClientRect();
      const childRect = el.getBoundingClientRect();
      const offset = el.offsetTop - parentEl.offsetTop;
      const ratio =
        (Math.max(
          0,
          getScrollTopRatio(offset - parentEl.scrollTop - parentEl.clientHeight)
        ) -
          0.5) /
        2;
      const isInView =
        childRect.top > parentRect.top + 0.125 * parentEl.clientHeight &&
        childRect.bottom < parentRect.bottom - 0.125 * parentEl.clientHeight;
      if (!isInView) {
        parentEl.scrollTo({
          top:
            offset -
            parentEl.clientHeight / 2 +
            el.clientHeight / 2 -
            parentEl.clientHeight * ratio,
          behavior: "smooth",
        });
      }
    },
    [getScrollTopRatio]
  );

  const _lastConvId = useRef<string>();
  useEffect(() => {
    const currConvId = currConv?.id;
    const lastConvId = _lastConvId.current;
    if (lastConvId === currConvId) return;
    scrollToCurrentConvInConvList(
      convListEl.current,
      document.getElementById(convIdToKey(currConv?.id || ""))
    );
    _lastConvId.current = currConvId;
  }, [_lastConvId, currConv, scrollToCurrentConvInConvList, convListEl]);

  const isSmallScreen = useIsSmallScreen();

  useInit(() => {
    convListOnScoll();
  }, [convListOnScoll]);

  return (
    <div className="flex flex-col h-full w-full absolute">
      <div className="flex gap-2">
        <div
          className={`${
            modelSettingOpened ? "text-base pb-0.5" : "text-large pb-1"
          } pl-4 text-default-500`}
          style={{ transition: ".2s ease-out" }}
        >
          Conversations
        </div>
        <div className="flex-1 flex justify-end">
          <div className="relative">
            <div className="absolute right-0">
              <Tooltip content="New chat" placement="right">
                <Button
                  isIconOnly
                  style={{ scale: 0.67, transform: "translateY(-33%)" }}
                  variant="light"
                  color="secondary"
                  isDisabled={isLoadingConvs || isLoadingMessages}
                  onClick={() => {
                    if (isSmallScreen) closeSidebar();
                    openNewChat();
                  }}
                >
                  <IoAddOutline style={{ scale: 2.5 }} />
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col relative flex-1">
        <div className="flex-1 flex flex-col h-full w-full absolute p-1 conv-list-bg rounded-xl overflow-hidden">
          <div
            ref={convListEl}
            className="overflow-y-auto py-2 px-1 conv-list-bg conv-list"
            style={isLoadingConvs ? { minHeight: "100%" } : {}}
            onScroll={convListOnScoll}
          >
            {isLoadingConvs ? (
              <div className="w-full h-full flex-center">
                <Spinner size="lg" color="secondary" />
              </div>
            ) : (
              conversations.map((c) => (
                <ConversationButton
                  appPath={appPath}
                  conv={c}
                  sidebarLoadConv={() => () => {
                    if (isSmallScreen) closeSidebar();
                    c.select();
                  }}
                  key={convIdToKey(c.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
