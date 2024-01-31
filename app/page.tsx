'use client'

import Link from 'next/link';
import { Divider } from '@nextui-org/divider'
import { Card } from '@nextui-org/card'
import { Button } from '@nextui-org/button'
import { Spacer } from '@nextui-org/spacer'
import type { IconType } from "react-icons";
import { IoChatboxEllipsesOutline, IoLogoDiscord, IoStopwatchOutline } from "react-icons/io5";
import { discordLink } from '@/constants/app';
import AppNavbar from '@/app/components/app-navbar';
import useVersion from '@/hooks/useVersion';
import { AICHAT_DESC, AICHAT_PATH } from '@/constants/chat';
import { AIASST_DESC } from '@/constants/asst';

function AppCard({ path, name, description, Icon }: { path: string, name: string, description: string, Icon: IconType }) {
  return <Card
    className="p-2 w-64 border-1 border-default-200 bg-black hover:bg-default-50 hover:-translate-y-1"
    as={Link}
    href={path}
  >
    <div className="p-2">
      <h2 className="flex items-center justify-start gap-2.5 text-2xl text-default-600 font-semibold">
        <Icon />
        <span>{name}</span>
      </h2>
    </div>
    <Divider />
    <div className="p-2 text-sm text-default-500">
      {description}
    </div>
    <Spacer y={2} />
  </Card>
}

export default function App() {
  const version = useVersion();
  return (<>
    <AppNavbar />
    <div className="flex justify-center">
      <div className="max-w-[1024px] w-full px-6 py-12">
        <h1 className="text-4xl font-semibold text-center text-default-600">AI Apps</h1>
        <div className="flex items-start justify-center gap-8 flex-wrap py-8">
          <AppCard
            name="Chat"
            path={AICHAT_PATH}
            description={AICHAT_DESC}
            Icon={IoChatboxEllipsesOutline}
          />
          <AppCard
            name="Trigger"
            path="/apps/ai-asst"
            description={AIASST_DESC}
            Icon={IoStopwatchOutline}
          />
        </div>
        <Divider className="my-4" />
        <Spacer y={12} />
        <h1 className="text-xl text-center text-default-500">Join our Discord to share your thoughts!</h1>
        <div className="flex-center py-4">
          <Button
            as={Link}
            href={discordLink}
            target="_blank"
            startContent={<span style={{scale: 1.75}}><IoLogoDiscord /></span>}
            color="secondary"
            className="text-lg font-semibold"
            variant="bordered"
            size="lg"
          >
            Join
          </Button>
        </div>
        <Spacer y={8} />
        <div className="flex-center gap-2 text-default-400 text-sm select-none">
          <span className="opacity-70">@cch137 </span>
          <span suppressHydrationWarning>{version ? `v${version}` : ''}</span>
        </div>
      </div>
    </div>
  </>)
}
