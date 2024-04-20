"use client";

import "./chat.css";
import { useEffect, useRef, useState } from "react";
import { AICHAT_PATH, AICHAT_SHORTPATH, SIDEBAR_WIDTH } from "@/constants/chat";
import { Link } from "@nextui-org/link";
import FullpageSpinner from "@/app/components/fullpage-spiner";
import { useParams } from "next/navigation";

import Sidebar from "./components/sidebar";
import AiChatContent from "./components/content";
import useErrorMessage from "@/hooks/useErrorMessage";
import { useRouter } from "next/navigation";
import { appTitle } from "@/constants/app";
import useUserInfo from "@/hooks/useUserInfo";
import SigninToContinue from "../../components/signin-to-continue";
import { useAiChatPage, errorBroadcaster, loadConv } from "@/hooks/useAiChat";
import useIsHeadlessBrowser from "@/hooks/useIsHeadlessBrowser";
import useIsSmallScreen from "@/hooks/useIsSmallScreen";

export default function AiChatApp({
  appPath = AICHAT_PATH,
}: {
  appPath?: string;
}) {
  const params = useParams();
  const router = useRouter();
  const convId: string | undefined = [params.convId || []].flat(2)[0];

  const { openErrorMessageBox, errorMessageBox } = useErrorMessage();
  useEffect(() => {
    return errorBroadcaster.subscribe(({ data }) =>
      openErrorMessageBox(data.message, data.title)
    );
  }, [openErrorMessageBox]);

  // sidebar stuffs
  const isSmallScreen = useIsSmallScreen();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarWidth = isSmallScreen
    ? typeof window === "undefined"
      ? 0
      : window.innerWidth
    : isSidebarOpen
    ? SIDEBAR_WIDTH
    : 0;

  const [isReady, setIsReady] = useState(false);
  const inited = useRef(false);

  const toggleSidebarOpen = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const { currentConv } = useAiChatPage();
  const isHeadlessBrowser = useIsHeadlessBrowser();

  useEffect(() => {
    if (isSidebarOpen) {
      if (inited.current) localStorage.removeItem("close-sidebar");
    } else localStorage.setItem("close-sidebar", "1");
    if (!inited.current) {
      if (localStorage.getItem("close-sidebar")) {
        closeSidebar();
        setTimeout(() => setIsReady(true), 1);
      } else setIsReady(true);
      if (convId) loadConv(convId, true);
      inited.current = true;
    }
  }, [isSidebarOpen, inited, setIsReady, convId]);

  const getPathnameData = () => {
    const pathname = `${location.pathname}${
      location.pathname.endsWith("/") ? "" : "/"
    }`;
    const convId = pathname
      .split("/")
      .at(pathname.startsWith(AICHAT_SHORTPATH) ? 2 : 3);
    return {
      pathname,
      convId: convId || undefined,
      isNotInAiChat: sessionStorage.getItem("in-aichat") === "0",
    };
  };

  useEffect(() => {
    document.title = appTitle(
      currentConv ? currentConv.name || "Chat" : "New Chat"
    );
  }, [currentConv]);

  useEffect(() => {
    const convId = currentConv?.id || undefined;
    const pConvId = getPathnameData().convId || undefined;
    try {
      if (pConvId !== convId)
        history.pushState(null, "", `${appPath}${convId || ""}`);
    } catch {
      router.push(`${appPath}${convId || ""}`);
    }
    const handlePopstat = (e: PopStateEvent) => {
      const { pathname, isNotInAiChat, convId } = getPathnameData();
      if (isNotInAiChat) {
        if (pathname.startsWith(`${appPath}`))
          router.replace(location.pathname);
        return;
      }
      loadConv(convId ? { id: convId } : undefined);
    };
    window.onpopstate = handlePopstat;
    sessionStorage.setItem("in-aichat", "1");
    return () => {
      sessionStorage.setItem("in-aichat", "0");
    };
  }, [router, currentConv, appPath]);

  const { isPending, isLoggedIn } = useUserInfo();

  if (isPending || !isReady) return <FullpageSpinner />;

  if (!isLoggedIn)
    return (
      <SigninToContinue
        nextPath={appPath}
        title="AI Chat"
        descriptions={[
          "A simple AI chat app by @cch137.",
          "Offers various models for free.",
          "This is for everyone.",
        ]}
      />
    );

  if (isHeadlessBrowser)
    return (
      <div className="p-4">
        <div>
          Your browser does not support this page. Please use another browser.
        </div>
        <Link href="/" underline="hover">
          Back to Home
        </Link>
      </div>
    );

  return (
    <>
      {errorMessageBox}
      <div
        id="aichat"
        className="absolute top-0 left-0"
        style={{ width: "100dvw", height: "100dvh" }}
      >
        <div className="overflow-hidden" style={{ maxWidth: "100dvw" }}>
          <Sidebar
            appPath={appPath}
            initConvId={convId}
            sidebarWidth={sidebarWidth}
            isSidebarOpen={isSidebarOpen}
            toggleSidebarOpen={toggleSidebarOpen}
            closeSidebar={closeSidebar}
          />
        </div>
        <div
          className="chat-content"
          style={{
            top: "3rem",
            right: 0,
            width: isSmallScreen
              ? "100dvw"
              : `calc(100dvw - ${sidebarWidth}px)`,
            height: "calc(100dvh - 3rem)",
          }}
        >
          <AiChatContent />
        </div>
      </div>
    </>
  );
}
