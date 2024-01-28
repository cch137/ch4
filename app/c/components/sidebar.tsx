'use client';

import type { Dispatch, SetStateAction } from "react";
import { useState } from "react"

import { Button } from '@nextui-org/button';
import { Link } from "@nextui-org/link";
import { Tooltip } from '@nextui-org/tooltip';

import { IoMenuOutline } from "react-icons/io5";

import { SIDEBAR_WIDTH, models as _models } from '@/constants/chat';
import type { ConvConfig, ConvItem } from "@/constants/chat/types";
import type { StatusResponse } from "@/constants/types";

import ConversationList from "./conv-list";
import ConversationConfig from "./conv-config";

function SidebarFooter() {
  return (
    <div className="flex flex-col text-default-400 select-none -mb-1">
      <div>
        <Link showAnchorIcon color="secondary" size="sm" target="_blank" href="https://www.buymeacoffee.com/cch137">
          Buy me a coffee
        </Link>
      </div>
      <div>
        <Link showAnchorIcon color="secondary" size="sm" target="_blank" href="https://chat.mikumikumi.tk/">
          Sponsored by MikuAPI
        </Link>
      </div>
    </div>
  )
}

export default function Sidebar({
  initConvId,
  isSmallScreen,
  isSidebarOpen,
  sidebarWidth,
  toggleSidebarOpen,
  closeSidebar,
}: {
  initConvId?: string,
  isSmallScreen: boolean,
  isSidebarOpen: boolean,
  sidebarWidth: number,
  toggleSidebarOpen: () => void,
  closeSidebar: () => void,
}) {
  const [modelSettingOpened, setModelSettingOpened] = useState(false);
  return (
    <div className="chat-sidebar" style={{
      width: isSmallScreen ? '100dvw' : `${SIDEBAR_WIDTH}px`,
      height: 'calc(100dvh - 3.5rem)',
      top: '3.5rem',
      left: isSmallScreen ? `${isSidebarOpen ? 0 : -100}dvw` : `${sidebarWidth-SIDEBAR_WIDTH}px`,
      zIndex: isSmallScreen ? 50 : 'auto',
    }}>
      <div className="flex-1 w-full h-full overflow-x-hidden overflow-y-auto">
        <div className="flex h-full flex-col p-4 gap-2">
          <ConversationConfig
            isSmallScreen={isSmallScreen}
            closeSidebar={closeSidebar}
            modelSettingOpened={modelSettingOpened}
            setModelSettingOpened={setModelSettingOpened}
          />
          <div className="flex-1 bottom-b-1 w-full relative">
            <ConversationList
              initConvId={initConvId}
              modelSettingOpened={modelSettingOpened}
            />
          </div>
          <SidebarFooter />
        </div>
      </div>
      <div
        className="chat-sidebar-button-ctn flex-center overflow-hidden h-full absolute right-0"
        style={{width: isSmallScreen ? isSidebarOpen ? 0 : '3.6rem' : '1.8rem'}}
      >
        {isSmallScreen
          ? <div className="bg-background mb-20 rounded-xl overflow-hidden">
            <Tooltip content="Menu" placement="right">
              <Button isIconOnly variant="bordered" color="secondary">
                <IoMenuOutline style={{scale: 1.75}} onClick={toggleSidebarOpen} />
              </Button>
            </Tooltip>
          </div>
          : <div className={(isSidebarOpen ? 'opened ' : '') + "chat-sidebar-button"} onClick={toggleSidebarOpen}></div>
        }
      </div>
    </div>
  )
}
