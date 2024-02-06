'use client'
import "./app-navbar.css";

import { Navbar, NavbarBrand, NavbarContent } from '@nextui-org/navbar'
import { appName } from '@/constants/app'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
 
const AppNavbarMenu = dynamic(() => import('./app-navbar-menu'), { ssr: false })
 
export default function AppNavbar() {
  return (<>
    <Navbar isBordered height={"3.5rem"} maxWidth="full">
      <NavbarContent justify="start">
        <NavbarBrand>
          <div>
            <Link href="/" className="flex items-center min-w-unit-8">
              <Image width={36} height={36} alt="Favicon" src="/favicon.ico" className="pointer-events-none" priority={true} />
              <div className="pl-1 text-default-900 hidden sm:block font-bold text-xl">{appName}</div>
            </Link>
          </div>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent as="div" className="items-center" justify="end">
        <AppNavbarMenu />
      </NavbarContent>
    </Navbar>
  </>)
}
