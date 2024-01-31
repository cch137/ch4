"use client"

import formatDate from "@cch137/utils/format/date";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/table";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/modal";
import Link from "next/link";
import { createRef, useCallback, useEffect, useState } from "react";
import { IoCopyOutline, IoCreateOutline } from "react-icons/io5";
import FullpageSpinner from "@/app/components/fullpage-spiner";
import type { StatusResponse, UserDetails, UserInfo } from "@/constants/types";
import { useRouter } from 'next/navigation';
import useErrorMessage from '@/hooks/useErrorMessage';
import useCopyText from "@/hooks/useCopyText";
import { userInfoStore } from "@/hooks/useUserInfo";
import { packData } from "@cch137/utils/shuttle";

function RenderTableRow([key, value, editable, copiable, edit]: [string, string | undefined, boolean, boolean, () => void | undefined]) {
  const [copied, copyText] = useCopyText(value || '');
  return <TableRow key={key}>
    <TableCell className="font-bold text-default-500">{key}</TableCell>
    <TableCell className={(!value || !copiable) ? 'text-default-300 select-none' : ''}>
      {value ? value : 'Unknown'}
    </TableCell>
    <TableCell>
      <div className="flex h-8 gap-1 -mr-4">
        <Button
          variant="light"
          size="sm"
          className={editable ? 'h-8 text-default-600' : 'h-8 opacity-0 pointer-events-none'}
          isIconOnly
          onClick={edit}
        >
          <IoCreateOutline style={{scale:1.5}} />
        </Button>
        <Button
          color={copied ? 'success' : 'default'}
          variant={copied ? 'flat' : 'light'}
          size="sm"
          className={(copiable && value !== undefined) ? 'h-8 text-default-600' : 'h-8 opacity-0 pointer-events-none'}
          isIconOnly
          onClick={copyText}
        >
          <IoCopyOutline style={{scale:1.5}} />
        </Button>
      </div>
    </TableCell>
  </TableRow>
}

type UserProfile = UserInfo & UserDetails;

export default function Profile() {
  const [user, setUser] = useState<UserProfile>(userInfoStore.$object);
  
  useEffect(() => userInfoStore.$on((o) => setUser((u) => ({...u, ...o}))), []);

  const color = 'secondary';

  const router = useRouter();
  const redirectToSignIn = () => router.replace('/auth/signin?next=/profile');
  const goToResetPassword = () => router.push('/auth/reset-password');

  const { openErrorMessageBox, errorMessageBox } = useErrorMessage();

  const {
    isOpen: editUsernameIsOpen,
    onOpen: editUsernameOnOpen,
    onClose: editUsernameOnClose
  } = useDisclosure();
  const editUsernameInput = createRef<HTMLInputElement>();
  const [isPostingUsername, setIsPostingUsername] = useState<boolean|undefined>(false);

  const {
    isOpen: editEmailIsOpen,
    onOpen: editEmailOnOpen,
    onClose: editEmailOnClose
  } = useDisclosure();
  const editEmailInput = createRef<HTMLInputElement>();
  const editCodeInput = createRef<HTMLInputElement>();
  const [isSentCode, setIsSentCode] = useState(false);
  const [isPostingEmail, setIsPostingEmail] = useState<boolean|undefined>(false);

  const {
    id = '',
    name = '',
    eadd = '',
    ctms,
    mtms,
    atms,
  } = user || {};

  const updateDetails = useCallback(async (controller = new AbortController()) => {
    const { success, message, value: details } = await (await fetch('/api/auth/user/details', {
      method: 'POST',
      signal: controller.signal
    })).json() as StatusResponse<UserDetails>;
    if (controller.signal.aborted) return;
    if (success && details) setUser((u) => ({...u, ...details}));
    if (!success || message) openErrorMessageBox(message || 'Faied to fetch profile');
  }, [setUser, openErrorMessageBox]);

  return (<>
    {errorMessageBox}
    <FullpageSpinner callback={async () => {
      const controller = new AbortController();
      const res = updateDetails(controller);
      if ((await userInfoStore.$init()).auth <= 0) return controller.abort(), redirectToSignIn(), setIsPostingUsername(undefined);
      await res;
    }} />
    <Modal 
      size="sm"
      isOpen={editUsernameIsOpen}
      onClose={editUsernameOnClose}
    >
      <ModalContent>
        {(onClose) => (<>
          <ModalHeader className="flex flex-col gap-1">Edit Username</ModalHeader>
          <ModalBody>
            <Input
              classNames={{'input': 'text-base'}}
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
            <Button color="danger" variant="light" onPress={onClose} isDisabled={isPostingUsername}>Cancel</Button>
            <Button color="primary" isDisabled={isPostingUsername} isLoading={isPostingUsername} onPress={async () => {
              const newUsername = editUsernameInput.current?.value;
              if (!newUsername) return openErrorMessageBox('Username cannot be empty');
              setIsPostingUsername(true);
              try {
                const { success, message }: StatusResponse = await (await fetch('/api/auth/user/name', {
                  method: 'PUT',
                  body: newUsername,
                })).json();
                if (success) onClose();
                else openErrorMessageBox(message);
              } finally {
                await userInfoStore.$update();
                setIsPostingUsername(false);
              }
            }}>Save</Button>
          </ModalFooter>
        </>)}
      </ModalContent>
    </Modal>
    <Modal 
      size="sm"
      isOpen={editEmailIsOpen}
      onClose={() => (editEmailOnClose(), setIsSentCode(false))}
    >
      <ModalContent>
        {(onClose) => (<>
          <ModalHeader className="flex flex-col gap-1">Edit Email</ModalHeader>
          <ModalBody>
            <Input
              classNames={{'input': 'text-base'}}
              autoFocus
              variant="bordered"
              color={color}
              type="email"
              label="New Email"
              ref={editEmailInput}
              isDisabled={isPostingEmail}
            />
            <Input
              classNames={{'input': 'text-base'}}
              variant="bordered"
              color={color}
              type="text"
              label="Verification Code"
              ref={editCodeInput}
              isDisabled={isPostingEmail}
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose} isDisabled={isPostingEmail}>Cancel</Button>
            <Button color="primary" isDisabled={isPostingEmail} isLoading={isPostingEmail} onPress={async () => {
              const eadd = editEmailInput.current?.value;
              const code = editCodeInput.current?.value;
              if (!eadd) return openErrorMessageBox('Email cannot be empty');
              if (isSentCode) {
                if (!code) return openErrorMessageBox('Verification code cannot be empty');
                setIsPostingEmail(true);
                try {
                  const { success, message }: StatusResponse = await (await fetch('/api/auth/user/eadd', {
                    method: 'PUT',
                    body: JSON.stringify({eadd, code}),
                  })).json();
                  if (success) onClose();
                  else openErrorMessageBox(message);
                } finally {
                  await updateDetails();
                  setIsPostingEmail(false);
                }
              } else {
                setIsPostingEmail(true);
                const { success, message }: StatusResponse = await (await fetch('/api/auth/user/eadd', {
                  method: 'POST',
                  body: packData({ action: 1, eadd }, 377417, 666)
                })).json();
                if (success) setIsSentCode(true);
                if (message) openErrorMessageBox(message);
                setIsPostingEmail(false);
              }
            }}>{isSentCode ? 'Save' : isPostingEmail ? 'Sending email' : 'Send Verification Code'}</Button>
          </ModalFooter>
        </>)}
      </ModalContent>
    </Modal>
    <div className="w-full flex-center py-8 absolute left-0 top-14" style={({visibility: isPostingUsername === undefined ? 'hidden' : 'visible'})}>
      <div className="max-w-full flex flex-col" style={{width: 540}}>
        <h1 className="text-4xl pt-8 pb-4 pl-7 font-bold text-default-600">Profile</h1>
        <Table hideHeader classNames={{
          'wrapper': 'bg-transparent text-default-600',
          'td': 'text-base',
        }}>
          <TableHeader>
            <TableColumn>key</TableColumn>
            <TableColumn>value</TableColumn>
            <TableColumn>action</TableColumn>
          </TableHeader>
          <TableBody>
            {([
              ['Username', name, true, true, editUsernameOnOpen],
              ['Email', eadd, true, true, editEmailOnOpen],
              ['Password', '********', true, false, goToResetPassword],
              ['Created', !ctms ? undefined : formatDate(new Date(ctms)), false, true, void 0],
              ['Modified', !mtms ? undefined : formatDate(new Date(mtms)), false, true, void 0],
              ['Accessed', !atms ? undefined : formatDate(new Date(atms)), false, true, void 0],
            ] as [string, string | undefined, boolean, boolean, () => void | undefined][])
              .map(RenderTableRow)}
          </TableBody>
        </Table>
        <div className="flex-center mt-16">
          <Button variant="ghost" className="min-w-unit-24" color="danger" as={Link} href='/auth/signout'>
            Sign out
          </Button>
        </div>
      </div>
    </div>
  </>)
}
