'use client'
import "./app-navbar.css";

import React, { useEffect, useRef, useState } from 'react'
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
        <Dropdown placement="bottom-end">
          <DropdownTrigger className={isLoggedIn === undefined ? 'cursor-wait opacity-75' : ''} disabled={isLoggedIn === undefined}>
            <Avatar
              isBordered
              as="button"
              className="transition-transform"
              color="secondary"
              size="sm"
              icon={<AvatarIcon />}
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem key="profile" as={Link} href="/profile" style={{display: !isLoggedIn ? 'none' : ''}}>
              <div className="flex items-center gap-1.5">
                <Avatar
                  as="button"
                  className="transition-transform"
                  color="secondary"
                  size="sm"
                  icon={<AvatarIcon />}
                />
                <p className="font-semibold text-base w-32 truncate">{username}</p>
              </div>
            </DropdownItem>
            <DropdownItem key="login" as={Link} href="/auth/login" color="success" style={{display: isLoggedIn ? 'none' : ''}}>
              Log In
            </DropdownItem>
            <DropdownItem key="aichat" as={Link} href="/c/" style={{display: `${pathname}/`.startsWith('/c/') ? 'none' : ''}}>
              AI Chat
            </DropdownItem>
            <DropdownItem key="logout" as={Link} href="/auth/logout" color="danger" style={{display: !isLoggedIn ? 'none' : ''}}>
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </Navbar>
  )
}
