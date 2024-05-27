import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { Select, SelectItem } from "@nextui-org/select";
import { useState } from "react";

type ModalSelectOptions<L extends string, V extends string> = {
  title?: string;
  message?: string;
  label?: string;
  placeholder?: string;
  defaultValue?: V;
  items: { label: L; value: V }[];
};

export default function useModalSelect<L extends string, V extends string>(
  resolve: (v: V) => void,
  options: ModalSelectOptions<L, V>
) {
  const { isOpen, onClose: close, onOpen: open } = useDisclosure();
  const {
    title = "Select",
    message,
    label = "",
    items,
    defaultValue = items[0].value,
    placeholder = "",
  } = options;
  const [value, setValue] = useState<V>(defaultValue);
  return {
    open,
    Modal: (
      <>
        <Modal isOpen={isOpen} onClose={close} placement="bottom-center">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  {title}
                </ModalHeader>
                <ModalBody>
                  {message ? <p>{message}</p> : null}
                  <Select
                    label={label}
                    aria-label={label}
                    placeholder={placeholder}
                    size="sm"
                    variant="bordered"
                    value={value}
                    defaultSelectedKeys={defaultValue ? [defaultValue] : void 0}
                    onChange={(e) =>
                      setValue((e.target.value as V) || defaultValue)
                    }
                  >
                    {items.map((i) => (
                      <SelectItem value={i.value} key={i.value}>
                        {i.label}
                      </SelectItem>
                    ))}
                  </Select>
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="danger"
                    variant="flat"
                    onPress={() => {
                      setValue(defaultValue);
                      onClose();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    onPress={() => {
                      const v = value || defaultValue;
                      if (v) {
                        resolve(v);
                        setValue(v);
                      }
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
