import React, { useEffect, useState } from "react";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure} from "@nextui-org/react";

export default function ErrorMessage(defaultMessage: string = 'Oops! Something went wrong.') {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [message, setMessage] = useState<string>(defaultMessage);
  const [messages, setMessages] = useState<string[]>([]);
  let _isOpen = false;

  const openErrorMessageBox = async (message: string = defaultMessage) => {
    if (_isOpen) return setMessages([...messages, message]);
    setMessage(message);
    onOpen()
    _isOpen = true;
  }

  useEffect(() => {
    if (!isOpen && messages.length) {
      setTimeout(() => openErrorMessageBox(messages.shift()), 100);
      setMessages(messages);
    }
  }, [isOpen, messages]);

  const _onClose = () => {
    _isOpen = false;
  }

  return {
    openErrorMessageBox,
    errorMessageBox: (
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} onClose={_onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Error</ModalHeader>
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
