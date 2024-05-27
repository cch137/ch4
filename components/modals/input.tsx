import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/modal";
import { Input, Textarea } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { useState } from "react";

type ModalInputOptions = {
  title?: string;
  message?: string;
  label?: string;
  defaultValue?: string;
  placeholder?: string;
  textarea?: boolean;
};

export default function useModalInput(
  resolve: (s: string) => void,
  options: ModalInputOptions = {}
) {
  const { isOpen, onClose: close, onOpen: open } = useDisclosure();
  const {
    title = "Input",
    message,
    label = "",
    defaultValue = "",
    placeholder = "",
    textarea = false,
  } = options;
  const [value, setValue] = useState("");
  return {
    open,
    Modal: (
      <>
        <Modal
          isOpen={isOpen}
          onClose={close}
          placement="bottom-center"
          size={textarea ? "3xl" : void 0}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  {title}
                </ModalHeader>
                <ModalBody>
                  {message ? <p>{message}</p> : null}
                  {textarea ? (
                    <Textarea
                      label={label}
                      placeholder={placeholder}
                      variant="bordered"
                      onValueChange={(s) => setValue(s)}
                      value={value || defaultValue}
                      defaultValue={defaultValue}
                      autoFocus
                    />
                  ) : (
                    <Input
                      label={label}
                      type="text"
                      placeholder={placeholder}
                      variant="bordered"
                      onValueChange={(s) => setValue(s)}
                      value={value || defaultValue}
                      defaultValue={defaultValue}
                      autoFocus
                      autoComplete="off"
                    />
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="danger"
                    variant="flat"
                    onPress={() => {
                      setValue("");
                      onClose();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    onPress={() => {
                      resolve(value);
                      setValue("");
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
      </>
    ),
  };
}
