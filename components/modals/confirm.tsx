import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";

export default function useModalConfirm(
  title: string = "",
  message: string = "",
  resolve?: () => void,
  reject?: () => void
) {
  const { isOpen, onClose: close, onOpen: open } = useDisclosure();
  return {
    open,
    Modal: (
      <Modal isOpen={isOpen} onClose={close} placement="bottom-center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
              <ModalBody>
                <p>{message}</p>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="flat"
                  onPress={() => {
                    if (reject) reject();
                    onClose();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    if (resolve) resolve();
                    onClose();
                  }}
                >
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
