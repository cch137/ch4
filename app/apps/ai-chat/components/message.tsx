"use client"

import { createRef, useCallback, useState } from "react";
import { IoCopyOutline, IoCreateOutline, IoHardwareChipOutline, IoPersonOutline, IoRefresh, IoTrashOutline } from "react-icons/io5";

import { Button } from "@nextui-org/button";
import { Textarea } from "@nextui-org/input";
import { Tooltip } from "@nextui-org/tooltip";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/modal";

import Markdown from 'react-markdown';
import remarkGfm  from 'remark-gfm';

import type { SetState } from "@/constants/types";
import type { MssgItem } from "@/constants/chat/types";
import formatDate from '@cch137/utils/format/date';
import useCopyText from "@/hooks/useCopyText";

import MessageCodeBlock from "./codeblock";
import { editMessage, deleteMessage as _deleteMessage, aiChatHandleError } from "@/hooks/useAiChat";
import { TEMP } from "@/constants/chat";
import useConfirm from "@/hooks/useConfirm";

function MessageContent({
  message,
  isEditing,
  setIsEditing,
  setIsDeleting,
}: {
  message: MssgItem,
  isEditing: boolean,
  setIsEditing: SetState<boolean>,
  setIsDeleting: SetState<boolean>,
}) {
  const {
    _id,
    text,
    modl,
    ctms,
    dtms,
  } = message;
  const isModel = typeof modl === 'string';
  const disableActions = _id.startsWith(TEMP);

  const {
    isOpen: editMsgIsOpen,
    onOpen: editMsgOnOpen,
    onClose: editMsgOnClose
  } = useDisclosure();
  const [copied, copyText] = useCopyText(text);

  const msgTextInput = createRef<HTMLTextAreaElement>();

  const [isConfirmDelete, onConfirmDelete] = useConfirm();

  const deleteMessage = useCallback(async () => {
    if (onConfirmDelete()) {
      setIsDeleting(true);
      await _deleteMessage({ _id, text: '' });
      setIsDeleting(false);
    }
  }, [setIsDeleting, onConfirmDelete, _id]);

  const editMessageText = useCallback(async () => {
    const newText = msgTextInput.current?.value;
    if (!newText) return aiChatHandleError('Message is empty.');
    if (await editMessage({ _id, text: newText  })) {
      editMsgOnClose();
      return true;
    }
    return false;
  }, [msgTextInput, editMsgOnClose, _id]);

  return <>
    <Modal
      size="2xl"
      isOpen={editMsgIsOpen}
      onClose={editMsgOnClose}
    >
      <ModalContent>
        {(onClose) => (<>
          <ModalHeader className="flex flex-col gap-1">Edit Message</ModalHeader>
          <ModalBody>
            <Textarea
              classNames={{'input': 'text-base'}}
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
            <Button color="danger" variant="light" onPress={onClose} isDisabled={isEditing}>Cancel</Button>
            <Button color="primary" isDisabled={isEditing} isLoading={isEditing} onPress={async () => {
              setIsEditing(true);
              try {
                if (await editMessageText()) onClose();
              } finally {
                setIsEditing(false);
              }
            }}>Save</Button>
          </ModalFooter>
        </>)}
      </ModalContent>
    </Modal>
    <div
      className={[
        "aichat-message w-full pt-6 pb-2 px-6 rounded-xl",
        isModel ? 'model bg-default-50' : 'user bg-secondary-50',
        isModel ? 'text-default-600' : 'text-default-900',
      ].join(' ')}
    >
      {
        (isModel && disableActions && !text)
        ? (
          <div className="aichat-thinking" />
        ) : (
          <Markdown components={{code: MessageCodeBlock}} remarkPlugins={[remarkGfm]} >{text}</Markdown>
          // isModel
          //   ? <Markdown components={{code: MessageCodeBlock}} remarkPlugins={[remarkGfm]} >{text}</Markdown>
          //   : <div className="whitespace-break-spaces">{text}</div>
        )
      }
      <div className="flex justify-end items-end flex-wrap pt-2">
        {disableActions ? null : <div className="flex text-lg gap-2 aichat-message-actions">
          <Tooltip content="Delete" placement="bottom" showArrow>
            <div
              onClick={deleteMessage}
              className={isConfirmDelete ? 'flex-center text-danger-400 opacity-100' : ''}
              style={{opacity: isConfirmDelete ? 1 : undefined}}
            >
              <IoTrashOutline />
              {isConfirmDelete ? <span className="text-xs pl-1">Confirm Delete</span> : ''}
            </div>
          </Tooltip>
          <Tooltip content="Copy" placement="bottom" showArrow>
            <div
              onClick={copyText}
              className={copied ? 'flex-center text-success-400 opacity-100' : ''}
              style={{opacity: copied ? 1 : undefined}}
            >
              <IoCopyOutline />
              {copied ? <span className="text-xs pl-1">Copied</span> : ''}
            </div>
          </Tooltip>
          <Tooltip content="Edit" placement="bottom" showArrow>
            <div onClick={editMsgOnOpen}><IoCreateOutline /></div>
          </Tooltip>
          {(0 && isModel) ? <Tooltip content="Regenerate" placement="bottom" showArrow>
            <div><IoRefresh /></div>
          </Tooltip> : null}
        </div>}
        <div className={`flex-1 flex justify-end items-center ${isModel ? 'opacity-30' : 'opacity-20'} gap-2 text-xs select-none whitespace-nowrap`}>
          {(ctms) ? <span>{formatDate(new Date(ctms))}</span> : null}
          {(isModel && modl) ? <span>{modl}</span> : null}
          {(isModel && dtms) ? <span>{`t:${Math.round(dtms/10)/100}s`}</span> : null}
        </div>
      </div>
    </div>
  </>
}

export default function Message({ message }: { message: MssgItem }) {
  const isModel = typeof message.modl === 'string';
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  return (<>{isDeleting ? null :
    <div className={[
        'flex items-start justify-center w-full aichat-message-outer',
        isEditing ? 'pointer-events-none blur-sm' : '',
      ].join(' ')}
    >
      <div className='w-11'>
        <div
          className='text-2xl p-2.5 rounded-lg mt-2'
          // style={{background: isModel ? '#36634d' : '#3a3663', backdropFilter: 'blur(16px)', opacity: 0.75}}
          style={{background: isModel ? '#284A39' : '#2B284A'}}
        >
          {isModel ? <IoHardwareChipOutline /> : <IoPersonOutline />}
        </div>
      </div>
      <div className="flex-1 ml-3 aichat-message-c">
        <MessageContent
          message={message}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          setIsDeleting={setIsDeleting}
        />
      </div>
      <div className='w-11 ml-3 mt-2 aichat-message-r'>
        <div className="text-default-400 text-xs select-none text-center">
          <div> </div>
          <div> </div>
        </div>
      </div>
    </div>
  }</>)
}
