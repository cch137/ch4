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

import { models as _models } from "@/constants/chat";
import type { ConvMeta } from "@/constants/chat/types";
import baseConverter from "@cch137/utils/str/base-converter";
import {
  useAiChatConvList,
  useAiChatConv,
  renameConv,
  deleteConv as _deleteConv,
  loadConv,
} from "@/app/apps/ai-chat/useAiChat";
import useConfirm from "@/hooks/useConfirm";
import { useIsSmallScreen } from "@/hooks/useAppDataManager";

const convIdToKey = (id?: string) => "aichat-conv-" + id || "";

function ConversationButton({
  appPath,
  conv,
  sidebarLoadConv,
}: {
  appPath: string;
  conv: ConvMeta;
  sidebarLoadConv: (c: ConvMeta) => void;
}) {
  const [isHover, setIsHover] = useState(false);
  const ref = createRef<HTMLButtonElement>();
  const { id, name: _name } = conv;
  const name = _name || baseConverter(id, "64w", 10);

  const { currentConv, isLoadingConv } = useAiChatConv();

  const isCurrentConv = conv.id === currentConv?.id;

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
    try {
      await _deleteConv(id);
    } catch {}
    setIsDeleting(false);
  }, [onConfirmDelete, setIsHover, setIsPopoverOpen, setIsDeleting, id]);

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
                    const convName = renameInput.current?.value || "";
                    setIsRenaming(true);
                    try {
                      if (await renameConv(id, convName)) onClose();
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
        isDisabled={isLoadingConv || isDeleting}
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
    conversations: convList,
    isLoadingConvList,
    currentConv,
    isLoadingConv,
  } = useAiChatConvList();

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
    const noScroll = convList.length < 16;
    el.style.setProperty(
      "--shd-h",
      `${Math.min(10, (10 * convList.length) / 32)}rem`
    );
    const topShadowOpacity = noScroll ? 0 : getScrollTopRatio();
    const btmShadowOpacity = noScroll ? 0 : 1 - topShadowOpacity;
    el.style.setProperty("--top-shd-opa", topShadowOpacity.toString());
    el.style.setProperty("--btm-shd-opa", btmShadowOpacity.toString());
  }, [convList, convListEl, getScrollTopRatio]);

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
    const currConvId = currentConv?.id;
    const lastConvId = _lastConvId.current;
    if (lastConvId === currConvId) return;
    scrollToCurrentConvInConvList(
      convListEl.current,
      document.getElementById(convIdToKey(currentConv?.id || ""))
    );
    _lastConvId.current = currConvId;
  }, [_lastConvId, currentConv, scrollToCurrentConvInConvList, convListEl]);

  const inited = useRef(false);

  const isSmallScreen = useIsSmallScreen();

  const sidebarLoadConv = useCallback(
    (conv?: ConvMeta) => {
      loadConv(conv);
      if (isSmallScreen) closeSidebar();
    },
    [isSmallScreen, closeSidebar]
  );

  useEffect(() => {
    convListOnScoll();
    if (inited.current) return;
    inited.current = true;
    loadConv(
      currentConv ||
        (!inited.current && initConvId ? { id: initConvId } : undefined)
    );
  }, [convListOnScoll, inited, currentConv, initConvId]);

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
                  isDisabled={isLoadingConvList || isLoadingConv}
                  onClick={() => sidebarLoadConv()}
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
            style={isLoadingConvList ? { minHeight: "100%" } : {}}
            onScroll={convListOnScoll}
          >
            {isLoadingConvList ? (
              <div className="w-full h-full flex-center">
                <Spinner size="lg" color="secondary" />
              </div>
            ) : (
              convList.map((c) => {
                const isCurrentConv = c.id === currentConv?.id;
                return (
                  <ConversationButton
                    appPath={appPath}
                    conv={c}
                    sidebarLoadConv={sidebarLoadConv}
                    key={convIdToKey(c.id)}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
