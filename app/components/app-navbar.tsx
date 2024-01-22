'use client'
import "./app-navbar.css";

import React, { createRef, useCallback, useEffect, useRef, useState } from 'react'
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from '@nextui-org/navbar'
import { DropdownItem, DropdownTrigger, Dropdown, DropdownMenu } from '@nextui-org/dropdown'
import { Avatar, AvatarIcon } from '@nextui-org/avatar'
import { Button } from '@nextui-org/button'
import { appName, discordLink } from '@/constants/app'
import Link from 'next/link'
import Image from 'next/image'
import { StatusResponse, UserInfo } from '@/constants/types'
import DiscordIcon from './discord-icon'
import { usePathname } from 'next/navigation'

export default function AppNavbar() {
  const inited = useRef(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean|undefined>(undefined);
  const [username, setUsername] = useState('');
  const pathname = usePathname();
  const isLoginPage = pathname === '/auth/login';

  useEffect(() => {
    if (inited.current) return;
    inited.current = true;
    (async () => {
      const { success = false, value: user }: StatusResponse<UserInfo> = await (await fetch('/api/auth/user/info')).json();
      setIsLoggedIn(Boolean(user?.name));
      if (user) {
        const { name: username } = user;
        setUsername(username);
        if (!localStorage.getItem('first')) {
          localStorage.setItem('first', '1');
          location.reload();
        }
      }
    })();
  }, []);

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
  }, [menuRef]);

  return (
    <Navbar isBordered height={"3.5rem"} maxWidth="full">
      <NavbarContent justify="start">
        <NavbarBrand>
          <Link href="/" className="flex items-center min-w-unit-8">
            <Image width={36} height={36} alt="Favicon" src="/favicon.ico" />
            <div className="pl-1 text-default-900 hidden sm:block font-bold text-xl">{appName}</div>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent as="div" className="items-center" justify="end">
        <div className="flex-center gap-2 mr-1">
          {(isLoggedIn === false && !isLoginPage) ? <Button
            as={Link}
            href="/auth/login"
            color="secondary"
            className="font-semibold"
            variant="solid"
            size="sm"
          >
            Log In
          </Button> : null}
          <Button
            as={Link}
            href={discordLink}
            target="_blank"
            startContent={<DiscordIcon />}
            color="secondary"
            className="font-semibold"
            variant="bordered"
            size="sm"
          >
            Join
          </Button>
        </div>
          <Avatar
            isBordered
            as="button"
            className={`transition-transform p-0 ${menuIsOpen ? 'opacity-75 scale-95' : ''}`}
            color="secondary"
            size="sm"
            icon={<AvatarIcon />}
            isDisabled={isLoggedIn === undefined}
            ref={menuTriggerRef}
          />
          {isLoggedIn === undefined ? null : <div
            ref={menuRef}
            className={`app-navbar-menu shadow-2xl w-52 p-2 rounded-2xl border-1 border-default-50 bg-zinc-950 absolute ${menuIsOpen ? '' : 'close'}`}
            style={{top: '3.25rem', zIndex: 10000}}
          >
            {isLoggedIn ? <Button
              variant="light"
              className="w-full p-2 rounded-md"
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
                <p className="font-semibold text-base w-32 truncate text-start">{username}</p>
              </div>
            </Button> : null}
            {(isLoggedIn || `${pathname}/`.startsWith('/login/')) ? null : <Button
              variant="light"
              className="w-full p-2 text-start h-8 rounded-md"
              onClick={closeMenu}
              as={Link}
              href="/auth/login"
            >
              <div className="w-full">Log In</div>
            </Button>}
            {`${pathname}/`.startsWith('/c/') ? null : <Button
              variant="light"
              className="w-full p-2 text-start h-8 rounded-md"
              onClick={closeMenu}
              as={Link}
              href="/c/"
            >
              <div className="w-full">AI Chat</div>
            </Button>}
            {!isLoggedIn ? null : <Button
              variant="light"
              className="w-full p-2 text-start h-8 rounded-md"
              onClick={closeMenu}
              as={Link}
              href="/auth/logout" color="danger"
            >
              <div className="w-full">Log Out</div>
            </Button>}
          </div>}
      </NavbarContent>
    </Navbar>
  )
}
