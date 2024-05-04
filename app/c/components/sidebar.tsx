"use client";

import { useState } from "react";

import { Button } from "@nextui-org/button";
import { Link } from "@nextui-org/link";
import { Tooltip } from "@nextui-org/tooltip";

import { IoEllipsisVertical } from "react-icons/io5";

import { SIDEBAR_WIDTH, models as _models } from "@/constants/chat";

import ConversationList from "./conv-list";
import ConversationConfig from "./conv-config";
import { useIsSmallScreen } from "@/hooks/useAppDataManager";

function SidebarFooter() {
  return (
    <div className="flex flex-col text-default-400 select-none -mb-1">
      <div>
        <Link
          showAnchorIcon
          color="secondary"
          size="sm"
          target="_blank"
          href="https://www.buymeacoffee.com/cch137"
        >
          Buy me a coffee
        </Link>
      </div>
      <div>
        <Link
          showAnchorIcon
          color="secondary"
          size="sm"
          target="_blank"
          href="https://api.mikugpt.top/"
        >
          Sponsored by MikuAPI
        </Link>
      </div>
    </div>
  );
}

export default function Sidebar({
  appPath,
  initConvId,
  isSidebarOpen,
  sidebarWidth,
  toggleSidebarOpen,
  closeSidebar,
}: {
  appPath: string;
  initConvId?: string;
  isSidebarOpen: boolean;
  sidebarWidth: number;
  toggleSidebarOpen: () => void;
  closeSidebar: () => void;
}) {
  const isSmallScreen = useIsSmallScreen();
  const [modelSettingOpened, setModelSettingOpened] = useState(false);
  return (
    <div
      className="chat-sidebar"
      style={{
        width: isSmallScreen ? "100dvw" : `${SIDEBAR_WIDTH}px`,
        height: "calc(100dvh - 3rem)",
        top: 0,
        left: isSmallScreen
          ? `${isSidebarOpen ? 0 : -100}dvw`
          : `${sidebarWidth - SIDEBAR_WIDTH}px`,
        zIndex: 20,
      }}
    >
      <div className="flex-1 w-full h-full overflow-x-hidden overflow-y-auto">
        <div className="flex h-full flex-col p-4 gap-2">
          <ConversationConfig
            closeSidebar={closeSidebar}
            modelSettingOpened={modelSettingOpened}
            setModelSettingOpened={setModelSettingOpened}
          />
          <div className="flex-1 bottom-b-1 w-full relative">
            <ConversationList
              closeSidebar={closeSidebar}
              initConvId={initConvId}
              modelSettingOpened={modelSettingOpened}
              appPath={appPath}
            />
          </div>
          <SidebarFooter />
        </div>
      </div>
      <div
        className="chat-sidebar-button-ctn flex-center h-0 right-0 absolute"
        style={{
          width: isSmallScreen ? (isSidebarOpen ? 0 : "2.8rem") : "1.8rem",
        }}
      >
        {isSmallScreen ? (
          <div className="bg-inherit mb-8 rounded-full overflow-hidden">
            <Tooltip content="Menu" placement="right">
              <Button isIconOnly variant="light" size="sm">
                <IoEllipsisVertical
                  className="text-default-500 text-xl"
                  onClick={toggleSidebarOpen}
                />
              </Button>
            </Tooltip>
          </div>
        ) : (
          <div
            className={(isSidebarOpen ? "opened " : "") + "chat-sidebar-button"}
            onClick={toggleSidebarOpen}
          ></div>
        )}
      </div>
    </div>
  );
}
