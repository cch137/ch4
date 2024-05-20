"use client";

import formatDate from "@cch137/utils/str/date";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";
import Link from "next/link";
import { createRef, useCallback, useEffect, useRef, useState } from "react";
import { IoCopyOutline, IoCreateOutline } from "react-icons/io5";
import PageSpinner from "@/components/PageSpinner";
import type { StatusResponse, UserDetails } from "@/constants/types";
import { useRouter } from "next/navigation";
import useErrorMessage from "@/hooks/useErrorMessage";
import useCopyText from "@/hooks/useCopyText";
import { useUserInfo } from "@/hooks/useAppDataManager";
import { packData } from "@cch137/utils/shuttle";
import {
  PROFILE_PATHNAME,
  SIGNOUT_PATHNAME,
  resetPwHrefWithNext,
  signInHrefWithNext,
} from "@/constants/app";
import useFetch from "@/hooks/useFetch";

function ProfileTableRow({
  name,
  value,
  editable,
  copiable,
  edit,
}: {
  name: string;
  value: string | undefined;
  editable: boolean;
  copiable: boolean;
  edit: () => void | undefined;
}) {
  const [copied, copyText] = useCopyText(value || "");
  return (
    <tr>
      <td className="p-1">
        <span className="font-bold text-default-500">{name}</span>
      </td>
      <td className="p-1 pl-4 pr-8">
        <span className="text-default-600 select-none truncate">
          {value ? value : "Unknown"}
        </span>
      </td>
      <td className="p-1">
        <div className="flex h-8 gap-1 -mr-4">
          <Button
            variant="light"
            size="sm"
            className={
              editable
                ? "h-8 text-default-600"
                : "h-8 opacity-0 pointer-events-none"
            }
            isIconOnly
            onClick={edit}
          >
            <IoCreateOutline className="text-xl" />
          </Button>
          <Button
            color={copied ? "success" : "default"}
            variant={copied ? "flat" : "light"}
            size="sm"
            className={
              copiable && value !== undefined
                ? "h-8 text-default-600"
                : "h-8 opacity-0 pointer-events-none"
            }
            isIconOnly
            onClick={copyText}
          >
            <IoCopyOutline className="text-xl" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function useUserDetails() {
  const {
    data,
    isPending,
    refresh: update,
  } = useFetch<StatusResponse<UserDetails>>("/api/auth/user/details", {
    method: "POST",
  });
  return { ...data?.value, update, isPending };
}

export default function Profile() {
  const {
    update: updateUserInfo,
    isPending: userInfoIsPending,
    ...userInfo
  } = useUserInfo();
  const {
    update: updateUserDetails,
    isPending: userDetailsIsPending,
    ...userDetails
  } = useUserDetails();

  const { name = "", isLoggedIn } = userInfo;
  const { eadd = "", ctms, mtms, atms } = userDetails || {};
  const isPending = userInfoIsPending || userDetailsIsPending;
  const update = useCallback(async () => {
    await Promise.all([updateUserInfo, updateUserDetails]);
  }, [updateUserInfo, updateUserDetails]);

  const color = "secondary";

  const router = useRouter();
  const redirectToSignIn = useCallback(
    () => router.replace(signInHrefWithNext(PROFILE_PATHNAME)),
    [router]
  );
  const goToResetPassword = useCallback(
    () => router.push(resetPwHrefWithNext(PROFILE_PATHNAME)),
    [router]
  );

  const { openErrorMessageBox, errorMessageBox } = useErrorMessage();

  const {
    isOpen: editUsernameIsOpen,
    onOpen: editUsernameOnOpen,
    onClose: editUsernameOnClose,
  } = useDisclosure();
  const editUsernameInput = createRef<HTMLInputElement>();
  const [isPostingUsername, setIsPostingUsername] = useState<
    boolean | undefined
  >(false);

  const {
    isOpen: editEmailIsOpen,
    onOpen: editEmailOnOpen,
    onClose: editEmailOnClose,
  } = useDisclosure();
  const editEmailInput = createRef<HTMLInputElement>();
  const editCodeInput = createRef<HTMLInputElement>();
  const [isSentCode, setIsSentCode] = useState(false);
  const [isPostingEmail, setIsPostingEmail] = useState<boolean | undefined>(
    false
  );

  const redirected = useRef(false);
  useEffect(() => {
    if (redirected.current) return;
    if (!isPending && !isLoggedIn) {
      redirected.current = true;
      redirectToSignIn();
      setIsPostingUsername(undefined);
    }
  }, [isPending, isLoggedIn, redirectToSignIn, setIsPostingUsername]);

  return (
    <>
      {errorMessageBox}
      <Modal
        size="sm"
        isOpen={editUsernameIsOpen}
        onClose={editUsernameOnClose}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit Username
              </ModalHeader>
              <ModalBody>
                <Input
                  classNames={{ input: "text-base" }}
                  autoFocus
                  variant="bordered"
                  color={color}
                  type="text"
                  ref={editUsernameInput}
                  isDisabled={isPostingUsername}
                  defaultValue={name}
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={onClose}
                  isDisabled={isPostingUsername}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  isDisabled={isPostingUsername}
                  isLoading={isPostingUsername}
                  onPress={async () => {
                    const newUsername = editUsernameInput.current?.value;
                    if (!newUsername)
                      return openErrorMessageBox("Username cannot be empty");
                    setIsPostingUsername(true);
                    try {
                      const { success, message }: StatusResponse = await (
                        await fetch("/api/auth/user/name", {
                          method: "PUT",
                          body: newUsername,
                        })
                      ).json();
                      if (success) onClose();
                      else openErrorMessageBox(message);
                    } finally {
                      await update();
                      setIsPostingUsername(false);
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
      <Modal
        size="sm"
        isOpen={editEmailIsOpen}
        onClose={() => (editEmailOnClose(), setIsSentCode(false))}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit Email
              </ModalHeader>
              <ModalBody>
                <Input
                  classNames={{ input: "text-base" }}
                  autoFocus
                  variant="bordered"
                  color={color}
                  type="email"
                  label="New Email"
                  ref={editEmailInput}
                  isDisabled={isPostingEmail}
                />
                <Input
                  classNames={{ input: "text-base" }}
                  variant="bordered"
                  color={color}
                  type="text"
                  label="Verification Code"
                  ref={editCodeInput}
                  isDisabled={isPostingEmail}
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={onClose}
                  isDisabled={isPostingEmail}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  isDisabled={isPostingEmail}
                  isLoading={isPostingEmail}
                  onPress={async () => {
                    const eadd = editEmailInput.current?.value;
                    const code = editCodeInput.current?.value;
                    if (!eadd)
                      return openErrorMessageBox("Email cannot be empty");
                    if (isSentCode) {
                      if (!code)
                        return openErrorMessageBox(
                          "Verification code cannot be empty"
                        );
                      setIsPostingEmail(true);
                      try {
                        const { success, message }: StatusResponse = await (
                          await fetch("/api/auth/user/eadd", {
                            method: "PUT",
                            body: JSON.stringify({ eadd, code }),
                          })
                        ).json();
                        if (success) onClose();
                        else openErrorMessageBox(message);
                      } finally {
                        await update();
                        setIsPostingEmail(false);
                      }
                    } else {
                      setIsPostingEmail(true);
                      const { success, message }: StatusResponse = await (
                        await fetch("/api/auth/user/eadd", {
                          method: "POST",
                          body: packData({ action: 1, eadd }, 377417, 666),
                        })
                      ).json();
                      if (success) setIsSentCode(true);
                      if (message) openErrorMessageBox(message);
                      setIsPostingEmail(false);
                    }
                  }}
                >
                  {isSentCode
                    ? "Save"
                    : isPostingEmail
                    ? "Sending email"
                    : "Send Verification Code"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      {isPending || !isLoggedIn ? (
        <PageSpinner />
      ) : (
        <div
          className="max-w-full flex flex-col px-2 m-auto"
          style={{
            width: 540,
            userSelect: isPostingUsername ? "none" : "auto",
          }}
        >
          <h1 className="text-3xl pt-8 pb-4 px-1 font-bold text-default-600">
            Profile
          </h1>
          <div className="w-full pb-4 overflow-x-auto">
            <table>
              <tbody>
                {(
                  [
                    ["Username", name, true, true, editUsernameOnOpen],
                    ["Email", eadd, true, true, editEmailOnOpen],
                    ["Password", "********", true, false, goToResetPassword],
                    [
                      "Created",
                      !ctms ? undefined : formatDate(new Date(ctms)),
                      false,
                      true,
                      void 0,
                    ],
                    [
                      "Modified",
                      !mtms ? undefined : formatDate(new Date(mtms)),
                      false,
                      true,
                      void 0,
                    ],
                    [
                      "Accessed",
                      !atms ? undefined : formatDate(new Date(atms)),
                      false,
                      true,
                      void 0,
                    ],
                  ] as [
                    string,
                    string | undefined,
                    boolean,
                    boolean,
                    () => void | undefined
                  ][]
                ).map(([name, value, editable, copiable, edit], i) => (
                  <ProfileTableRow
                    key={i}
                    name={name}
                    value={value}
                    editable={editable}
                    copiable={copiable}
                    edit={edit}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex mt-8">
            <Button
              variant="ghost"
              className="min-w-unit-24"
              color="danger"
              as={Link}
              href={SIGNOUT_PATHNAME}
            >
              Sign out
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
