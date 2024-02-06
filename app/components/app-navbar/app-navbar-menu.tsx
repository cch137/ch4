'use client'

import React, { createRef, useCallback, useEffect, useState } from 'react'
import { Avatar, AvatarIcon } from '@nextui-org/avatar'
import { Button } from '@nextui-org/button'
import { discordLink } from '@/constants/app'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import useUserInfo from "@/hooks/useUserInfo";
import { AICHAT_PATH } from "@/constants/chat";
import { IoChatboxEllipsesOutline, IoGlassesOutline, IoLogInOutline, IoLogOutOutline, IoLogoDiscord, IoSettingsOutline, IoStopwatchOutline } from "react-icons/io5";

export default function AppNavbarMenu() {
  const pathname = usePathname();
  const isSignInPage = pathname === '/auth/signin';
  const isAiChatPage = `${pathname}/`.startsWith(AICHAT_PATH);

  const userInfo = useUserInfo();
  const { name: username, $inited, auth } = userInfo;
  const isSignedIn = auth > 0;
  const isLvl2 = auth >= 2;
  const isAdmin = auth >= 5;

  const menuRef = createRef<HTMLDivElement>();
  const menuTriggerRef = createRef<HTMLSpanElement>();
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuIsOpen(false), [setMenuIsOpen]);

  useEffect(() => {
    const autoCloseMenu = (e: MouseEvent) => {
      const menuEl = menuRef.current;
      if (!menuEl) return;
      const elementsUnderMouse: (Element | null)[] = [];
      // 获取鼠标下方的元素
      let el = document.elementFromPoint(e.clientX, e.clientY);
      while (el) {
        elementsUnderMouse.push(el);
        el = el.parentElement;
      }
      if (elementsUnderMouse.includes(menuTriggerRef.current)) {
        setMenuIsOpen(o => !o);
      } else if (!elementsUnderMouse.includes(menuRef.current)) {
        setMenuIsOpen(o => false);
      }
    }
    document.body.addEventListener('click', autoCloseMenu);
    return () => document.body.removeEventListener('click', autoCloseMenu);
  }, [menuRef, menuTriggerRef]);

  return (<>
    <div className="flex-center gap-2 mr-1">
      {($inited && !isSignedIn && !isSignInPage) ? <Button
        as={Link}
        href="/auth/signin"
        color="secondary"
        className="font-semibold"
        variant="solid"
        size="sm"
        startContent={<IoLogInOutline className="text-2xl" />}
      >
        Sign in
      </Button> : null}
      <Button
        as={Link}
        href={discordLink}
        target="_blank"
        startContent={<IoLogoDiscord className="text-xl -mr-1" />}
        color="secondary"
        className="text-sm font-semibold"
        variant="bordered"
        size="sm"
      >
        Join
      </Button>
    </div>
    {($inited && isSignedIn) ? <Avatar
      isBordered
      as="button"
      className={`transition-transform p-0 ${menuIsOpen ? 'opacity-75 scale-95' : ''}`}
      color="secondary"
      size="sm"
      icon={<AvatarIcon />}
      ref={menuTriggerRef}
    /> : null}
    <div
      ref={menuRef}
      className={`app-navbar-menu shadow-2xl w-52 p-2 rounded-2xl border-1 border-default-50 bg-zinc-950 absolute ${menuIsOpen ? '' : 'close'}`}
      style={{top: '3.25rem', zIndex: 10000}}
    >
      <Button
        variant="light"
        className="w-full p-2 rounded-md mb-2"
        onClick={closeMenu}
        as={Link}
        href="/profile"
      >
        <div className="w-full flex items-center gap-1.5">
          <Avatar
            as="button"
            className="transition-transform"
            color="secondary"
            size="sm"
            icon={<AvatarIcon />}
          />
          <div className="font-semibold text-base w-32 truncate text-start">{username}</div>
        </div>
      </Button>
      <Button
        variant="light"
        className="w-full pl-3 text-start h-8 rounded-md"
        onClick={closeMenu}
        as={isAiChatPage ? void 0 : Link}
        href={isAiChatPage ? void 0 : AICHAT_PATH}
        startContent={<IoChatboxEllipsesOutline className="text-2xl" />}
      >
        <div className="w-full">AI Chat</div>
      </Button>
      <Button
        variant="light"
        className="w-full pl-3 text-start h-8 rounded-md"
        onClick={closeMenu}
        as={Link}
        href="/apps/ai-asst"
        startContent={<IoStopwatchOutline className="text-2xl" />}
      >
        <div className="w-full">AI Trigger</div>
      </Button>
      {isLvl2 ? <Button
        variant="light"
        className="w-full pl-3 text-start h-8 rounded-md"
        onClick={closeMenu}
        as={Link}
        href="/apps/harimau"
        startContent={<IoGlassesOutline className="text-2xl" />}
      >
        <div className="w-full">Harimau</div>
      </Button> : null}
      {isAdmin ? <Button
        variant="light"
        className="w-full pl-3 text-start h-8 rounded-md"
        onClick={closeMenu}
        as={Link}
        href="/admin/"
        startContent={<IoSettingsOutline className="text-2xl" />}
      >
        <div className="w-full">Admin</div>
      </Button> : null}
      <Button
        variant="light"
        className="w-full pl-3 text-start h-8 rounded-md"
        onClick={closeMenu}
        as={Link}
        href="/auth/signout" color="danger"
        startContent={<IoLogOutOutline className="text-2xl" />}
      >
        <div className="w-full">Sign out</div>
      </Button>
    </div>
  </>)
}
