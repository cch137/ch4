import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { useCallback, useState } from "react";

type ModalInputOptions = {
  title?: string;
  message: string;
};

function useModalMessage(
  title: string,
  message: string
): { open: (message?: string) => void; Modal: React.ReactNode };
function useModalMessage(message?: string): {
  open: (message?: string) => void;
  Modal: React.ReactNode;
};
function useModalMessage(options?: ModalInputOptions): {
  open: (message?: string) => void;
  Modal: React.ReactNode;
};
function useModalMessage(arg1?: string | ModalInputOptions, arg2?: string) {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { title = "Message", message: msg = "" } =
    typeof arg1 === "object"
      ? arg1
      : typeof arg2 === "string"
      ? { title: arg1, message: arg2 }
      : { message: arg1 };
  const [displayMessage, setDisplayMessage] = useState("");
  const open = useCallback(
    (message?: string) => {
      setDisplayMessage(message || msg);
      onOpen();
    },
    [onOpen, setDisplayMessage, msg]
  );
  const close = useCallback(() => {
    setDisplayMessage("");
    onClose();
  }, [onClose, setDisplayMessage]);
  return {
    open,
    Modal: (
      <Modal isOpen={isOpen} onClose={close} placement="bottom-center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
              <ModalBody>
                <p>{displayMessage}</p>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onClose}>
                  OK
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    ),
  };
}

export default useModalMessage;
