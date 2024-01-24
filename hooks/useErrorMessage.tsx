import React, { useEffect, useState, useCallback, useRef } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/modal";
import { Button } from "@nextui-org/button";

export default function useErrorMessage(defaultMessage: string = 'Oops! Something went wrong.', defaultTitle: string = 'Error') {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [title, setTitle] = useState<string>(defaultTitle);
  const [message, setMessage] = useState<string>(defaultMessage);
  const [messages, setMessages] = useState<string[]>([]);

  const _isOpen = useRef(false);
  const openErrorMessageBox = useCallback(async (message: string = defaultMessage, title: string = defaultTitle) => {
    if (_isOpen.current) return setMessages([...messages, message]);
    setTitle(title);
    setMessage(message);
    onOpen();
    _isOpen.current = true;
  }, [_isOpen, messages, onOpen, defaultMessage, defaultTitle]);

  useEffect(() => {
    if (!isOpen && messages.length) {
      setTimeout(() => openErrorMessageBox(messages.shift()), 100);
      setMessages(messages);
    }
  }, [isOpen, messages, openErrorMessageBox]);

  const _onClose = () => {
    _isOpen.current = false;
  }

  return {
    openErrorMessageBox,
    errorMessageBox: (
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} onClose={_onClose} placement="center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
              <ModalBody>
                <p>{message}</p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                {/* <Button color="primary" onPress={onClose}>
                  Action
                </Button> */}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    )
  }
}
