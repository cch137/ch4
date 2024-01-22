'use client'
import React from 'react'
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, DropdownItem, DropdownTrigger, Dropdown, DropdownMenu, Avatar, AvatarIcon } from '@nextui-org/react'
import { appName } from '@/constants/app'
import { Image } from '@nextui-org/react'
import Link from 'next/link'

export default function navbar() {
  return (
    <Navbar isBordered height={"3.5rem"}>
      <NavbarContent justify="start">
        <NavbarBrand className="mr-4">
          <Link href="/" className="flex items-center">
            <img width={36} src="/favicon.ico" />
            <div className="pl-1 text-default-900 hidden sm:block font-bold text-xl">{appName}</div>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent as="div" className="items-center" justify="end">
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
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
            <DropdownItem key="profile">
              <div className="flex items-center gap-1">
                <Avatar
                  as="button"
                  className="transition-transform"
                  color="secondary"
                  size="sm"
                  icon={<AvatarIcon />}
                />
                <p className="font-semibold text-base w-32 truncate">User</p>
              </div>
            </DropdownItem>
            <DropdownItem key="settings">Settings</DropdownItem>
            <DropdownItem key="logout" color="danger">
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </Navbar>
  )
}
