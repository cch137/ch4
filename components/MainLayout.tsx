"use client";

import Link from "next/link";
import { createRef, ReactNode, useEffect, useState } from "react";
import {
  MdAccountCircle,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
  MdLogin,
  MdMenu,
} from "react-icons/md";
import { SiDiscord } from "react-icons/si";
import { Button } from "@nextui-org/button";
import { Image } from "@nextui-org/image";
import { Skeleton } from "@nextui-org/skeleton";

import {
  appName,
  discordLink,
  PROFILE_PATHNAME,
  signInHrefWithNext,
} from "@/constants/app";
import useIsHover from "@/hooks/useIsHover";
import { useUserInfo } from "@/hooks/useAppDataManager";
import { usePathname } from "next/navigation";

const sidebarWidth = (isOpen: boolean) => (isOpen ? 256 : 48);

function HomeLink() {
  return (
    <div className="flex">
      <Link href="/" className="flex gap-1">
        <Image src="/favicon.ico" alt="Favicon" height={32} width={32} />
        <h1 className="flex-center justify-start text-xl font-bold">
          {appName}
        </h1>
      </Link>
    </div>
  );
}

function LayoutNavbar({
  showHomeLink = true,
  headerHeight = 48,
}: {
  showHomeLink?: boolean;
  headerHeight?: number;
}) {
  const { isPending, isLoggedIn, name: username } = useUserInfo();
  const pathname = usePathname();
  return (
    <div
      className="sticky z-50 top-0 w-full px-4 flex gap-2 items-center bg-neutral-900 bg-opacity-50 backdrop-blur-sm border-y-1 border-solid border-neutral-900"
      style={{ height: headerHeight }}
    >
      <div className="flex-1 text-default-600">
        {showHomeLink ? <HomeLink /> : null}
      </div>
      <Button
        as={Link}
        href={discordLink}
        variant="flat"
        isIconOnly
        className="h-8 rounded-lg text-secondary-600"
        target="_blank"
        color="secondary"
      >
        <SiDiscord className="text-xl" />
      </Button>
      <Button
        as={Link}
        href={isLoggedIn ? PROFILE_PATHNAME : signInHrefWithNext(pathname)}
        variant="flat"
        className={`h-8 rounded-lg ${
          isPending ? "px-4 text-opacity-0" : "text-default-600"
        } font-bold`}
        isDisabled={isPending}
        startContent={
          isPending ? null : isLoggedIn ? (
            <MdAccountCircle className="text-xl" />
          ) : (
            <MdLogin className="text-xl" />
          )
        }
      >
        {isPending ? (
          <Skeleton className="h-4 w-20 rounded" />
        ) : (
          `${isLoggedIn ? username : "Sign in"}`
        )}
      </Button>
    </div>
  );
}

function LayoutSidebar({
  isOpen,
  open,
  close,
  headerHeight = 48,
  children,
}: {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  headerHeight?: number;
  children: ReactNode;
}) {
  const sidebarRef = createRef<HTMLDivElement>();
  const menuRef = createRef<HTMLDivElement>();
  const sidebarIsFocus = useIsHover(sidebarRef);
  const menuIsHover = useIsHover(menuRef);

  useEffect(() => {
    const el = menuRef.current;
    if (menuIsHover || !el || el.getAttribute("data-hover") === "false") return;
    if (menuIsHover && el.getAttribute("data-hover") === "false")
      el.setAttribute("data-hover", "true");
    if (!menuIsHover && el.getAttribute("data-hover") === "true")
      el.setAttribute("data-hover", "false");
  }, [menuIsHover, menuRef]);

  return (
    <div
      className="h-dvh bg-neutral-900 bg-opacity-50 transition-width ease-out duration-500 border-x-1 border-b-1 solid border-neutral-900 shadow-lg"
      style={{ width: sidebarWidth(isOpen) }}
      ref={sidebarRef}
    >
      <div
        className="flex-center p-2 gap-2 border-y-1 border-solid border-neutral-900"
        style={{ height: headerHeight }}
      >
        {isOpen ? (
          <div className="flex-1">
            <HomeLink />
          </div>
        ) : null}
        <div
          className={`text-2xl text-default-400 transition duration-75 ${
            sidebarIsFocus || !isOpen ? "opacity-100" : "opacity-0"
          } p-1 rounded-lg cursor-pointer hover:bg-default-50`}
          onClick={isOpen ? close : open}
          ref={menuRef}
        >
          <div className="flex-center">
            {isOpen ? (
              <MdKeyboardDoubleArrowLeft />
            ) : menuIsHover ? (
              <MdKeyboardDoubleArrowRight />
            ) : (
              <MdMenu />
            )}
          </div>
        </div>
      </div>
      <div className="overflow-auto" style={{ height: "calc(100dvh - 3rem)" }}>
        {children}
      </div>
    </div>
  );
}

export default function MainLayout({
  headerHeight = 48,
  sidebar,
  overflowYHidden = false,
  children,
}: {
  headerHeight?: number;
  sidebar?: JSX.Element;
  overflowYHidden?: boolean;
  children: ReactNode;
}) {
  const [_sidebarOpen, setSidebarOpen] = useState(true);
  const sidebarOpen = Boolean(sidebar && _sidebarOpen);
  return (
    <div className="w-full h-dvh flex bg-neutral-950 text-default-600">
      {sidebar ? (
        <LayoutSidebar
          isOpen={sidebarOpen}
          open={() => setTimeout(() => setSidebarOpen(true), 100)}
          close={() => setTimeout(() => setSidebarOpen(false), 100)}
          headerHeight={headerHeight}
        >
          {sidebar}
        </LayoutSidebar>
      ) : null}
      <div
        className={`h-dvh flex-1 text-default-600 ${
          overflowYHidden ? "overflow-y-hidden" : "overflow-y-scroll"
        } transition-all ease-out duration-500`}
        style={{
          width: `calc(100vw - ${sidebarWidth(sidebarOpen)}px)`,
        }}
      >
        <LayoutNavbar showHomeLink={!sidebarOpen} headerHeight={headerHeight} />
        <div
          className="relative py-8 max-sm:py-2 px-8 max-md:px-6 max-sm:px-4"
          style={{ minHeight: `calc(100dvh - ${headerHeight}px)` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
