"use client"

import "./chat.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { AICHAT_PATH, SIDEBAR_WIDTH } from '@/constants/chat';
import { Link } from "@nextui-org/link";
import FullpageSpinner from "@/app/components/fullpage-spiner";
import { useParams } from "next/navigation";

import Sidebar from "./components/sidebar";
import AiChatContent from "./components/content";
import useErrorMessage from "@/hooks/useErrorMessage";
import { useRouter } from "next/navigation";
import { appTitle } from "@/constants/app";
import useUserInfo from "@/hooks/useUserInfo";
import Entry from "./components/entry";
import { useAiChatPage, errorBroadcaster, loadConv } from "@/hooks/useAiChat";
import useIsHeadlessBrowser from "@/hooks/useIsHeadlessBrowser";

const SMALL_SCREEN_W = 720;

export default function AiChat({appPath = AICHAT_PATH}: {appPath?: string}) {
  const params = useParams();
  const router = useRouter();
  const convId: string | undefined = [params.convId || []].flat(2)[0];

  const { openErrorMessageBox, errorMessageBox } = useErrorMessage();
  useEffect(() => {
    return errorBroadcaster.subscribe(({data}) => openErrorMessageBox(data.message, data.title));
  }, [openErrorMessageBox]);

  // sidebar stuffs
  const [isSmallScreen, setIsSmallScreem] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_WIDTH);

  const [isReady, setIsReady] = useState(false);
  const inited = useRef(false);

  const computeSidebarWidth = (isSidebarOpen: boolean, isSmallScreen: boolean) => {
    const _computedSidebarWidth = isSmallScreen
      ? window.innerWidth
      : isSidebarOpen
        ? SIDEBAR_WIDTH
        : 0;
    setSidebarWidth(_computedSidebarWidth);
  }

  const toggleSidebarOpen = useCallback(() => {
    const _isSidebarOpen = !isSidebarOpen;
    setIsSidebarOpen(_isSidebarOpen);
    computeSidebarWidth(_isSidebarOpen, isSmallScreen);
  }, [isSidebarOpen, isSmallScreen]);

  const closeSidebar = () => setIsSidebarOpen(false);

  const { currentConv } = useAiChatPage();
  const isHeadlessBrowser = useIsHeadlessBrowser();

  useEffect(() => {
    const adjustSidebarProps = () => {
      const _isSmallScreen = window.innerWidth < SMALL_SCREEN_W;
      setIsSmallScreem(_isSmallScreen);
      computeSidebarWidth(isSidebarOpen, _isSmallScreen);
    }
    adjustSidebarProps();
    window.addEventListener('resize', adjustSidebarProps);
    if (isSidebarOpen) {
      if (inited.current) localStorage.removeItem('close-sidebar');
    } else localStorage.setItem('close-sidebar', '1');
    if (!inited.current) {
      if (localStorage.getItem('close-sidebar')) {
        setIsSidebarOpen(false);
        setTimeout(() => setIsReady(true), 1);
      } else setIsReady(true);
      if (convId) loadConv(convId, true);
      inited.current = true;
    };
    return () => window.removeEventListener('resize', adjustSidebarProps)
  }, [isSmallScreen, isSidebarOpen, inited, setIsReady, convId]);

  const getPathnameData = () => {
    const pathname = `${location.pathname}${location.pathname.endsWith('/') ? '' : '/'}`;
    const [_0, _1, convId] = pathname.split('/');
    return {
      pathname,
      convId: convId || undefined,
      isNotInAiChat: sessionStorage.getItem('in-aichat') === '0',
    }
  }

  useEffect(() => {
    document.title = appTitle(currentConv ? currentConv.name || 'Chat' : 'New Chat');
  }, [currentConv]);

  useEffect(() => {
    const convId = currentConv?.id || undefined;
    const pConvId = getPathnameData().convId || undefined;
    try {
      if (pConvId !== convId) history.pushState(null, '', `${appPath}${convId || ''}`);
    } catch { router.push(`${appPath}${convId || ''}`) }
    const handlePopstat = (e: PopStateEvent) => {
      const { pathname, isNotInAiChat } = getPathnameData();
      if (isNotInAiChat) {
        if (pathname.startsWith(`${appPath}`)) router.replace(location.pathname);
        return;
      }
      const [_0, _1, convId] = pathname.split('/');
      loadConv(convId ? { id: convId } : undefined);
    }
    window.onpopstate = handlePopstat;
    sessionStorage.setItem('in-aichat', '1');
    return () => {
      sessionStorage.setItem('in-aichat', '0');
    }
  }, [router, currentConv, appPath]);

  const { auth, $inited } = useUserInfo();

  return isHeadlessBrowser
    ? (
      <div className="p-4">
        <div>Your browser does not support this page. Please use another browser.</div>
        <Link href="/" underline="hover">Back to Home</Link>
      </div>
    ) : (
      (!isReady || !$inited)
        ? (
          <FullpageSpinner />
        ) : (
          auth > 0 
          ? (
            <>
              {errorMessageBox}
              <div className="overflow-hidden">
                <Sidebar
                  appPath={appPath}
                  initConvId={convId}
                  isSmallScreen={isSmallScreen}
                  sidebarWidth={sidebarWidth}
                  isSidebarOpen={isSidebarOpen}
                  toggleSidebarOpen={toggleSidebarOpen}
                  closeSidebar={closeSidebar}
                />
                <div className="chat-content" style={{
                  top: '3.5rem',
                  left: isSmallScreen ? 0 : isSidebarOpen ? sidebarWidth : 0,
                  width: isSmallScreen ? '100dvw' : `calc(100dvw - ${sidebarWidth}px)`,
                  height: 'calc(100dvh - 3.5rem)',
                }}>
                  <AiChatContent isSmallScreen={isSmallScreen} />
                </div>
              </div>
            </>
          ) : (
            <Entry appPath={appPath} isSmallScreen={isSmallScreen} />
          )
      )
    )
}
