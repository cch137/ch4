"use client";

import {
  ClassAttributes,
  HTMLAttributes,
  createRef,
  useCallback,
  useState,
} from "react";
import {
  IoCopyOutline,
  IoCreateOutline,
  IoHardwareChipOutline,
  IoPersonOutline,
  IoRefresh,
  IoTrashOutline,
} from "react-icons/io5";

import { Button } from "@nextui-org/button";
import { Textarea } from "@nextui-org/input";
import { Tooltip } from "@nextui-org/tooltip";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/modal";
import { Spinner } from "@nextui-org/spinner";

import Markdown, { ExtraProps } from "react-markdown";
import remarkGfm from "remark-gfm";

import type { SetState } from "@/constants/types";
import formatDate from "@cch137/utils/str/date";
import useCopyText from "@/hooks/useCopyText";

import MessageCodeBlock from "./codeblock";
import type { Message } from "@/app/apps/ai-chat/useAiChat";
import {
  aiChatHandleError,
  useAiChatMessage,
} from "@/app/apps/ai-chat/useAiChat";
import { CONTENT_MAX_W, TEMP } from "@/constants/chat";
import useConfirm from "@/hooks/useConfirm";
import { useIsSmallScreen } from "@/hooks/useAppDataManager";

function MessageA({
  className,
  children,
  ...props
}: ClassAttributes<HTMLAnchorElement> &
  HTMLAttributes<HTMLAnchorElement> &
  ExtraProps) {
  return (
    <a
      // @ts-ignore
      href={props.href}
      target="_blank"
      className={
        "underline opacity-75 decoration-default-500 hover:opacity-90 transition " +
        className
      }
      {...props}
    >
      {String(children).replace(/\n$/, "")}
    </a>
  );
}

function MessageContent({
  message,
  isEditing,
  setIsEditing,
  setIsDeleting,
}: {
  message: Message;
  isEditing: boolean;
  setIsEditing: SetState<boolean>;
  setIsDeleting: SetState<boolean>;
}) {
  const { _id, text, modl, ctms, dtms } = message.source;
  const isModel = typeof modl === "string";
  const disableActions = _id.startsWith(TEMP);

  const {
    isOpen: editMsgIsOpen,
    onOpen: editMsgOnOpen,
    onClose: editMsgOnClose,
  } = useDisclosure();
  const [copied, copyText] = useCopyText(text);

  const msgTextInput = createRef<HTMLTextAreaElement>();

  const [isConfirmDelete, onConfirmDelete] = useConfirm();
  const { isDeletingMessage } = useAiChatMessage();

  const deleteMessage = useCallback(async () => {
    if (isDeletingMessage) return;
    if (onConfirmDelete()) {
      setIsDeleting(true);
      await message.delete();
      setIsDeleting(false);
    }
  }, [isDeletingMessage, setIsDeleting, onConfirmDelete, message]);

  const editMessageText = useCallback(async () => {
    const newText = msgTextInput.current?.value;
    if (!newText) return aiChatHandleError("Message is empty.");
    return await message.edit(newText);
  }, [msgTextInput, message]);

  const cIndex = message.nthChild;
  const cLength = message.siblings.length;

  return (
    <>
      <Modal size="2xl" isOpen={editMsgIsOpen} onClose={editMsgOnClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit message
              </ModalHeader>
              <ModalBody>
                <Textarea
                  classNames={{ input: "text-base" }}
                  autoFocus
                  variant="bordered"
                  color="secondary"
                  type="text"
                  ref={msgTextInput}
                  isDisabled={isEditing}
                  defaultValue={text}
                  maxRows={16}
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={onClose}
                  isDisabled={isEditing}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  isDisabled={isEditing}
                  isLoading={isEditing}
                  onPress={async () => {
                    setIsEditing(true);
                    try {
                      if (await editMessageText()) onClose();
                    } finally {
                      setIsEditing(false);
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
      <div className="aichat-message react-markdown w-full">
        <div className={isModel ? "text-default-600" : "text-default-800"}>
          {isModel && disableActions && !text ? (
            <div className="aichat-thinking" />
          ) : (
            <Markdown
              components={{ code: MessageCodeBlock, a: MessageA }}
              remarkPlugins={[remarkGfm]}
            >
              {text}
            </Markdown>
            // isModel
            //   ? <Markdown components={{code: MessageCodeBlock}} remarkPlugins={[remarkGfm]} >{text}</Markdown>
            //   : <div className="whitespace-break-spaces">{text}</div>
          )}
        </div>
        <div className="flex justify-end items-center flex-wrap pt-2">
          {disableActions ? null : (
            <div className="flex text-lg gap-2 aichat-message-actions">
              <Tooltip content="Delete" placement="bottom" showArrow>
                <div
                  onClick={deleteMessage}
                  className={`${
                    isConfirmDelete
                      ? "flex-center text-danger-400 opacity-100"
                      : ""
                  } ${isDeletingMessage ? "pointer-events-none" : ""}`}
                  style={{ opacity: isConfirmDelete ? 1 : undefined }}
                >
                  {isDeletingMessage ? (
                    <div
                      style={{ height: 18, width: 18 }}
                      className="flex-center"
                    >
                      <Spinner size="sm" color="default" />
                    </div>
                  ) : (
                    <IoTrashOutline />
                  )}
                  {isConfirmDelete ? (
                    <span className="text-xs pl-1">Confirm Delete</span>
                  ) : (
                    ""
                  )}
                </div>
              </Tooltip>
              <Tooltip content="Copy" placement="bottom" showArrow>
                <div
                  onClick={copyText}
                  className={
                    copied ? "flex-center text-success-500 opacity-100" : ""
                  }
                  style={{ opacity: copied ? 1 : undefined }}
                >
                  <IoCopyOutline />
                  {copied ? <span className="text-xs pl-1">Copied!</span> : ""}
                </div>
              </Tooltip>
              <Tooltip content="Edit" placement="bottom" showArrow>
                <div onClick={editMsgOnOpen}>
                  <IoCreateOutline />
                </div>
              </Tooltip>
              {isModel ? (
                <Tooltip content="Regenerate" placement="bottom" showArrow>
                  <div onClick={() => message.regenerate()}>
                    <IoRefresh className="rotate-45" />
                  </div>
                </Tooltip>
              ) : null}
            </div>
          )}
          {cLength > 1 ? (
            <div className="text-sm px-2 flex-center select-none">
              <span
                onClick={() => message.gotoSibling(-1)}
                className={`cursor-pointer font-semibold px-1 ${
                  cIndex === 0 ? "opacity-25" : "opacity-75"
                }`}
              >
                {"<"}
              </span>
              <span className="text-default-500 font-base">
                {cIndex + 1}/{cLength}
              </span>
              <span
                onClick={() => message.gotoSibling(+1)}
                className={`cursor-pointer font-semibold px-1 ${
                  cIndex >= cLength - 1 ? "opacity-25" : "opacity-75"
                }`}
              >
                {">"}
              </span>
            </div>
          ) : null}
          <div className="flex-1 flex justify-end items-center font-semibold text-default-200 gap-2 text-xs select-none whitespace-nowrap">
            {isModel && modl ? <span>{modl}</span> : null}
            {isModel && dtms ? (
              <span>{`t:${Math.round(dtms / 10) / 100}s`}</span>
            ) : null}
            {ctms ? (
              <span className="text-default-300">
                {formatDate(new Date(ctms), "yyyy/MM/dd HH:mm")}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}

export default function MessageComponent({ message }: { message: Message }) {
  const isModel = message.isModel;
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isSmallScreen = useIsSmallScreen();

  return (
    <>
      {isDeleting ? null : (
        <div
          className={[
            "w-full aichat-message-wrapper flex-center pt-6 pb-4",
            isSmallScreen ? "px-4" : "px-8",
            isModel ? "model" : "user",
          ].join(" ")}
        >
          <div
            className={[
              "flex items-start justify-center w-full",
              isEditing ? "pointer-events-none blur-sm" : "",
            ].join(" ")}
            style={{ maxWidth: CONTENT_MAX_W }}
          >
            <div className="w-8 flex flex-col gap-2">
              <div className="flex items-start justify-start">
                <div
                  className="flex-center p-2 text-lg rounded-full"
                  style={{ background: isModel ? "#284A39" : "#2B284A" }}
                >
                  {isModel ? <IoHardwareChipOutline /> : <IoPersonOutline />}
                </div>
              </div>
            </div>
            <div className="flex-1 ml-3 px-2 aichat-message-c">
              <MessageContent
                message={message}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                setIsDeleting={setIsDeleting}
              />
            </div>
            <div className="w-8 ml-3 aichat-message-r" />
          </div>
        </div>
      )}
    </>
  );
}
